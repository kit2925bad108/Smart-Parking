import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Car, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  Palette
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';

export const AdminLoginView: React.FC = () => {
  const { login } = useAuth();
  const { theme, setTheme, config } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(username.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Invalid administrator username or password.');
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className={`min-h-screen ${config.bgPage} flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200 font-sans`}>
      {/* Top Bar with Brand & Theme Switcher */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${config.brandGradient} flex items-center justify-center text-white font-bold shadow-sm`}>
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className={`text-base font-black tracking-tight ${config.textPrimary} block leading-tight`}>
              SMART PARKING
            </span>
            <span className={`text-[10px] ${config.textMuted} tracking-wider uppercase font-semibold`}>
              Management System
            </span>
          </div>
        </div>

        {/* Color Palette Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl ${config.bgCard} border ${config.borderCard} text-xs font-semibold ${config.textSecondary} shadow-xs hover:opacity-90 transition cursor-pointer`}
          >
            <Palette className={`w-3.5 h-3.5 ${config.primaryText}`} />
            <span className="hidden sm:inline">{config.name}</span>
            <span 
              className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 shrink-0" 
              style={{ backgroundColor: config.accentHex }}
            />
          </button>

          {showThemeMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-2xl ${config.bgCard} border ${config.borderCard} shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150`}>
              <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${config.textMuted}`}>
                UI Theme
              </div>
              {(Object.keys(THEMES) as ThemeId[]).map((tKey) => {
                const t = THEMES[tKey];
                return (
                  <button
                    key={tKey}
                    onClick={() => {
                      setTheme(tKey);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      theme === tKey ? `${t.primaryBgLight} ${t.primaryText} font-bold` : `${config.textSecondary} hover:bg-slate-100/60`
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10" 
                      style={{ backgroundColor: t.accentHex }} 
                    />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Login Card Centerpiece */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className={`${config.bgCard} rounded-3xl border ${config.borderCard} p-7 sm:p-8 shadow-xl transition-all duration-200`}>
          {/* Header Icon & Title */}
          <div className="text-center mb-6">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${config.brandGradient} flex items-center justify-center text-white mx-auto mb-4 shadow-md`}>
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${config.textPrimary}`}>
              Administrator Login
            </h1>
            <p className={`text-xs ${config.textMuted} mt-1.5`}>
              Sign in with your administrator credentials to access real-time parking controls and billing management.
            </p>
          </div>

          {/* Quick-Fill Demo Banner */}
          <div className={`mb-5 p-3 rounded-2xl ${config.isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'} border flex items-center justify-between text-xs`}>
            <div className="flex items-center space-x-2">
              <KeyRound className={`w-4 h-4 ${config.primaryText} shrink-0`} />
              <div className="text-left font-mono text-[11px]">
                <span className={config.textMuted}>Demo: </span>
                <strong className={config.textPrimary}>admin</strong>
                <span className={config.textMuted}> / </span>
                <strong className={config.textPrimary}>admin123</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className={`px-2.5 py-1 rounded-lg ${config.primaryBgLight} ${config.primaryText} border ${config.primaryBorderLight} font-semibold text-[11px] hover:opacity-90 transition cursor-pointer flex items-center space-x-1`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Fill</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${config.textSecondary} mb-1.5`}>
                Admin Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  placeholder="admin"
                  autoComplete="username"
                  required
                  className={`w-full ${config.isDark ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'} border ${config.borderCard} rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 transition`}
                />
                <User className={`w-4 h-4 ${config.textMuted} absolute left-3.5 top-3.5`} />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${config.textSecondary} mb-1.5`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={`w-full ${config.isDark ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'} border ${config.borderCard} rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-1 transition font-mono`}
                />
                <Lock className={`w-4 h-4 ${config.textMuted} absolute left-3.5 top-3.5`} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`p-1 absolute right-3 top-2.5 ${config.textMuted} hover:${config.textPrimary} transition cursor-pointer`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl ${config.primaryBtn} ${config.primaryBtnText} font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Control Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer security badges */}
          <div className={`mt-6 pt-5 border-t ${config.borderCard} flex items-center justify-center space-x-4 text-[10px] ${config.textMuted} font-mono`}>
            <span>🔒 256-Bit TLS</span>
            <span>•</span>
            <span>🛡️ Role-Based RBAC</span>
            <span>•</span>
            <span>⚡ Zero-Delay FIFO</span>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className={`text-center py-3 text-xs ${config.textMuted}`}>
        Smart Parking Management System · Designed for Autonomous Municipal & Private Facilities
      </footer>
    </div>
  );
};
