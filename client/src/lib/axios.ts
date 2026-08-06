import axios from 'axios';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // On Vercel, Netlify, Render, or production hosting, use relative path '/api'
    if (hostname.includes('vercel.app') || hostname.includes('render.com') || hostname.includes('netlify.app') || !hostname.includes('.')) {
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return '/api';
      }
    }
    return `http://${hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

export const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token and custom Gemini API key
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const customGeminiKey = localStorage.getItem('nexus_custom_gemini_api_key');
    if (customGeminiKey && customGeminiKey.trim()) {
      config.headers['x-gemini-api-key'] = customGeminiKey.trim();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic auth handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_user');
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);
