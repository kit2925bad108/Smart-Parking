import React from 'react';
import { 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  Grid3X3, 
  ListOrdered, 
  History 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export type TabType = 'dashboard' | 'entry' | 'exit' | 'slots' | 'queue' | 'history';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  waitingCount: number;
  occupiedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  waitingCount,
  occupiedCount
}) => {
  const { config } = useTheme();
  const { adminUser } = useAuth();

  const menuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'entry' as TabType,
      label: 'Vehicle Entry',
      icon: LogIn,
      badge: null
    },
    {
      id: 'exit' as TabType,
      label: 'Vehicle Exit',
      icon: LogOut,
      badge: occupiedCount > 0 ? `${occupiedCount} Parked` : null,
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    },
    {
      id: 'slots' as TabType,
      label: 'Parking Slots',
      icon: Grid3X3,
      badge: '20 Total'
    },
    {
      id: 'queue' as TabType,
      label: 'Waiting Queue',
      icon: ListOrdered,
      badge: waitingCount > 0 ? `${waitingCount} waiting` : null,
      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200'
    },
    {
      id: 'history' as TabType,
      label: 'Parking History',
      icon: History,
      badge: null
    }
  ];

  return (
    <aside className={`w-full md:w-64 ${config.bgCard} border-r ${config.borderCard} p-4 flex flex-col justify-between shrink-0 shadow-xs transition-colors duration-200`}>
      <div className="space-y-1.5">
        <div className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${config.textMuted}`}>
          Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                isActive
                  ? `${config.sidebarActive} shadow-md`
                  : `${config.textSecondary} hover:bg-slate-100 hover:${config.textPrimary}`
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : config.textMuted}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Facility Quick Info */}
      <div className={`mt-8 pt-4 border-t ${config.borderCard} hidden md:block space-y-3`}>
        <div className={`${config.isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-xl p-3.5 border text-xs`}>
          <div className={`text-[11px] font-bold ${config.textSecondary} flex items-center gap-1.5 mb-2`}>
            <span className={`w-2 h-2 rounded-full ${config.statusDot} animate-pulse`}></span>
            Facility Overview
          </div>
          <div className={`space-y-1.5 font-mono text-[11px] ${config.textMuted}`}>
            <div className="flex justify-between">
              <span>Capacity:</span>
              <span className={`${config.textPrimary} font-bold`}>20 Slots (P01-P20)</span>
            </div>
            <div className="flex justify-between">
              <span>Base Tariff:</span>
              <span className={`${config.primaryText} font-bold`}>₹30 / first hr</span>
            </div>
          </div>
        </div>

        {/* Admin Session Badge */}
        <div className={`px-3 py-2 rounded-xl ${config.primaryBgLight} border ${config.primaryBorderLight} text-xs flex items-center justify-between`}>
          <div className="flex items-center space-x-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className={`text-[11px] font-bold ${config.primaryText} truncate`}>
              {adminUser?.name || 'Administrator'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/70 text-slate-800 border border-slate-200">
            {adminUser?.role || 'ADMIN'}
          </span>
        </div>
      </div>
    </aside>
  );
};
