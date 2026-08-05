import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { supabaseAdmin } from '../utils/supabase.js';
import { profileSchema } from '../validation/schemas.js';

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[ProfileController] Error fetching profile:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
      return;
    }

    if (!profile) {
      // Return default initial profile state
      res.json({
        success: true,
        data: {
          id: userId,
          full_name: '',
          email: req.user?.email || '',
          target_role: 'Frontend Developer',
          experience_level: 'Beginner',
          preferred_difficulty: 'Easy',
          known_technologies: [],
          weak_technologies: [],
          daily_preparation_minutes: 60,
          role: 'student',
          onboarding_completed: false,
        },
      });
      return;
    }

    res.json({ success: true, data: profile });
  } catch (err: any) {
    console.error('[ProfileController] Get profile error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const validation = profileSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: validation.error.format(),
      });
      return;
    }

    const profileData = {
      id: userId,
      ...validation.data,
      email: validation.data.email || req.user?.email || '',
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();

    if (error) {
      console.error('[ProfileController] Error updating profile:', error);
      res.status(500).json({ success: false, error: 'Failed to update user profile' });
      return;
    }

    res.json({ success: true, data: updatedProfile });
  } catch (err: any) {
    console.error('[ProfileController] Update profile error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
