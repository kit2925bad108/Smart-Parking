import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'indigo' | 'blue' | 'violet' | 'emerald' | 'dark';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  accentHex: string;
  isDark: boolean;
  bgPage: string;
  bgCard: string;
  borderCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primaryBtn: string;
  primaryBtnText: string;
  primaryText: string;
  primaryBgLight: string;
  primaryBorderLight: string;
  brandGradient: string;
  sidebarActive: string;
  statusDot: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  indigo: {
    id: 'indigo',
    name: 'Royal Indigo',
    accentHex: '#4f46e5',
    isDark: false,
    bgPage: 'bg-slate-100/80',
    bgCard: 'bg-white',
    borderCard: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
    primaryBtnText: 'text-white',
    primaryText: 'text-indigo-600',
    primaryBgLight: 'bg-indigo-50',
    primaryBorderLight: 'border-indigo-200',
    brandGradient: 'from-indigo-600 to-blue-500 shadow-indigo-600/20',
    sidebarActive: 'bg-indigo-600 text-white shadow-indigo-600/20',
    statusDot: 'bg-indigo-500'
  },
  blue: {
    id: 'blue',
    name: 'Electric Blue',
    accentHex: '#2563eb',
    isDark: false,
    bgPage: 'bg-slate-100/80',
    bgCard: 'bg-white',
    borderCard: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    primaryBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
    primaryBtnText: 'text-white',
    primaryText: 'text-blue-600',
    primaryBgLight: 'bg-blue-50',
    primaryBorderLight: 'border-blue-200',
    brandGradient: 'from-blue-600 to-cyan-500 shadow-blue-600/20',
    sidebarActive: 'bg-blue-600 text-white shadow-blue-600/20',
    statusDot: 'bg-blue-500'
  },
  violet: {
    id: 'violet',
    name: 'Deep Violet',
    accentHex: '#7c3aed',
    isDark: false,
    bgPage: 'bg-slate-100/80',
    bgCard: 'bg-white',
    borderCard: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    primaryBtn: 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20',
    primaryBtnText: 'text-white',
    primaryText: 'text-violet-600',
    primaryBgLight: 'bg-violet-50',
    primaryBorderLight: 'border-violet-200',
    brandGradient: 'from-violet-600 to-purple-500 shadow-violet-600/20',
    sidebarActive: 'bg-violet-600 text-white shadow-violet-600/20',
    statusDot: 'bg-violet-500'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Mint',
    accentHex: '#059669',
    isDark: false,
    bgPage: 'bg-slate-100/80',
    bgCard: 'bg-white',
    borderCard: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
    primaryBtnText: 'text-white',
    primaryText: 'text-emerald-600',
    primaryBgLight: 'bg-emerald-50',
    primaryBorderLight: 'border-emerald-200',
    brandGradient: 'from-emerald-600 to-teal-500 shadow-emerald-600/20',
    sidebarActive: 'bg-emerald-600 text-white shadow-emerald-600/20',
    statusDot: 'bg-emerald-500'
  },
  dark: {
    id: 'dark',
    name: 'Midnight Dark',
    accentHex: '#6366f1',
    isDark: true,
    bgPage: 'bg-slate-950',
    bgCard: 'bg-slate-900',
    borderCard: 'border-slate-800',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    primaryBtn: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30',
    primaryBtnText: 'text-white',
    primaryText: 'text-indigo-400',
    primaryBgLight: 'bg-indigo-950/60',
    primaryBorderLight: 'border-indigo-800/60',
    brandGradient: 'from-indigo-600 to-sky-500 shadow-indigo-600/30',
    sidebarActive: 'bg-indigo-600 text-white shadow-indigo-600/30',
    statusDot: 'bg-indigo-400'
  }
};

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  config: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'indigo',
  setTheme: () => {},
  config: THEMES.indigo
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('smart_parking_theme') as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {}
    return 'indigo'; // Default new color
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('smart_parking_theme', newTheme);
    } catch {}
  };

  const config = THEMES[theme] || THEMES.indigo;

  useEffect(() => {
    // Keep document body in sync
    if (config.isDark) {
      document.body.className = 'bg-slate-950 text-slate-100 antialiased font-sans min-h-screen';
    } else {
      document.body.className = 'bg-slate-100 text-slate-900 antialiased font-sans min-h-screen';
    }
  }, [config.isDark]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
