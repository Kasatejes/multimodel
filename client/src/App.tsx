import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';

import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatWorkspacePage } from './pages/ChatWorkspacePage';
import { StudyHubPage } from './pages/StudyHubPage';
import { ImageLibraryPage } from './pages/ImageLibraryPage';
import { TranscriptLibraryPage } from './pages/TranscriptLibraryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-purple-300 text-xs font-semibold animate-pulse">
        Initializing Nexus AI Multimodal Workspace...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ErrorBoundary>
      <WorkspaceProvider>
        <div className="min-h-screen bg-dark-950 text-gray-100 relative">
          <div className="purple-glow-bg" />
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto overflow-x-hidden relative z-10">
              {children}
            </main>
          </div>
        </div>
      </WorkspaceProvider>
    </ErrorBoundary>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedLayout>
                  <ChatWorkspacePage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/study"
              element={
                <ProtectedLayout>
                  <StudyHubPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/images"
              element={
                <ProtectedLayout>
                  <ImageLibraryPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/transcripts"
              element={
                <ProtectedLayout>
                  <TranscriptLibraryPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedLayout>
                  <AnalyticsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedLayout>
                  <ProfilePage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedLayout>
                  <SettingsPage />
                </ProtectedLayout>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
