-- ==========================================
-- Nexus AI: Multimodal Intelligence Workspace
-- Complete Database Schema & RLS Policies
-- Migration File: 002_nexus_ai_schema.sql
-- ==========================================

-- Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  full_name text not null,
  avatar_url text,
  role text default 'user',
  bio text,
  storage_used_bytes bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. WORKSPACES TABLE
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  icon text default 'Folder',
  color text default '#8B5CF6',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. FILES TABLE
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  original_name text not null,
  file_type text not null, -- pdf, image, audio, video, docx, pptx, txt, csv
  mime_type text not null,
  size_bytes bigint not null,
  storage_bucket text not null, -- documents, images, audio, videos, exports
  storage_path text not null,
  public_url text,
  parsed_text text,
  ai_summary text,
  metadata jsonb default '{}'::jsonb,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- 4. CHATS TABLE
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  title text not null default 'New Multimodal Chat',
  is_pinned boolean default false,
  is_favorite boolean default false,
  model_used text default 'gemini-2.5-flash',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. MESSAGES TABLE
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('user', 'model', 'system')),
  content text not null,
  attachments jsonb default '[]'::jsonb, -- [{ file_id, name, file_type, url }]
  tokens_used integer default 0,
  created_at timestamptz default now()
);

-- 6. NOTES TABLE
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  file_id uuid references public.files(id) on delete set null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. FLASHCARDS TABLE
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  file_id uuid references public.files(id) on delete set null,
  deck_title text not null,
  cards jsonb not null, -- [{ question, answer, difficulty }]
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- 8. QUIZZES TABLE
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  file_id uuid references public.files(id) on delete set null,
  title text not null,
  questions jsonb not null, -- [{ id, question, options, correct_index, explanation }]
  score numeric,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- 9. INTERVIEWS TABLE
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  file_id uuid references public.files(id) on delete set null,
  role_target text not null,
  questions jsonb not null, -- [{ id, question, model_answer, tips }]
  created_at timestamptz default now()
);

-- 10. TIMELINES TABLE
create table if not exists public.timelines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  file_id uuid references public.files(id) on delete set null,
  title text not null,
  action_items jsonb not null, -- [{ task, assignee, due_date, status }]
  milestones jsonb not null, -- [{ date, event, description }]
  created_at timestamptz default now()
);

-- 11. FAVORITES TABLE
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  item_type text not null, -- file, chat, note, flashcard, quiz
  item_id uuid not null,
  title text not null,
  created_at timestamptz default now(),
  unique(user_id, item_type, item_id)
);

-- 12. ACTIVITY LOGS TABLE
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  action text not null, -- file_upload, chat_created, quiz_generated, etc.
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- INDEXES FOR SPEED
create index if not exists idx_files_user on public.files(user_id);
create index if not exists idx_files_workspace on public.files(workspace_id);
create index if not exists idx_chats_user on public.chats(user_id);
create index if not exists idx_messages_chat on public.messages(chat_id);
create index if not exists idx_notes_user on public.notes(user_id);
create index if not exists idx_activity_user on public.activity_logs(user_id);
