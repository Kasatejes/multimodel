import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/axios';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  avatar_url?: string;
  bio?: string;
  storage_used_bytes?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { full_name?: string; bio?: string; avatar_url?: string }) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github', email?: string, full_name?: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ message: string; reset_token?: string }>;
  confirmPasswordReset: (email: string, reset_token: string, new_password: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexus_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.user);
          localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
        } catch (e) {
          console.error('Failed to verify user profile:', e);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('nexus_token', newToken);
    localStorage.setItem('nexus_user', JSON.stringify(newUser));
  };

  const register = async (email: string, password: string, full_name: string) => {
    const res = await api.post('/auth/register', { email, password, full_name });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('nexus_token', newToken);
    localStorage.setItem('nexus_user', JSON.stringify(newUser));
  };

  const loginWithOAuth = async (provider: 'google' | 'github', email?: string, full_name?: string) => {
    const mockEmail = email || `${provider}_user_${Math.floor(Math.random() * 1000)}@example.com`;
    const mockName = full_name || `${provider.toUpperCase()} User`;

    const res = await api.post('/auth/oauth', {
      provider,
      email: mockEmail,
      full_name: mockName,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(mockName)}`
    });

    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('nexus_token', newToken);
    localStorage.setItem('nexus_user', JSON.stringify(newUser));
  };

  const requestPasswordReset = async (email: string) => {
    const res = await api.post('/auth/password-reset-request', { email });
    return res.data;
  };

  const confirmPasswordReset = async (email: string, reset_token: string, new_password: string) => {
    const res = await api.post('/auth/password-reset-confirm', { email, reset_token, new_password });
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
  };

  const updateProfile = async (data: { full_name?: string; bio?: string; avatar_url?: string }) => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data.user);
    localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        loginWithOAuth,
        requestPasswordReset,
        confirmPasswordReset
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
