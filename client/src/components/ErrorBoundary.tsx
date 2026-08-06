import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React ErrorBoundary error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07070E] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 glass-panel rounded-3xl border border-purple-500/40 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center mx-auto text-purple-300 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-xs text-gray-400">
              {this.state.error?.message || 'An unexpected rendering error occurred in the workspace.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow-purple"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/auth';
                }}
                className="px-4 py-2 rounded-xl bg-dark-900 border border-purple-500/30 text-gray-300 hover:text-white text-xs font-bold"
              >
                Reset & Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
