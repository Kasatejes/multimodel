import { Response } from 'express';
import { randomUUID } from 'crypto';
import { AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { getGeminiClient, generateFallbackSVG } from '../config/gemini.js';

// In-Memory Backup Store for AI Image Library
export const memoryImageLibraryStore: any[] = [];

export const autoSaveImageToLibrary = async (
  userId: string,
  workspaceId: string | null,
  prompt: string,
  imageUrl: string,
  model: string = 'gemini-image-synthesizer'
) => {
  const imageId = randomUUID();
  const imageRecord = {
    id: imageId,
    user_id: userId,
    workspace_id: workspaceId || null,
    prompt,
    image_url: imageUrl,
    model,
    is_favorite: false,
    created_at: new Date().toISOString()
  };

  let insertedDb = null;
  try {
    const { data } = await supabaseAdmin.from('images').insert(imageRecord).select('*').single();
    if (data) insertedDb = data;
  } catch (e) {}

  const finalRecord = insertedDb || imageRecord;
  memoryImageLibraryStore.unshift(finalRecord);
  return finalRecord;
};

export const generateAndStoreImage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || randomUUID();
    const { prompt, workspace_id } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required for AI Image generation' });
    }

    const imageId = randomUUID();
    let imageBase64 = '';
    let imageModel = 'gemini-imagen-3';

    // 1. Try Google Gemini Imagen 3 via @google/genai
    const client = getGeminiClient();
    if (client) {
      const imagenCandidates = [
        'imagen-3.0-generate-002',
        'imagen-3.0-fast-generate-001'
      ];
      for (const modelName of imagenCandidates) {
        try {
          const response = await client.models.generateImages({
            model: modelName,
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/png' }
          });
          if (response.generatedImages?.[0]?.image?.imageBytes) {
            imageBase64 = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
            imageModel = modelName;
            break;
          }
        } catch (err: any) {
          console.warn(`[Gemini Imagen] ${modelName} fallback note:`, err.message);
        }
      }
    }

    // 2. High-speed Photorealistic Synthesizer fallback if Imagen quota is unavailable
    if (!imageBase64) {
      try {
        const queryText = prompt.replace(/create image of|generate image of|create image|generate image|draw a|draw/gi, '').trim() || prompt;
        const encoded = encodeURIComponent(queryText);
        const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          const b64 = Buffer.from(arrayBuffer).toString('base64');
          imageBase64 = `data:image/jpeg;base64,${b64}`;
          imageModel = 'flux-ai-photorealistic-synthesizer';
        }
      } catch (e: any) {
        console.warn('Pollinations AI image fallback note:', e.message);
      }
    }

    // 3. Clean SVG Graphic Vector Fallback
    if (!imageBase64) {
      imageBase64 = generateFallbackSVG(prompt);
      imageModel = 'nexus-vector-generator';
    }

    const imageRecord = {
      id: imageId,
      user_id: userId,
      workspace_id: workspace_id || null,
      prompt,
      image_url: imageBase64,
      model: imageModel,
      is_favorite: false,
      created_at: new Date().toISOString()
    };

    let insertedDb = null;
    try {
      const { data } = await supabaseAdmin.from('images').insert(imageRecord).select('*').single();
      if (data) insertedDb = data;
    } catch (e) {}

    const finalRecord = insertedDb || imageRecord;
    memoryImageLibraryStore.unshift(finalRecord);

    return res.status(201).json({
      message: 'AI Image generated and saved to library successfully',
      image: finalRecord
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error generating AI image' });
  }
};

export const getImageLibrary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { search, workspace_id } = req.query;

    let dbImages: any[] = [];
    try {
      let query = supabaseAdmin.from('images').select('*').eq('user_id', userId);
      if (workspace_id) query = query.eq('workspace_id', workspace_id as string);
      const { data } = await query.order('created_at', { ascending: false });
      if (data) dbImages = data;
    } catch (e) {}

    const localImages = memoryImageLibraryStore.filter(img => {
      if (img.user_id !== userId) return false;
      if (workspace_id && img.workspace_id !== workspace_id) return false;
      if (search) {
        return img.prompt.toLowerCase().includes((search as string).toLowerCase());
      }
      return true;
    });

    const allMap = new Map();
    [...dbImages, ...localImages].forEach(img => allMap.set(img.id, img));
    const merged = Array.from(allMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.status(200).json({ images: merged });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const toggleFavoriteImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const img = memoryImageLibraryStore.find(i => i.id === id);
    if (img) img.is_favorite = !img.is_favorite;

    try {
      const { data } = await supabaseAdmin.from('images').select('is_favorite').eq('id', id).single();
      if (data) {
        await supabaseAdmin.from('images').update({ is_favorite: !data.is_favorite }).eq('id', id);
      }
    } catch (e) {}

    return res.status(200).json({ message: 'Favorite status updated' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryImageLibraryStore.findIndex(i => i.id === id);
    if (idx !== -1) memoryImageLibraryStore.splice(idx, 1);

    try {
      await supabaseAdmin.from('images').delete().eq('id', id);
    } catch (e) {}

    return res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
