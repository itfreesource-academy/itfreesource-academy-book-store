import React, { useState } from 'react';
import { useAuth, TEST_PERSONAS, PERSONA_PASSWORDS } from '../../context/AuthContext.js';
import { apiClient } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';
import { X, Shield, RotateCcw, Check, Sparkles } from 'lucide-react';

interface PersonaSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonaSwitchModal: React.FC<PersonaSwitchModalProps> = ({ isOpen, onClose }) => {
  const { user, quickLogin } = useAuth();
  const { addToast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  if (!isOpen) return null;

  const handleSwitch = async (username: string) => {
    setIsSwitching(true);
    try {
      await quickLogin(username);
      addToast(`Switched active persona to @${username}`, 'success');
      onClose();
    } catch (err: any) {
      addToast('Failed to switch persona: ' + err.message, 'error');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the in-memory test database back to initial seed data?')) {
      return;
    }
    setIsResetting(true);
    try {
      await apiClient.post('/system/reset');
      addToast('Test database restored to initial seed state!', 'success');
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      data-testid="persona-switch-modal"
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>QA Persona Sandbox Switcher</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  10 Personas
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Switch role simulation to test access controls, RBAC permissions, and UI tiers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Cards Grid */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TEST_PERSONAS.map((p) => {
              const isActive = user?.username === p.username;
              const pwd = PERSONA_PASSWORDS[p.username] || 'Admin@Pass123';

              return (
                <button
                  key={p.username}
                  type="button"
                  disabled={isSwitching}
                  onClick={() => handleSwitch(p.username)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                  data-testid={`modal-persona-${p.username}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">@{p.username}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${p.badgeColor}`}>
                        {p.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-400">pwd: {pwd}</span>
                    {isActive ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="text-indigo-600 font-bold hover:underline">
                        Switch &rarr;
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer with Reset DB */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Simulating real-world multi-tenant permissions</span>
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            data-testid="modal-reset-db-btn"
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white px-3 py-1.5 rounded-xl font-bold border border-rose-200 transition-all text-xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Seed Database'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
