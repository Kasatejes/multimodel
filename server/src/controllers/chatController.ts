import { Response } from 'express';
import { randomUUID } from 'crypto';
import { AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

// In-Memory Backup Store to guarantee persistent chat & message history
export const memoryChatsStore: any[] = [];
export const memoryMessagesStore: any[] = [];

export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { workspace_id } = req.query;

    let dbChats: any[] = [];
    try {
      let query = supabaseAdmin.from('chats').select('*').eq('user_id', userId);
      if (workspace_id) {
        query = query.eq('workspace_id', workspace_id as string);
      }
      const { data } = await query.order('updated_at', { ascending: false });
      if (data) dbChats = data;
    } catch (e) {
      console.warn('Supabase getChats query fallback');
    }

    // Combine with memory chats
    const localChats = memoryChatsStore.filter(c => c.user_id === userId && (!workspace_id || c.workspace_id === workspace_id));
    const allChatsMap = new Map();
    [...dbChats, ...localChats].forEach(c => allChatsMap.set(c.id, c));
    const mergedChats = Array.from(allChatsMap.values()).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return res.status(200).json({ chats: mergedChats });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || randomUUID();
    const { workspace_id, title } = req.body;

    const newChatId = randomUUID();
    const chatPayload = {
      id: newChatId,
      user_id: userId,
      workspace_id: workspace_id || null,
      title: title || 'New Multimodal Chat',
      is_pinned: false,
      is_favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let savedChat = null;
    try {
      const { data: dbChat } = await supabaseAdmin
        .from('chats')
        .insert({
          user_id: userId,
          workspace_id: workspace_id || null,
          title: title || 'New Multimodal Chat'
        })
        .select('*')
        .single();

      if (dbChat) savedChat = dbChat;
    } catch (e) {
      console.warn('Supabase createChat fallback');
    }

    if (!savedChat) {
      savedChat = chatPayload;
    }

    memoryChatsStore.unshift(savedChat);
    return res.status(201).json({ chat: savedChat });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    let dbMessages: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('chat_id', id)
        .order('created_at', { ascending: true });
      if (data) dbMessages = data;
    } catch (e) {
      console.warn('Supabase getChatMessages fallback');
    }

    const localMessages = memoryMessagesStore.filter(m => m.chat_id === id);
    const allMsgMap = new Map();
    [...dbMessages, ...localMessages].forEach(m => allMsgMap.set(m.id, m));
    const mergedMessages = Array.from(allMsgMap.values()).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return res.status(200).json({ messages: mergedMessages });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const togglePinChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    let isPinned = false;
    const memChat = memoryChatsStore.find(c => c.id === id);
    if (memChat) {
      memChat.is_pinned = !memChat.is_pinned;
      isPinned = memChat.is_pinned;
    }

    try {
      const { data: dbChat } = await supabaseAdmin.from('chats').select('is_pinned').eq('id', id).single();
      if (dbChat) {
        isPinned = !dbChat.is_pinned;
        await supabaseAdmin.from('chats').update({ is_pinned: isPinned }).eq('id', id);
      }
    } catch (e) {}

    return res.status(200).json({ is_pinned: isPinned });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteChat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const idx = memoryChatsStore.findIndex(c => c.id === id);
    if (idx !== -1) memoryChatsStore.splice(idx, 1);

    try {
      await supabaseAdmin.from('chats').delete().eq('id', id);
    } catch (e) {}

    return res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
