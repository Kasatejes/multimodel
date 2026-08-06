# Nexus AI – Multimodal Intelligence Workspace

Nexus AI is a premium, production-ready full-stack AI application where users can upload PDFs, images, audio, videos, documents, and spreadsheets, then interact with Google Gemini AI for contextual chat, auto-summarization, note generation, flashcard creation, interactive quizzes, interview preparation, and action item timelines.

---

## Features

- 🔐 **JWT & bcrypt Authentication**: Secure registration, login, profile management, and session management.
- 📂 **Multi-Tenant Workspaces**: Separate project environments, isolated chat histories, and file collections.
- 📄 **Multimodal File Support**: Upload PDF, Images (PNG/JPG/WEBP), Audio (MP3/WAV/OGG), Video (MP4/WebM), DOCX, PPTX, TXT, and CSV up to 50MB per file.
- 🗄️ **Supabase Storage & PostgreSQL**: Store raw files in dedicated Supabase buckets (`documents`, `images`, `audio`, `videos`, `exports`) and metadata in PostgreSQL.
- 🧠 **Google Gemini Multimodal AI**: Natural language chat with full contextual understanding of attached workspace documents.
- ⚡ **Study & Productivity Suite**:
  - **AI Summarizer**: Instant multi-paragraph executive summaries.
  - **Notes Generator**: Formatted markdown notes with key concepts and formulas.
  - **Interactive 3D Flashcards**: Flip cards for active recall.
  - **MCQ Quiz Engine**: Auto-generated interactive quizzes with explanations and scoring.
  - **Technical Interview Prep**: Domain-specific questions with model answers and tips.
  - **Action Timeline**: Chronological milestone and task extraction.
- 🔍 **Global Search (Ctrl + K)**: Instant command search across all files, chat threads, and notes.
- 📊 **Analytics Dashboard**: Document type distribution, storage usage, quiz performance metrics, and activity audit logs.
- 🎨 **Black + Purple Glow Glassmorphic UI**: Ultra-modern aesthetic built with React 18, Tailwind CSS, Lucide Icons, and Framer Motion.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Axios, React Router v6, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, Multer, JWT, bcryptjs, Zod |
| **AI Engine** | Google Gemini API (`@google/genai`) |
| **Database & Storage** | Supabase PostgreSQL, Supabase Storage |
| **Deployment** | Vercel (Frontend), Render (Backend), Supabase Cloud |

---

## Project Structure

```
nexus-ai-workspace/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, FileUploadModal, GlobalSearchModal, CreateWorkspaceModal
│   │   ├── context/            # AuthContext, WorkspaceContext
│   │   ├── lib/                # Axios API client setup with JWT interceptors
│   │   ├── pages/              # AuthPage, DashboardPage, ChatWorkspacePage, FileManagerPage, StudyHubPage, AnalyticsPage, FavoritesPage, ProfilePage
│   │   ├── App.tsx             # Protected routing & workspace layout
│   │   ├── index.css           # Glassmorphism utilities & purple glow styling
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # Supabase & Google Gemini AI clients
│   │   ├── controllers/        # Auth, Workspace, File, AI, Chat, Study, Analytics
│   │   ├── middleware/         # Auth JWT verification & Multer file upload
│   │   ├── routes/             # Express API routes
│   │   ├── app.ts              # Express setup, CORS, Helmet, Rate Limiter
│   │   └── server.ts           # Server listener
│   ├── .env.example
│   └── package.json
└── supabase/
    └── migrations/
        └── 002_nexus_ai_schema.sql # Complete Database Schema & RLS policies
```

---

## Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=nexus_ai_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Supabase Database & Storage Setup

1. Log in to [Supabase Dashboard](https://supabase.com).
2. Open **SQL Editor** and run the contents of `supabase/migrations/002_nexus_ai_schema.sql`.
3. Open **Storage** and create the following **Public Buckets**:
   - `avatars`
   - `documents`
   - `images`
   - `audio`
   - `videos`
   - `exports`

---

## Local Development Instructions

### 1. Install All Dependencies

```bash
npm run install:all
```

### 2. Configure Environment Files

Create `server/.env` and `client/.env` files using the provided `.env.example` templates.

### 3. Run Development Servers

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

---

## Production Deployment Guide

### Backend Deployment (Render)

1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Web Service** with directory `server`.
3. Set Build Command: `npm run build`
4. Set Start Command: `npm start`
5. Add Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Frontend Deployment (Vercel)

1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory: `client`
3. Set Framework Preset: `Vite`
4. Add Environment Variable:
   - `VITE_API_URL=https://your-render-backend-url.onrender.com/api`
   - `VITE_SUPABASE_URL=https://your-supabase-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`
5. Deploy!

---

## License

MIT License. Built for **Nexus AI – Multimodal Intelligence Workspace**.
