import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { useAuth } from './AuthContext';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_default?: boolean;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  createWorkspace: (name: string, description?: string, icon?: string, color?: string) => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWorkspaces = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get('/workspaces');
      const wsList: Workspace[] = res.data.workspaces || [];
      setWorkspaces(wsList);
      if (wsList.length > 0 && !activeWorkspace) {
        setActiveWorkspace(wsList[0]);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [token]);

  const createWorkspace = async (name: string, description?: string, icon?: string, color?: string) => {
    const res = await api.post('/workspaces', { name, description, icon, color });
    const newWs = res.data.workspace;
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspace(newWs);
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, setActiveWorkspace, createWorkspace, fetchWorkspaces, loading }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
};
