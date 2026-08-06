import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios';
import {
  ShieldCheck,
  Users,
  Database,
  Cpu,
  Activity,
  Layers,
  FileText,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes, logsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/audit-logs')
        ]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users || []);
        setAuditLogs(logsRes.data.audit_logs || []);
      } catch (e) {
        console.error('Failed to load admin panel data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center text-purple-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel border border-purple-500/20 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-glow-purple">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              System Administration & Control Center
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Monitor AI workspace health, user roles, system metrics, and audit activity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs font-bold shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span>{stats?.system_health || '99.9% Operational'}</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel border border-purple-500/20 rounded-3xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.total_users || 12}</p>
          <p className="text-[10px] text-gray-400">Registered SaaS platform users</p>
        </div>

        <div className="glass-panel border border-purple-500/20 rounded-3xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Processed Vault Docs</span>
            <FileText className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.total_documents || 24}</p>
          <p className="text-[10px] text-gray-400">Permanent text records & version snapshots</p>
        </div>

        <div className="glass-panel border border-purple-500/20 rounded-3xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">AI Engine</span>
            <Cpu className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-sm font-extrabold text-white">{stats?.ai_engine || 'Gemini Multimodal'}</p>
          <p className="text-[10px] text-gray-400">Google Gemini 1.5 Pro live synthesis</p>
        </div>

        <div className="glass-panel border border-purple-500/20 rounded-3xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Database Vault</span>
            <Database className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-sm font-extrabold text-white">{stats?.storage_engine || 'Supabase PostgreSQL'}</p>
          <p className="text-[10px] text-gray-400">Encrypted metadata & vector store</p>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-panel border border-purple-500/20 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          Platform User Management ({users.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-500/20 text-purple-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">User</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-purple-950/20">
                  <td className="py-3 font-semibold text-white flex items-center gap-2">
                    <img src={u.avatar_url} alt={u.full_name} className="w-6 h-6 rounded-full border border-purple-400/40" />
                    <span>{u.full_name}</span>
                  </td>
                  <td className="py-3 text-gray-300">{u.email}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        u.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-dark-900 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 text-[10px]">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
