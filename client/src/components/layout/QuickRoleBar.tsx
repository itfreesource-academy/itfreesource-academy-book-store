import React, { useState } from 'react';
import { useAuth, TEST_PERSONAS } from '../../context/AuthContext.js';
import { apiClient } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';
import { RotateCcw, Shield, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';

export const QuickRoleBar: React.FC = () => {
  const { user, quickLogin, permissions } = useAuth();
  const { addToast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the in-memory test database back to initial seed data?')) {
      return;
    }
    setIsResetting(true);
    try {
      await apiClient.post('/system/reset');
      addToast('Test database restored to initial seed state successfully!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (err: any) {
      addToast('Failed to reset database: ' + err.message, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <aside
      aria-label="QA Test Automation Role Switcher"
      data-testid="quick-role-bar"
      className="bg-slate-900 text-white text-xs border-b border-slate-800 transition-all z-30 relative"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Current Active Role Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <Shield className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden sm:inline text-brand-400">QA Persona Switcher:</span>
          </div>
          {user ? (
            <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white" data-testid="active-persona-role">
                {user.role}
              </span>
              <span className="text-slate-400 text-[11px] hidden md:inline">
                ({permissions.length} perms)
              </span>
            </div>
          ) : (
            <span className="text-amber-400 font-medium bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800">
              Not Logged In (Guest)
            </span>
          )}
        </div>

        {/* Center/Right: 10 Persona 1-Click Switchers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sm:hidden p-1 text-slate-400 hover:text-white"
            data-testid="toggle-persona-buttons"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <div
            className={`flex flex-wrap items-center gap-1 ${
              isCollapsed ? 'hidden sm:flex' : 'flex'
            }`}
            data-testid="persona-buttons-container"
          >
            {TEST_PERSONAS.map((p) => {
              const isActive = user?.username === p.username;
              return (
                <button
                  key={p.username}
                  onClick={() => quickLogin(p.username)}
                  data-testid={`quick-persona-btn-${p.username}`}
                  title={`${p.label} - ${p.description}`}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {p.username}
                </button>
              );
            })}
          </div>

          {/* Reset DB Button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            data-testid="reset-database-btn"
            title="Restore test database back to initial seed data"
            className="flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-2.5 py-1 rounded text-[11px] font-semibold border border-rose-500/40 transition-all ml-2"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Reset DB</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
