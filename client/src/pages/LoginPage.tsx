import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, TEST_PERSONAS, PERSONA_PASSWORDS } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import {
  LogIn,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Sparkles,
  Check,
  BookOpen,
  HelpCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@Pass123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPersonaUser, setSelectedPersonaUser] = useState<string>('admin');

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
      // toast is handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonaSelect = (personaUsername: string) => {
    setSelectedPersonaUser(personaUsername);
    const pwd = PERSONA_PASSWORDS[personaUsername] || 'Admin@Pass123';
    setUsername(personaUsername);
    setPassword(pwd);
  };

  const handleQuickSignIn = async (personaUsername: string) => {
    handlePersonaSelect(personaUsername);
    setIsSubmitting(true);
    try {
      await quickLogin(personaUsername);
      navigate('/books');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPersona = TEST_PERSONAS.find((p) => p.username === selectedPersonaUser) || TEST_PERSONAS[0];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto" data-testid="login-page">
      <Breadcrumbs items={[{ label: 'Sign In' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Sign-In Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight" data-testid="login-heading">
                Welcome Back
              </h1>
              <p className="text-xs text-slate-500">
                Sign in to your ITFreeSource Bookstore account
              </p>
            </div>
          </div>

          <form onSubmit={handleStandardLogin} className="space-y-4 text-xs" data-testid="login-form">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[11px]">
                Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                data-testid="login-username-input"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-slate-900 transition-all text-sm"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  data-testid="login-password-input"
                  className="w-full pl-4 pr-11 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-slate-900 transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="login-toggle-password"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
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
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="login-submit-btn"
              className="w-full mt-3 py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Logged in state reminder */}
          {isAuthenticated && user && (
            <div className="mt-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Currently signed in as:</span>
                <span className="font-extrabold text-slate-900">
                  {user.fullName} (@{user.username})
                </span>
              </div>
              <button
                onClick={() => navigate('/books')}
                className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* QA Testing / Demo Persona Assistant Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h2 className="font-extrabold text-base text-slate-900">
                QA Demo Personas
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Select an academy test persona to automatically populate the sign-in form with appropriate role credentials:
            </p>

            {/* Persona Dropdown Selector */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Choose Demo Account
                </label>
                <select
                  value={selectedPersonaUser}
                  onChange={(e) => handlePersonaSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-bold text-xs text-slate-800 cursor-pointer"
                  data-testid="persona-select-dropdown"
                >
                  {TEST_PERSONAS.map((p) => (
                    <option key={p.username} value={p.username}>
                      {p.label} (@{p.username})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Persona Detail Box */}
              {currentPersona && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">
                      {currentPersona.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${currentPersona.badgeColor}`}>
                      {currentPersona.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {currentPersona.description}
                  </p>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      Password: <code className="font-mono font-bold text-slate-700 bg-white px-1 py-0.5 rounded border border-slate-200">{PERSONA_PASSWORDS[currentPersona.username]}</code>
                    </span>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  </div>
                </div>
              )}

              {/* Quick 1-Click Action */}
              <button
                type="button"
                onClick={() => handleQuickSignIn(selectedPersonaUser)}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                data-testid="auto-fill-and-login-btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto-Fill & Sign In</span>
              </button>
            </div>
          </div>

          {/* Quick info note */}
          <div className="p-4 rounded-2xl bg-slate-100/80 text-slate-600 text-xs flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              In QA automation suites (Playwright, Cypress, Postman), use standard POST <code className="font-mono text-slate-800 font-bold">/api/v1/auth/login</code> with any of these personas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
