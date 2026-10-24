import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Activity, 
  RefreshCw, 
  Clock, 
  AlertTriangle,
  Palette,
  Check,
  ShieldCheck,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { apiConfig } from '../api/config';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AdminSettingsModal } from './AdminSettingsModal';

interface NavbarProps {
  onRefresh: () => void;
  onReset: () => void;
  onSeedFull: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  onReset,
  onSeedFull,
  isRefreshing
}) => {
  const { theme, setTheme, config } = useTheme();
  const { adminUser, logout } = useAuth();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>(apiConfig.getBaseUrl());
  const [showConfig, setShowConfig] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    apiConfig.setBaseUrl(apiUrl);
    setShowConfig(false);
    onRefresh();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Administrator portal?')) {
      logout();
    }
  };

  return (
    <header className={`${config.bgCard} border-b ${config.borderCard} sticky top-0 z-30 shadow-xs transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${config.brandGradient} flex items-center justify-center text-white font-bold transition-all duration-300`}>
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-black tracking-tight ${config.textPrimary} flex items-center gap-1.5`}>
                  🚗 SMART PARKING MANAGEMENT SYSTEM
                </span>
              </div>
              <p className={`text-xs ${config.textMuted} hidden sm:block font-medium`}>
                Automated Slot Allocation &amp; Real-time Parking Management
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Clock */}
            <div className={`hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${config.isDark ? 'bg-slate-850 border-slate-750' : 'bg-slate-50 border-slate-200'} border text-xs font-mono ${config.textSecondary}`}>
              <Clock className={`w-3.5 h-3.5 ${config.primaryText}`} />
              <span>{currentTime}</span>
            </div>

            {/* Quick Test: Fill 20 Slots */}
            <button
              onClick={onSeedFull}
              title="Quickly fill all 20 slots to test waiting queue behavior"
              className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Fill 20 Slots</span>
            </button>

            {/* Color Theme Selector Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowThemePicker(!showThemePicker);
                  setShowConfig(false);
                }}
                title="Change UI Color Theme"
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg ${config.isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} border text-xs font-semibold transition cursor-pointer`}
              >
                <Palette className={`w-4 h-4 ${config.primaryText}`} />
                <span className="hidden md:inline">{config.name}</span>
                <span 
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 shrink-0" 
                  style={{ backgroundColor: config.accentHex }}
                />
              </button>

              {/* Theme Selector Popover */}
              {showThemePicker && (
                <div className={`absolute right-0 mt-2 w-56 rounded-2xl ${config.bgCard} border ${config.borderCard} shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150`}>
                  <div className={`px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider ${config.textMuted}`}>
                    Choose UI Color
                  </div>
                  <div className="space-y-1">
                    {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                      const t = THEMES[themeKey];
                      const isSelected = theme === themeKey;
                      return (
                        <button
                          key={themeKey}
                          onClick={() => {
                            setTheme(themeKey);
                            setShowThemePicker(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                            isSelected
                              ? `${t.primaryBgLight} ${t.primaryText} font-bold`
                              : `${config.textSecondary} hover:bg-slate-100/80`
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span 
                              className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10 shrink-0" 
                              style={{ backgroundColor: t.accentHex }}
                            />
                            <span>{t.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Data */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh all real-time stats"
              className={`p-2 rounded-lg ${config.isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} border transition cursor-pointer`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? `animate-spin ${config.primaryText}` : ''}`} />
            </button>

            {/* API Config Dropdown Toggle */}
            <button
              onClick={() => {
                setShowConfig(!showConfig);
                setShowThemePicker(false);
              }}
              className={`p-2 rounded-lg ${config.isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'} border text-xs transition cursor-pointer`}
              title="API Endpoint Configuration"
            >
              <Activity className={`w-4 h-4 ${config.primaryText}`} />
            </button>

            {/* Logged-In Admin Profile Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              title="Admin Profile & Settings"
              className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl ${config.primaryBgLight} border ${config.primaryBorderLight} text-xs font-semibold ${config.primaryText} hover:opacity-90 transition cursor-pointer`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline font-bold">
                {adminUser?.name?.split(' ')[0] || 'Admin'}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Sign Out of Administrator Portal"
              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* API Endpoint Configuration Banner */}
      {showConfig && (
        <div className={`${config.isDark ? 'bg-slate-850 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} border-b px-4 py-3 text-xs`}>
          <form onSubmit={handleSaveApiUrl} className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className={`font-semibold ${config.textPrimary}`}>API Base URL:</span>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="/api or http://localhost:8080/api"
                className={`bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 font-mono w-64 focus:outline-none focus:ring-1`}
              />
              <button
                type="submit"
                className={`px-3 py-1 rounded ${config.primaryBtn} ${config.primaryBtnText} font-medium cursor-pointer transition`}
              >
                Apply
              </button>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <span>Endpoint: <code className={`${config.primaryText} font-semibold`}>{apiUrl}</code></span>
              <button
                type="button"
                onClick={onReset}
                className="text-rose-600 hover:text-rose-700 font-medium underline cursor-pointer"
              >
                Reset Demo Data
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Settings Modal */}
      <AdminSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </header>
  );
};
