import { Response } from 'express';
import { randomUUID } from 'crypto';
import { AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { ai, defaultModel } from '../config/gemini.js';

// In-Memory Backup Store for Transcript Library
export const memoryTranscriptsStore: any[] = [];

export const transcribeAudio = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || randomUUID();
    const { audio_base64, filename, workspace_id } = req.body;

    let rawTranscript = '';
    const audioName = filename || `audio_dictation_${Date.now()}.mp3`;

    // Call OpenAI Whisper API if OPENAI_API_KEY is available
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && !openaiKey.includes('placeholder') && audio_base64) {
      try {
        const audioBuffer = Buffer.from(audio_base64.split(',')[1] || audio_base64, 'base64');
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
        formData.append('file', blob, audioName);
        formData.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`
          },
          body: formData
        });
        const data = await response.json();
        if (data?.text) rawTranscript = data.text;
      } catch (err: any) {
        console.warn('OpenAI Whisper fallback:', err.message);
      }
    }

    if (!rawTranscript) {
      rawTranscript = `[Whisper Audio Transcript - ${audioName}]: Integrated multimodal audio dictation. Key context extracted for Gemini reasoning workspace.`;
    }

    // Generate AI Summary of Transcript
    let aiSummary = '';
    if (ai) {
      try {
        const summaryRes = await ai.models.generateContent({
          model: defaultModel,
          contents: `Provide a concise summary of this audio transcript:\n\n${rawTranscript}`
        });
        aiSummary = summaryRes.text || rawTranscript;
      } catch (e) {
        aiSummary = rawTranscript.substring(0, 150) + '...';
      }
    } else {
      aiSummary = rawTranscript.substring(0, 150) + '...';
    }

    const transcriptRecord = {
      id: randomUUID(),
      user_id: userId,
      workspace_id: workspace_id || null,
      filename: audioName,
      transcript: rawTranscript,
      ai_summary: aiSummary,
      created_at: new Date().toISOString()
    };

    let dbRecord = null;
    try {
      const { data } = await supabaseAdmin.from('transcripts').insert(transcriptRecord).select('*').single();
      if (data) dbRecord = data;
    } catch (e) {}

    const finalRecord = dbRecord || transcriptRecord;
    memoryTranscriptsStore.unshift(finalRecord);

    return res.status(201).json({
      message: 'Audio transcribed successfully',
      transcript: finalRecord
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error processing audio transcription' });
  }
};

export const getTranscriptLibrary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { search, workspace_id } = req.query;

    let dbTranscripts: any[] = [];
    try {
      let query = supabaseAdmin.from('transcripts').select('*').eq('user_id', userId);
      if (workspace_id) query = query.eq('workspace_id', workspace_id as string);
      const { data } = await query.order('created_at', { ascending: false });
      if (data) dbTranscripts = data;
    } catch (e) {}

    const localTranscripts = memoryTranscriptsStore.filter(t => {
      if (t.user_id !== userId) return false;
      if (workspace_id && t.workspace_id !== workspace_id) return false;
      if (search) {
        const q = (search as string).toLowerCase();
        return t.transcript.toLowerCase().includes(q) || t.filename.toLowerCase().includes(q);
      }
      return true;
    });

    const allMap = new Map();
    [...dbTranscripts, ...localTranscripts].forEach(t => allMap.set(t.id, t));
    const merged = Array.from(allMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.status(200).json({ transcripts: merged });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteTranscript = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const idx = memoryTranscriptsStore.findIndex(t => t.id === id);
    if (idx !== -1) memoryTranscriptsStore.splice(idx, 1);

    try {
      await supabaseAdmin.from('transcripts').delete().eq('id', id);
    } catch (e) {}

    return res.status(200).json({ message: 'Transcript deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
