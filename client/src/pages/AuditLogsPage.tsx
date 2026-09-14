import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { useToast } from '../context/ToastContext.js';
import { ScrollText, Search, ShieldCheck } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/audit-logs');
        setLogs(res.data.logs || []);
      } catch (err: any) {
        addToast(err.message || 'Failed to load audit logs.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [addToast]);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.username.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16" data-testid="audit-logs-page">
      <Breadcrumbs items={[{ label: 'Compliance & Audit Logs' }]} />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900" data-testid="audit-title">
              System Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
              Auditor & Admin Scope
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all user authentication events, catalog mutations, price modifications, and orders
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, user, or entity..."
            data-testid="audit-search-input"
            className="w-full text-xs bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600" data-testid="audit-table">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-4 px-4">Timestamp (UTC)</th>
                <th className="py-4 px-4">User & Role</th>
                <th className="py-4 px-4">Action</th>
                <th className="py-4 px-4">Target Entity</th>
                <th className="py-4 px-4">Details</th>
                <th className="py-4 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" data-testid="audit-table-body">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading audit records...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No matching audit logs recorded.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} data-testid={`audit-row-${log.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">@{log.username}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{log.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        data-testid={`audit-action-${log.id}`}
                        className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-brand-50 text-brand-700 border border-brand-200"
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 max-w-md text-slate-600 truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
                    </td>
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
