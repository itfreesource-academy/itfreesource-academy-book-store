import React, { useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { useAuth, TEST_PERSONAS, PERSONA_PASSWORDS } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Users as UsersIcon, ShieldAlert, KeyRound, CheckCircle, Ban, ArrowRightLeft } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const { quickLogin } = useAuth();
  const { addToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/auth/users');
      setUsers(res.data.users || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await apiClient.patch(`/auth/users/${user.id}/status`, { status: newStatus });
      addToast(`Status of @${user.username} updated to ${newStatus}.`, 'success');
      fetchUsers();
    } catch (err: any) {
      addToast(err.message || 'Status change failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-16" data-testid="users-management-page">
      <Breadcrumbs items={[{ label: 'User Management & RBAC Matrix' }]} />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900" data-testid="users-page-title">
          10 Test Personas & Role-Based Access Control (RBAC)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect user accounts, credentials, assigned role permissions, and toggle status.
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600" data-testid="users-table">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-4 px-4">Persona</th>
                <th className="py-4 px-4">Username & Email</th>
                <th className="py-4 px-4">Assigned Role</th>
                <th className="py-4 px-4">Preset Password</th>
                <th className="py-4 px-4">Account Status</th>
                <th className="py-4 px-4 text-right">Quick Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" data-testid="users-table-body">
              {users.map((u) => {
                const persona = TEST_PERSONAS.find((p) => p.username === u.username);
                const password = PERSONA_PASSWORDS[u.username] || 'Admin@Pass123';
                const isSuspended = u.status === 'suspended';

                return (
                  <tr key={u.id} data-testid={`user-row-${u.username}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{u.fullName}</span>
                          <span className="text-[11px] text-slate-400">{persona?.label || u.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">@{u.username}</span>
                      <span className="text-[11px] text-slate-500">{u.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        data-testid={`role-badge-${u.username}`}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          persona?.badgeColor || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded-md max-w-fit">
                        <KeyRound className="w-3 h-3 text-slate-400" />
                        <span>{password}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        data-testid={`status-toggle-btn-${u.username}`}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          isSuspended
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => quickLogin(u.username)}
                        data-testid={`switch-to-user-${u.username}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200 rounded-lg font-bold text-xs transition-colors"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Login as {u.username}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
