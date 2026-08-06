import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://hqihilzhebtaqxotwexc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_n8A1rDtqTfKE-PAgsxXw9g_QLai7TB3';

// Use valid registered key for all admin & client operations
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_secret_')
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, serviceKey);
