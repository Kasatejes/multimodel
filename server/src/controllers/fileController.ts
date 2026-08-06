import { Response } from 'express';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParse = typeof pdfParseModule === 'function' ? pdfParseModule : pdfParseModule?.default || pdfParseModule;
import mammoth from 'mammoth';
import { AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { ai, defaultModel } from '../config/gemini.js';

// In-Memory Backup Store for uploaded files
export const memoryFilesStore: any[] = [];

// Helper to determine bucket name based on mimetype
const getStorageBucket = (mimeType: string, filename: string): string => {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'videos';
  return 'documents';
};

// Helper to classify file category
const getFileTypeCategory = (mimeType: string, filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext || '')) return 'image';
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'webm'].includes(ext || '')) return 'audio';
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext || '')) return 'video';
  if (ext === 'pdf' || mimeType.includes('pdf')) return 'pdf';
  if (ext === 'docx' || mimeType.includes('word')) return 'docx';
  if (ext === 'pptx' || mimeType.includes('presentation')) return 'pptx';
  if (ext === 'csv' || mimeType.includes('csv')) return 'csv';
  return 'txt';
};

// Parse text contents from uploaded document buffer
const extractTextFromBuffer = async (buffer: Buffer, fileType: string): Promise<string> => {
  try {
    if (fileType === 'pdf') {
      const data = typeof pdfParse === 'function' ? await pdfParse(buffer) : { text: '' };
      return data.text || '';
    }
    if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    }
    if (fileType === 'txt' || fileType === 'csv') {
      return buffer.toString('utf-8');
    }
  } catch (err) {
    console.error('Error extracting text:', err);
  }
  return '';
};

export const uploadFiles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || randomUUID();
    const workspaceId = req.body.workspace_id || null;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }

    const processedFiles = [];

    for (const file of files) {
      const fileType = getFileTypeCategory(file.mimetype, file.originalname);
      const storageBucket = getStorageBucket(file.mimetype, file.originalname);
      const fileUuid = randomUUID();
      const storagePath = `${userId}/${fileUuid}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Extract text content if document
      let parsedText = await extractTextFromBuffer(file.buffer, fileType);
      
      // Upload to Supabase Storage
      let publicUrl = '';
      try {
        const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
          .from(storageBucket)
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (!uploadErr) {
          const { data: urlData } = supabaseAdmin.storage.from(storageBucket).getPublicUrl(storagePath);
          publicUrl = urlData.publicUrl;
        } else {
          publicUrl = `https://nexus-ai-storage.local/${storageBucket}/${storagePath}`;
        }
      } catch (e) {
        publicUrl = `https://nexus-ai-storage.local/${storageBucket}/${storagePath}`;
      }

      // Generate initial AI summary if text content is available
      let aiSummary = '';
      if (parsedText && parsedText.trim().length > 30) {
        if (ai) {
          try {
            const prompt = `Provide a concise, key-point summary of the following uploaded document content:\n\n${parsedText.substring(0, 4000)}`;
            const response = await ai.models.generateContent({
              model: defaultModel,
              contents: prompt
            });
            aiSummary = response.text || '';
          } catch (e) {
            aiSummary = `Document containing ${parsedText.split(/\s+/).length} words.`;
          }
        } else {
          aiSummary = `Document summary (${file.originalname}): ${parsedText.substring(0, 180)}...`;
        }
      } else {
        aiSummary = `Multimodal ${fileType.toUpperCase()} file (${file.originalname}). Ready for AI analysis.`;
      }

      // Save file record
      const fileRecord = {
        id: fileUuid,
        user_id: userId,
        workspace_id: workspaceId,
        name: file.originalname,
        original_name: file.originalname,
        file_type: fileType,
        mime_type: file.mimetype,
        size_bytes: file.size,
        storage_bucket: storageBucket,
        storage_path: storagePath,
        public_url: publicUrl,
        parsed_text: parsedText || null,
        ai_summary: aiSummary,
        created_at: new Date().toISOString(),
        metadata: {
          word_count: parsedText ? parsedText.split(/\s+/).length : 0,
          uploaded_at: new Date().toISOString()
        }
      };

      let insertedFile = null;
      try {
        const { data, error: insertErr } = await supabaseAdmin
          .from('files')
          .insert(fileRecord)
          .select('*')
          .single();
        if (data) insertedFile = data;
      } catch (e) {}

      const finalRecord = insertedFile || fileRecord;
      memoryFilesStore.unshift(finalRecord);
      processedFiles.push(finalRecord);
    }

    return res.status(201).json({
      message: `${processedFiles.length} file(s) uploaded successfully`,
      files: processedFiles
    });
  } catch (error: any) {
    console.error('File Upload Controller Error:', error);
    return res.status(500).json({ error: error.message || 'Error processing file upload' });
  }
};

export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workspace_id, file_type } = req.query;

    let dbFiles: any[] = [];
    try {
      let query = supabaseAdmin.from('files').select('*').eq('user_id', userId);
      if (workspace_id) {
        query = query.eq('workspace_id', workspace_id as string);
      }
      if (file_type) {
        query = query.eq('file_type', file_type as string);
      }
      const { data } = await query.order('created_at', { ascending: false });
      if (data) dbFiles = data;
    } catch (e) {}

    const localFiles = memoryFilesStore.filter(f => f.user_id === userId && (!workspace_id || f.workspace_id === workspace_id) && (!file_type || f.file_type === file_type));
    const allFilesMap = new Map();
    [...dbFiles, ...localFiles].forEach(f => allFilesMap.set(f.id, f));
    const mergedFiles = Array.from(allFilesMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.status(200).json({ files: mergedFiles });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getFileById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const { data: file, error } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !file) {
      return res.status(404).json({ error: 'File not found' });
    }

    return res.status(200).json({ file });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const { data: file } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (file) {
      // Remove from storage bucket
      await supabaseAdmin.storage.from(file.storage_bucket).remove([file.storage_path]);
      // Remove database record
      await supabaseAdmin.from('files').delete().eq('id', id);
    }

    return res.status(200).json({ message: 'File deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const toggleFavoriteFile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const { data: file } = await supabaseAdmin
      .from('files')
      .select('is_favorite, name')
      .eq('id', id)
      .single();

    if (!file) return res.status(404).json({ error: 'File not found' });

    const newFav = !file.is_favorite;

    await supabaseAdmin
      .from('files')
      .update({ is_favorite: newFav })
      .eq('id', id)
      .eq('user_id', userId);

    if (newFav) {
      await supabaseAdmin.from('favorites').insert({
        user_id: userId,
        item_type: 'file',
        item_id: id,
        title: file.name
      });
    } else {
      await supabaseAdmin.from('favorites').delete().eq('user_id', userId).eq('item_type', 'file').eq('item_id', id);
    }

    return res.status(200).json({ is_favorite: newFav });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
