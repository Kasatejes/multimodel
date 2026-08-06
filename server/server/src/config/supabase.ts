import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://hqihilzhebtaqxotwexc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_n8A1rDtqTfKE-PAgsxXw9g_QLai7TB3';

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_secret_')
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : supabaseAnonKey;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
    },
    realtime: {
      transport: WebSocket,
    },
    ws: WebSocket,
  } as any
);

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceKey,
  {
    auth: {
      persistSession: false,
    },
    realtime: {
      transport: WebSocket,
    },
    ws: WebSocket,
  } as any
);
