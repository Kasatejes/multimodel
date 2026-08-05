import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SessionStatus, InterviewSession } from '../types';

export function useRealtimeSession(sessionId: string | undefined, userId: string | undefined) {
  const [sessionState, setSessionState] = useState<InterviewSession | null>(null);
  const [processingStatus, setProcessingStatus] = useState<SessionStatus>('waiting');

  useEffect(() => {
    if (!sessionId || !userId) return;

    // Listen only to updates for this specific sessionId & user
    const channel = supabase
      .channel(`session_status:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'interview_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const updated = payload.new as InterviewSession;
          // Ensure ownership security filter on client as well
          if (updated.user_id === userId) {
            setSessionState(updated);
            setProcessingStatus(updated.processing_status || 'waiting');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, userId]);

  return { sessionState, setSessionState, processingStatus, setProcessingStatus };
}
