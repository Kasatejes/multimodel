import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { supabaseAdmin } from '../utils/supabase.js';

export async function getProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const { data: progressItems, error } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_attempted_at', { ascending: false });

    if (error) {
      console.error('[ProgressController] Error fetching progress:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch topic progress' });
      return;
    }

    res.json({ success: true, data: progressItems || [] });
  } catch (err: any) {
    console.error('[ProgressController] Get progress error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
