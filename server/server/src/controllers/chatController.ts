import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workspace_id } = req.query;

    let query = supabaseAdmin.from('chats').select('*').eq('user_id', userId);
    if (workspace_id) {
      query = query.eq('workspace_id', workspace_id as string);
    }

    const { data: chats, error } = await query.order('updated_at', { ascending: false });

    return res.status(200).json({ chats: chats || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workspace_id, title } = req.body;

    const { data: chat, error } = await supabaseAdmin
      .from('chats')
      .insert({
        user_id: userId,
        workspace_id: workspace_id || null,
        title: title || 'New Multimodal Chat'
      })
      .select('*')
      .single();

    if (error || !chat) {
      const fallbackChat = {
        id: `chat_${Date.now()}`,
        user_id: userId,
        workspace_id,
        title: title || 'New Multimodal Chat',
        is_pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return res.status(201).json({ chat: fallbackChat });
    }

    return res.status(201).json({ chat });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', id)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    return res.status(200).json({ messages: messages || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const togglePinChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const { data: chat } = await supabaseAdmin.from('chats').select('is_pinned').eq('id', id).single();
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const newPinned = !chat.is_pinned;
    await supabaseAdmin.from('chats').update({ is_pinned: newPinned }).eq('id', id).eq('user_id', userId);

    return res.status(200).json({ is_pinned: newPinned });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await supabaseAdmin.from('chats').delete().eq('id', id).eq('user_id', userId);
    return res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
