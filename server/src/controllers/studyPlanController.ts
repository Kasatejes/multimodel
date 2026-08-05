import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { supabaseAdmin } from '../utils/supabase.js';
import { generateStudyPlan } from '../services/geminiService.js';

export async function createStudyPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.body;

    // Fetch profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    let weakAreas: string[] = profile?.weak_technologies || [];
    let targetRole: string = profile?.target_role || 'Full-Stack Developer';

    // If sessionId provided, grab session weak_areas & target_role
    if (sessionId) {
      const { data: session } = await supabaseAdmin
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (session) {
        targetRole = session.target_role;
        if (session.weak_areas && Array.isArray(session.weak_areas)) {
          weakAreas = Array.from(new Set([...weakAreas, ...session.weak_areas]));
        }
      }
    }

    if (weakAreas.length === 0) {
      weakAreas = ['Core Fundamentals', 'Problem Solving', 'System Architecture'];
    }

    // Call Gemini to generate 7-day plan
    const generatedPlan = await generateStudyPlan({
      target_role: targetRole,
      experience_level: profile?.experience_level || 'Beginner',
      weak_areas: weakAreas,
      daily_time: profile?.daily_preparation_minutes || 60,
    });

    // Save to database
    const { data: savedPlan, error } = await supabaseAdmin
      .from('study_plans')
      .insert({
        user_id: userId,
        session_id: sessionId || null,
        plan_title: generatedPlan.plan_title,
        plan_content: generatedPlan,
      })
      .select()
      .single();

    if (error) {
      console.error('[StudyPlanController] Save error:', error);
      res.status(500).json({ success: false, error: 'Failed to save study plan' });
      return;
    }

    res.json({ success: true, data: savedPlan });
  } catch (err: any) {
    console.error('[StudyPlanController] Create error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate study plan' });
  }
}

export async function listStudyPlans(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const { data: plans, error } = await supabaseAdmin
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, error: 'Failed to list study plans' });
      return;
    }

    res.json({ success: true, data: plans || [] });
  } catch (err: any) {
    console.error('[StudyPlanController] List error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getStudyPlanById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const planId = req.params.id;

    const { data: plan, error } = await supabaseAdmin
      .from('study_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error || !plan) {
      res.status(404).json({ success: false, error: 'Study plan not found' });
      return;
    }

    if (plan.user_id !== userId) {
      res.status(403).json({ success: false, error: 'Forbidden: Access denied' });
      return;
    }

    res.json({ success: true, data: plan });
  } catch (err: any) {
    console.error('[StudyPlanController] Get plan error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
