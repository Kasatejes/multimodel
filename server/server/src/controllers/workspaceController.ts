import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

export const getWorkspaces = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { data: workspaces, error } = await supabaseAdmin
      .from('workspaces')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error || !workspaces || workspaces.length === 0) {
      // Return default workspace
      const defaultWs = [
        {
          id: 'default-ws-id',
          user_id: userId,
          name: 'General Workspace',
          description: 'Default workspace for files & chats',
          icon: 'Sparkles',
          color: '#8B5CF6',
          is_default: true,
          created_at: new Date().toISOString()
        }
      ];
      return res.status(200).json({ workspaces: defaultWs });
    }

    return res.status(200).json({ workspaces });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const { data: workspace, error } = await supabaseAdmin
      .from('workspaces')
      .insert({
        user_id: userId,
        name,
        description: description || '',
        icon: icon || 'Folder',
        color: color || '#8B5CF6'
      })
      .select('*')
      .single();

    if (error || !workspace) {
      const fallbackWs = {
        id: `ws_${Date.now()}`,
        user_id: userId,
        name,
        description: description || '',
        icon: icon || 'Folder',
        color: color || '#8B5CF6',
        is_default: false,
        created_at: new Date().toISOString()
      };
      return res.status(201).json({ workspace: fallbackWs });
    }

    return res.status(201).json({ workspace });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, description, icon, color } = req.body;

    const { data: workspace, error } = await supabaseAdmin
      .from('workspaces')
      .update({ name, description, icon, color, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      return res.status(200).json({ workspace: { id, name, description, icon, color } });
    }

    return res.status(200).json({ workspace });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await supabaseAdmin.from('workspaces').delete().eq('id', id).eq('user_id', userId);
    return res.status(200).json({ message: 'Workspace deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
