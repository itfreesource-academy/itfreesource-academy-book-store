import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, TEST_PERSONAS, PERSONA_PASSWORDS } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { LogIn, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@Pass123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, quickLogin, isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      addToast('Please enter both username and password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/books');
    } catch (err: any) {
      // toast is already emitted by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPersona = async (personaUsername: string) => {
    const pwd = PERSONA_PASSWORDS[personaUsername] || 'Admin@Pass123';
    setUsername(personaUsername);
    setPassword(pwd);
    setIsSubmitting(true);
    try {
      await quickLogin(personaUsername);
      navigate('/books');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto" data-testid="login-page">
      <Breadcrumbs items={[{ label: 'Authentication & Login' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Standard Login Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                <LogIn className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900" data-testid="login-heading">
                Sign In to Platform
              </h1>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Enter any of the 10 preconfigured test accounts to simulate their specific permissions.
            </p>

            <form onSubmit={handleStandardLogin} className="space-y-4 text-xs" data-testid="login-form">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, store_manager, vip_customer"
                  data-testid="login-username-input"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    data-testid="login-password-input"
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="login-toggle-password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    data-testid="login-remember-me"
                    className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                  />
                  <span>Remember session token</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="login-submit-btn"
                className="w-full mt-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {isAuthenticated && user && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[11px]">Currently authenticated as:</span>
                <span className="font-bold text-slate-800">@{user.username} ({user.role})</span>
              </div>
              <button
                onClick={() => navigate('/books')}
                className="font-bold text-brand-600 hover:underline"
              >
                Go to Catalog &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Right Column: 10 Preconfigured Personas Selector Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Select a Test Persona (1-Click Login)
                </h3>
                <p className="text-xs text-slate-500">
                  Click any card to immediately authenticate with that role and verify UI access rules
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-brand-50 text-brand-700 border border-brand-200">
                10 ROLES
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="persona-cards-grid">
              {TEST_PERSONAS.map((p) => {
                const isSelected = username === p.username;
                const pwd = PERSONA_PASSWORDS[p.username] || 'Admin@Pass123';

                return (
                  <button
                    key={p.username}
                    type="button"
                    onClick={() => handleSelectPersona(p.username)}
                    data-testid={`persona-card-${p.username}`}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 shadow-sm ring-1 ring-brand-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">@{p.username}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${p.badgeColor}`}>
                          {p.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mb-2">
                        {p.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span className="font-mono">pwd: {pwd}</span>
                      <span className="text-brand-600 font-bold flex items-center gap-0.5">
                        <span>Use</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
