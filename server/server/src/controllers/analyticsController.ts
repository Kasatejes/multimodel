import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workspace_id } = req.query;

    let filesQuery = supabaseAdmin.from('files').select('id, file_type, size_bytes').eq('user_id', userId);
    let chatsQuery = supabaseAdmin.from('chats').select('id').eq('user_id', userId);
    let notesQuery = supabaseAdmin.from('notes').select('id').eq('user_id', userId);
    let quizzesQuery = supabaseAdmin.from('quizzes').select('id, score').eq('user_id', userId);
    let activityQuery = supabaseAdmin.from('activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);

    if (workspace_id) {
      filesQuery = filesQuery.eq('workspace_id', workspace_id as string);
      chatsQuery = chatsQuery.eq('workspace_id', workspace_id as string);
      notesQuery = notesQuery.eq('workspace_id', workspace_id as string);
      quizzesQuery = quizzesQuery.eq('workspace_id', workspace_id as string);
    }

    const [filesRes, chatsRes, notesRes, quizzesRes, actRes] = await Promise.all([
      filesQuery,
      chatsQuery,
      notesQuery,
      quizzesQuery,
      activityQuery
    ]);

    const files = filesRes.data || [];
    const chats = chatsRes.data || [];
    const notes = notesRes.data || [];
    const quizzes = quizzesRes.data || [];
    const activities = actRes.data || [];

    const totalStorageBytes = files.reduce((acc, curr) => acc + (Number(curr.size_bytes) || 0), 0);

    const typeBreakdown: Record<string, number> = {};
    files.forEach(f => {
      typeBreakdown[f.file_type] = (typeBreakdown[f.file_type] || 0) + 1;
    });

    const averageQuizScore = quizzes.length > 0
      ? (quizzes.reduce((acc, q) => acc + (Number(q.score) || 0), 0) / quizzes.length).toFixed(1)
      : 0;

    return res.status(200).json({
      summary: {
        total_files: files.length,
        total_chats: chats.length,
        total_notes: notes.length,
        total_quizzes: quizzes.length,
        storage_bytes: totalStorageBytes,
        storage_mb: (totalStorageBytes / (1024 * 1024)).toFixed(2),
        average_quiz_score: averageQuizScore
      },
      file_breakdown: typeBreakdown,
      recent_activities: activities
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const globalSearch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const q = ((req.query.q as string) || '').toLowerCase().trim();

    if (!q) {
      return res.status(200).json({ results: { files: [], chats: [], notes: [] } });
    }

    const [filesRes, chatsRes, notesRes] = await Promise.all([
      supabaseAdmin.from('files').select('id, name, file_type, ai_summary, public_url, created_at').eq('user_id', userId).ilike('name', `%${q}%`).limit(5),
      supabaseAdmin.from('chats').select('id, title, is_pinned, created_at').eq('user_id', userId).ilike('title', `%${q}%`).limit(5),
      supabaseAdmin.from('notes').select('id, title, content, created_at').eq('user_id', userId).ilike('title', `%${q}%`).limit(5)
    ]);

    return res.status(200).json({
      query: q,
      results: {
        files: filesRes.data || [],
        chats: chatsRes.data || [],
        notes: notesRes.data || []
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
