import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { supabaseAdmin } from '../utils/supabase.js';

export async function getDashboardData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    // 1. Fetch user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. Fetch completed interviews
    const { data: sessions } = await supabaseAdmin
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const totalInterviews = sessions?.length || 0;
    const completedSessions = sessions?.filter((s) => s.status === 'completed') || [];

    const averageScore =
      completedSessions.length > 0
        ? Math.round(
            (completedSessions.reduce((acc, curr) => acc + (Number(curr.overall_score) || 0), 0) /
              completedSessions.length) *
              10
          ) / 10
        : 0;

    // 3. Fetch topic progress
    const { data: progressList } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('average_score', { ascending: true });

    const weakTopics = progressList ? progressList.filter((p) => Number(p.average_score) < 7).map((p) => p.topic) : [];

    // 4. Fetch latest study plan
    const { data: latestStudyPlan } = await supabaseAdmin
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    res.json({
      success: true,
      data: {
        profile,
        metrics: {
          totalInterviews,
          completedInterviews: completedSessions.length,
          averageScore,
          weakTopics,
        },
        recentSessions: sessions ? sessions.slice(0, 5) : [],
        latestStudyPlan: latestStudyPlan || null,
      },
    });
  } catch (err: any) {
    console.error('[DashboardController] Get dashboard error:', err);
    res.status(500).json({ success: false, error: 'Internal server error while loading dashboard' });
  }
}
