import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { api } from '../lib/axios';
import { BarChart3, FileText, MessageSquare, BookOpen, HardDrive, Activity, Award } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { activeWorkspace } = useWorkspace();

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const wsId = activeWorkspace?.id;
        const res = await api.get(`/analytics${wsId ? `?workspace_id=${wsId}` : ''}`);
        setAnalytics(res.data);
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [activeWorkspace]);

  if (loading) {
    return <div className="p-8 text-center text-purple-300 text-xs animate-pulse">Loading Analytics...</div>;
  }

  const summary = analytics?.summary || {};
  const breakdown = analytics?.file_breakdown || {};
  const activities = analytics?.recent_activities || [];

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-400" /> Workspace Analytics Dashboard
        </h1>
        <p className="text-xs text-gray-400">
          Performance metrics for <span className="text-purple-300 font-semibold">{activeWorkspace?.name || 'General Workspace'}</span>
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Documents</span>
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-2xl font-black text-white">{summary.total_files || 0}</h3>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Multimodal AI Chats</span>
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-2xl font-black text-white">{summary.total_chats || 0}</h3>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-pink-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Storage Usage</span>
            <HardDrive className="w-4 h-4" />
          </div>
          <h3 className="text-2xl font-black text-white">{summary.storage_mb || 0} MB</h3>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Quiz Score</span>
            <Award className="w-4 h-4" />
          </div>
          <h3 className="text-2xl font-black text-white">{summary.average_quiz_score || 0}%</h3>
        </div>
      </div>

      {/* File Type Breakdown */}
      <div className="p-6 rounded-3xl glass-panel border border-purple-500/20 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" /> File Type Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(breakdown).map(([type, count]) => (
            <div key={type} className="p-3 rounded-2xl bg-dark-950/60 border border-purple-500/10 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-purple-300">{type}</span>
              <span className="text-xs font-bold text-white">{count as number} files</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="p-6 rounded-3xl glass-panel border border-purple-500/20 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" /> Audit & Activity Logs
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-500/20 text-purple-400 text-[10px] uppercase">
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Details</th>
                <th className="py-2 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">
                    No recent activity recorded.
                  </td>
                </tr>
              ) : (
                activities.map((act: any) => (
                  <tr key={act.id}>
                    <td className="py-2.5 px-3 font-semibold text-purple-200">{act.action}</td>
                    <td className="py-2.5 px-3 text-gray-400 max-w-xs truncate">{JSON.stringify(act.details)}</td>
                    <td className="py-2.5 px-3 text-gray-500">{new Date(act.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
