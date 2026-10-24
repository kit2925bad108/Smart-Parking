import React from 'react';
import { 
  Layers, 
  Car, 
  IndianRupee, 
  CheckCircle, 
  TrendingUp, 
  ArrowRight,
  Plus,
  LogOut,
  Zap,
  ListOrdered
} from 'lucide-react';
import { DashboardStats, ParkingSlot } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DashboardViewProps {
  stats: DashboardStats | null;
  slots: ParkingSlot[];
  onNavigate: (tab: any) => void;
  onSelectSlot: (slot: ParkingSlot) => void;
  onSeedFull: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  slots,
  onNavigate,
  onSelectSlot,
  onSeedFull
}) => {
  const { config } = useTheme();
  const totalSlots = stats?.totalSlots ?? 20;
  const availableSlots = stats?.availableSlots ?? 0;
  const occupiedSlots = stats?.occupiedSlots ?? 0;
  const waitingVehicles = stats?.waitingVehicles ?? 0;
  const todayRevenue = stats?.todayRevenue ?? 0;

  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  const cards = [
    {
      title: 'Total Slots',
      value: totalSlots,
      subtitle: 'Configured capacity',
      icon: Layers,
      color: `${config.primaryBgLight} ${config.primaryText} ${config.primaryBorderLight}`
    },
    {
      title: 'Available Slots',
      value: availableSlots,
      subtitle: `${totalSlots - occupiedSlots} slots ready to park`,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Occupied Slots',
      value: occupiedSlots,
      subtitle: `${occupancyRate}% occupancy rate`,
      icon: Car,
      color: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      title: 'Waiting Vehicles',
      value: waitingVehicles,
      subtitle: 'Vehicles awaiting open slots',
      icon: ListOrdered,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: "Today's Revenue",
      value: `₹${todayRevenue}`,
      subtitle: 'Automated fee collection',
      icon: IndianRupee,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${config.bgCard} p-6 rounded-2xl border ${config.borderCard} shadow-sm transition-colors duration-200`}>
        <div>
          <h1 className={`text-xl font-bold ${config.textPrimary} flex items-center gap-2`}>
            <span>Parking Operations Overview</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${config.primaryBgLight} ${config.primaryText} border ${config.primaryBorderLight} font-semibold`}>
              System Active
            </span>
          </h1>
          <p className={`text-sm ${config.textMuted} mt-1`}>
            Real-time vehicle monitoring, automated parking slot allocation, and revenue tracking.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('entry')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl ${config.primaryBtn} ${config.primaryBtnText} text-xs font-semibold shadow-md transition cursor-pointer`}
          >
            <Plus className="w-4 h-4" />
            <span>Vehicle Entry</span>
          </button>
          <button
            onClick={() => onNavigate('exit')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl ${config.isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'} border text-xs font-semibold transition cursor-pointer`}
          >
            <LogOut className="w-4 h-4" />
            <span>Vehicle Exit</span>
          </button>
        </div>
      </div>

      {/* Requirement #5: Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl ${config.bgCard} border ${config.borderCard} shadow-sm relative overflow-hidden transition-colors duration-200`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${config.textMuted} uppercase tracking-wider`}>
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-black tracking-tight ${config.textPrimary} font-mono`}>
                  {card.value}
                </div>
                <div className={`text-[11px] ${config.textMuted} mt-1 truncate font-medium`}>
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Slot Grid Preview + Parking Facility Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-Time Slots Grid Preview */}
        <div className={`lg:col-span-2 ${config.bgCard} rounded-2xl border ${config.borderCard} p-6 shadow-sm transition-colors duration-200`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`text-base font-bold ${config.textPrimary} flex items-center gap-2`}>
                <span>Parking Slot Matrix (P01 - P20)</span>
                <span className={`text-xs font-normal ${config.textMuted}`}>
                  (Click any slot for details or exit)
                </span>
              </h2>
              <div className="flex items-center gap-4 text-xs mt-1.5 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
                  Available ({availableSlots})
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs"></span>
                  Occupied ({occupiedSlots})
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('slots')}
              className={`text-xs font-bold ${config.primaryText} hover:opacity-80 flex items-center gap-1 cursor-pointer ${config.primaryBgLight} px-3 py-1.5 rounded-lg border ${config.primaryBorderLight} transition`}
            >
              <span>View Full Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-3">
            {slots.slice(0, 20).map((slot) => {
              const isOccupied = slot.status === 'OCCUPIED';
              return (
                <button
                  key={slot.slotNumber}
                  onClick={() => onSelectSlot(slot)}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between h-24 relative group cursor-pointer shadow-2xs ${
                    isOccupied
                      ? 'bg-rose-50/80 border-rose-200 hover:border-rose-400 hover:bg-rose-100/80'
                      : 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {slot.slotNumber}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOccupied ? 'bg-rose-500 shadow-xs' : 'bg-emerald-500 shadow-xs'
                      }`}
                    />
                  </div>
                  <div className="mt-1">
                    {isOccupied ? (
                      <div className="truncate">
                        <p className="text-[11px] font-mono font-bold text-rose-800 truncate">
                          {slot.vehicleNumber}
                        </p>
                        <p className="text-[10px] text-slate-600 truncate font-medium">
                          {slot.vehicleType}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                        FREE
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Parking Facility Status & Quick Actions */}
        <div className={`${config.bgCard} rounded-2xl border ${config.borderCard} p-6 shadow-sm flex flex-col justify-between transition-colors duration-200`}>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className={`text-base font-bold ${config.textPrimary} flex items-center gap-2`}>
                  <TrendingUp className={`w-4 h-4 ${config.primaryText}`} />
                  <span>Facility Occupancy</span>
                </h2>
                <span className={`text-xs font-mono font-bold ${config.primaryText}`}>
                  {occupancyRate}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className={`w-full ${config.isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-full h-3.5 border ${config.borderCard} overflow-hidden p-0.5`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    occupancyRate >= 90
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, occupancyRate)}%` }}
                />
              </div>

              <div className={`flex justify-between text-[11px] ${config.textMuted} mt-2 font-mono font-medium`}>
                <span className="text-emerald-700 font-bold">{availableSlots} Available</span>
                <span className="text-rose-700 font-bold">{occupiedSlots} Occupied</span>
                <span>{totalSlots} Capacity</span>
              </div>
            </div>

            {/* Parking Rate Card */}
            <div className={`${config.isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-xl p-4 border space-y-2`}>
              <span className={`text-[11px] font-bold ${config.textSecondary} uppercase tracking-wider block`}>
                Standard Parking Tariff
              </span>
              <div className="space-y-1.5 text-xs">
                <div className={`flex justify-between ${config.textSecondary}`}>
                  <span>First 1 Hour:</span>
                  <span className={`font-mono font-bold ${config.primaryText}`}>₹30 (Base)</span>
                </div>
                <div className={`flex justify-between ${config.textSecondary}`}>
                  <span>Each Additional Hour:</span>
                  <span className={`font-mono font-bold ${config.primaryText}`}>₹20 / hour</span>
                </div>
                <div className={`flex justify-between ${config.textSecondary}`}>
                  <span>Minimum Fee:</span>
                  <span className={`font-mono font-bold ${config.textPrimary}`}>₹30</span>
                </div>
              </div>
            </div>

            {/* Waiting Queue Status */}
            <div className={`${config.isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-xl p-4 border flex items-center justify-between`}>
              <div>
                <span className={`text-[11px] font-bold ${config.textSecondary} uppercase tracking-wider block`}>
                  Waiting Queue
                </span>
                <span className={`text-xs ${config.textMuted} font-medium`}>
                  {waitingVehicles > 0 ? `${waitingVehicles} vehicle(s) waiting` : 'No vehicles in queue'}
                </span>
              </div>
              <button
                onClick={() => onNavigate('queue')}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1 cursor-pointer transition"
              >
                <span>View Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className={`mt-5 pt-4 border-t ${config.borderCard}`}>
            <button
              onClick={onSeedFull}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Full Parking (20 Slots)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
