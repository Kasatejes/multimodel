import React from 'react';
import { Link } from 'react-router-dom';
import { InterviewSession } from '../types';
import { Calendar, Award, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface InterviewHistoryTableProps {
  sessions: InterviewSession[];
}

export const InterviewHistoryTable: React.FC<InterviewHistoryTableProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Role & Topic</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Difficulty</th>
              <th className="py-3.5 px-4">Overall Score</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {sessions.map((session) => {
              const formattedDate = new Date(session.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <tr key={session.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 text-slate-300 text-xs flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formattedDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-100">{session.target_role}</div>
                    <div className="text-xs text-blue-400 font-medium">{session.topic}</div>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-400">{session.interview_type}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {session.difficulty}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {session.overall_score !== undefined && session.overall_score !== null ? (
                      <div className="flex items-center space-x-1.5 font-bold text-slate-100">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>{session.overall_score} / 100</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">In Progress</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {session.status === 'completed' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/60">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>In Progress</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      to={session.status === 'completed' ? `/interview/${session.id}/result` : `/interview/${session.id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-semibold text-xs rounded-lg transition-colors border border-blue-500/20"
                    >
                      <span>{session.status === 'completed' ? 'View Report' : 'Resume'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
