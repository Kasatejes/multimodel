import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or malformed authorization header',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Empty token',
      });
      return;
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired token',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err: any) {
    console.error('[AuthMiddleware] Error during token verification:', err);
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication verification failed',
    });
  }
}
