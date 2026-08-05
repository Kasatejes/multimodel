import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Something went wrong',
  message,
  onDismiss,
}) => {
  return (
    <div className="bg-red-950/50 border border-red-800/60 text-red-200 p-4 rounded-xl flex items-start justify-between shadow-lg backdrop-blur-sm my-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm text-red-200">{title}</h4>
          <p className="text-xs text-red-300/90 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-200 transition-colors p-1 rounded-lg hover:bg-red-900/40"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
