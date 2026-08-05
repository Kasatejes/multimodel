import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeader();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.error || `API Request Failed (${response.status})`);
  }

  return data.data;
}

export const api = {
  // Profile
  getProfile: () => fetchApi('/api/profile'),
  updateProfile: (profileData: any) => fetchApi('/api/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Dashboard
  getDashboard: () => fetchApi('/api/dashboard'),

  // Interviews
  startInterview: (setupData: any) => fetchApi('/api/interviews/start', { method: 'POST', body: JSON.stringify(setupData) }),
  listInterviews: () => fetchApi('/api/interviews'),
  getInterviewById: (id: string) => fetchApi(`/api/interviews/${id}`),
  generateNextQuestion: (id: string) => fetchApi(`/api/interviews/${id}/question`, { method: 'POST' }),
  submitAnswer: (id: string, student_answer: string) => fetchApi(`/api/interviews/${id}/answer`, { method: 'POST', body: JSON.stringify({ student_answer }) }),
  completeInterview: (id: string) => fetchApi(`/api/interviews/${id}/complete`, { method: 'POST' }),

  // Study Plans
  createStudyPlan: (sessionId?: string) => fetchApi('/api/study-plans', { method: 'POST', body: JSON.stringify({ sessionId }) }),
  listStudyPlans: () => fetchApi('/api/study-plans'),
  getStudyPlanById: (id: string) => fetchApi(`/api/study-plans/${id}`),

  // Progress
  getProgress: () => fetchApi('/api/progress'),
};
