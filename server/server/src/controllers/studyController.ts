import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workspace_id } = req.query;

    let query = supabaseAdmin.from('notes').select('*').eq('user_id', userId);
    if (workspace_id) query = query.eq('workspace_id', workspace_id as string);

    const { data: notes } = await query.order('created_at', { ascending: false });
    return res.status(200).json({ notes: notes || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workspace_id } = req.query;

    let query = supabaseAdmin.from('flashcards').select('*').eq('user_id', userId);
    if (workspace_id) query = query.eq('workspace_id', workspace_id as string);

    const { data: decks } = await query.order('created_at', { ascending: false });
    return res.status(200).json({ decks: decks || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workspace_id } = req.query;

    let query = supabaseAdmin.from('quizzes').select('*').eq('user_id', userId);
    if (workspace_id) query = query.eq('workspace_id', workspace_id as string);

    const { data: quizzes } = await query.order('created_at', { ascending: false });
    return res.status(200).json({ quizzes: quizzes || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workspace_id } = req.query;

    let query = supabaseAdmin.from('interviews').select('*').eq('user_id', userId);
    if (workspace_id) query = query.eq('workspace_id', workspace_id as string);

    const { data: interviews } = await query.order('created_at', { ascending: false });
    return res.status(200).json({ interviews: interviews || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getTimelines = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workspace_id } = req.query;

    let query = supabaseAdmin.from('timelines').select('*').eq('user_id', userId);
    if (workspace_id) query = query.eq('workspace_id', workspace_id as string);

    const { data: timelines } = await query.order('created_at', { ascending: false });
    return res.status(200).json({ timelines: timelines || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const submitQuizScore = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { score } = req.body;

    await supabaseAdmin
      .from('quizzes')
      .update({ score, completed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    return res.status(200).json({ message: 'Quiz score submitted successfully', score });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const { data: favorites } = await supabaseAdmin
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return res.status(200).json({ favorites: favorites || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
