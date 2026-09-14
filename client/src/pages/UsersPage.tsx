import React, { useState, useEffect } from 'react';
import { User, UserRole, Currency, Timezone } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { useAuth, TEST_PERSONAS, PERSONA_PASSWORDS } from '../context/AuthContext.js';
import { useCurrency, SUPPORTED_CURRENCIES, SUPPORTED_TIMEZONES } from '../context/CurrencyContext.js';
import { useToast } from '../context/ToastContext.js';
import {
  Users as UsersIcon,
  ShieldAlert,
  KeyRound,
  CheckCircle,
  Ban,
  ArrowRightLeft,
  Edit2,
  Globe,
  DollarSign
} from 'lucide-react';

const ALL_ROLES: { role: UserRole; label: string }[] = [
  { role: 'admin', label: 'Super Admin' },
  { role: 'store_manager', label: 'Store Manager' },
  { role: 'inventory_clerk', label: 'Inventory Clerk' },
  { role: 'content_editor', label: 'Content Editor' },
  { role: 'order_fulfillment', label: 'Order Fulfillment' },
  { role: 'support_agent', label: 'Support Agent' },
  { role: 'book_reviewer', label: 'Lead Reviewer' },
  { role: 'auditor', label: 'Auditor' },
  { role: 'vip_customer', label: 'VIP Customer' },
  { role: 'standard_customer', label: 'Regular Customer' }
];

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit User Modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('standard_customer');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [editTimezone, setEditTimezone] = useState<Timezone>('America/New_York');
  const [editCurrency, setEditCurrency] = useState<Currency>('USD');
  const [isSaving, setIsSaving] = useState(false);

  const { user: currentUser, quickLogin, hasRole } = useAuth();
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

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditTimezone(user.timezone || 'America/New_York');
    setEditCurrency(user.currency || 'USD');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const res = await apiClient.put(`/auth/users/${editingUser.id}`, {
        fullName: editFullName,
        email: editEmail,
        role: editRole,
        status: editStatus,
        timezone: editTimezone,
        currency: editCurrency
      });

      addToast(`User @${editingUser.username} updated successfully!`, 'success');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      addToast(err.message || 'Failed to update user. Ensure you have admin privileges.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

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

  const isAdmin = hasRole('admin');

  return (
    <div className="space-y-6 pb-16" data-testid="users-management-page">
      <Breadcrumbs items={[{ label: 'User Management & RBAC Matrix' }]} />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900" data-testid="users-page-title">
            10 Test Personas & Admin User Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage user accounts, credentials, assigned role permissions, timezones, and currencies.
          </p>
        </div>

        {!isAdmin && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>
              Tip: Switch to <strong>admin</strong> persona to modify user names, roles, and settings.
            </span>
          </div>
        )}
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
                <th className="py-4 px-4">Timezone & Currency</th>
                <th className="py-4 px-4">Preset Password</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
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
                      <div className="space-y-0.5">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{u.timezone || 'America/New_York'}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 font-bold">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                            {u.currency || 'USD'}
                          </span>
                        </span>
                      </div>
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
                        title="Click to toggle status"
                      >
                        {u.status}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Admin Edit User Button */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          data-testid={`edit-user-btn-${u.username}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition-colors"
                          title="Edit user details and role"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        {/* Quick switch login button */}
                        <button
                          onClick={() => quickLogin(u.username)}
                          data-testid={`switch-to-user-${u.username}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200 rounded-lg font-bold text-xs transition-colors"
                          title={`Switch active session to ${u.username}`}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Switch</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Edit User Persona</h3>
                <p className="text-purple-200 text-xs mt-0.5">
                  Updating profile & permissions for @{editingUser.username}
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.label} ({r.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'suspended')}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Regional Timezone</label>
                  <select
                    value={editTimezone}
                    onChange={(e) => setEditTimezone(e.target.value as Timezone)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {Object.values(SUPPORTED_TIMEZONES).map((tz) => (
                      <option key={tz.id} value={tz.id}>
                        {tz.region}: {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Regional Currency</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value as Currency)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 -mx-6 -mb-6 mt-6 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSaving ? 'Saving Changes...' : 'Save User Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
