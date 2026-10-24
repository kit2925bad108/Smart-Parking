import React, { useState } from 'react';
import { 
  Grid3X3, 
  Car, 
  User, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  LogOut, 
  Plus, 
  X
} from 'lucide-react';
import { ParkingSlot } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ParkingSlotsViewProps {
  slots: ParkingSlot[];
  onQuickExit: (vehicleNumber: string) => void;
  onQuickPark: (slotNumber: string) => void;
}

export const ParkingSlotsView: React.FC<ParkingSlotsViewProps> = ({
  slots,
  onQuickExit,
  onQuickPark
}) => {
  const { config } = useTheme();
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;
  const occupiedCount = slots.filter((s) => s.status === 'OCCUPIED').length;

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '--';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (timeStr?: string | null) => {
    if (!timeStr) return '';
    const diffMs = Date.now() - new Date(timeStr).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${Math.max(1, mins)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`${config.bgCard} p-6 rounded-2xl border ${config.borderCard} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200`}>
        <div>
          <h1 className={`text-xl font-bold ${config.textPrimary} flex items-center gap-2`}>
            <Grid3X3 className={`w-5 h-5 ${config.primaryText}`} />
            <span>Interactive Parking Matrix (20 Slots)</span>
          </h1>
          <p className={`text-sm ${config.textMuted} mt-1`}>
            Visual status of parking slots P01 to P20. Click any slot to view vehicle details or trigger exit.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>{availableCount} Available</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>{occupiedCount} Occupied</span>
          </div>
        </div>
      </div>

      {/* Grid of 20 Slots (4 rows of 5 slots each) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
        {slots.map((slot) => {
          const isOccupied = slot.status === 'OCCUPIED';
          return (
            <div
              key={slot.slotNumber}
              onClick={() => setSelectedSlot(slot)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 relative group select-none shadow-xs ${
                isOccupied
                  ? 'bg-rose-50/80 border-rose-200 hover:border-rose-400 hover:shadow-md'
                  : 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-400 hover:shadow-md'
              }`}
            >
              {/* Card Top: Slot Number & Status Indicator */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                  {slot.slotNumber}
                </span>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOccupied
                        ? 'bg-rose-500 shadow-xs animate-pulse'
                        : 'bg-emerald-500 shadow-xs'
                    }`}
                  />
                  <span className="text-xs">
                    {isOccupied ? '🔴' : '🟢'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="my-auto">
                {isOccupied ? (
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-rose-800 truncate tracking-wide">
                      {slot.vehicleNumber}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate flex items-center gap-1 font-medium">
                      <Car className="w-3 h-3 text-slate-400" />
                      <span>{slot.vehicleType}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{getDuration(slot.entryTime)} parked</span>
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                      AVAILABLE
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Ready to park</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Quick Action Hint */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-slate-900 transition">
                <span>{isOccupied ? 'Click for details' : 'Click to allocate'}</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Requirement #9: Slot Click Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${config.bgCard} border ${config.borderCard} rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b ${config.borderCard} pb-3`}>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm ${
                    selectedSlot.status === 'OCCUPIED'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : `${config.primaryBgLight} ${config.primaryText} border ${config.primaryBorderLight}`
                  }`}
                >
                  {selectedSlot.slotNumber}
                </div>
                <div>
                  <h3 className={`font-bold ${config.textPrimary} text-base`}>
                    Slot {selectedSlot.slotNumber} Details
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold ${
                      selectedSlot.status === 'OCCUPIED' ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {selectedSlot.status === 'OCCUPIED' ? '● Occupied' : '● Available'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className={`text-slate-400 hover:${config.textPrimary} p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {selectedSlot.status === 'OCCUPIED' ? (
              <div className="space-y-3">
                <div className={`${config.isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-2xl p-4 border space-y-2.5 text-xs font-mono`}>
                  <div className={`flex justify-between border-b ${config.borderCard} pb-2`}>
                    <span className={config.textMuted}>Vehicle Number:</span>
                    <span className={`font-bold ${config.textPrimary} text-sm`}>{selectedSlot.vehicleNumber}</span>
                  </div>
                  <div className={`flex justify-between border-b ${config.borderCard} pb-2`}>
                    <span className={config.textMuted}>Vehicle Type:</span>
                    <span className={`${config.textSecondary} font-semibold`}>{selectedSlot.vehicleType}</span>
                  </div>
                  <div className={`flex justify-between border-b ${config.borderCard} pb-2`}>
                    <span className={config.textMuted}>Owner Name:</span>
                    <span className={`${config.textSecondary} font-semibold`}>{selectedSlot.ownerName || 'Guest'}</span>
                  </div>
                  <div className={`flex justify-between border-b ${config.borderCard} pb-2`}>
                    <span className={config.textMuted}>Entry Time:</span>
                    <span className={`${config.textSecondary} font-semibold`}>{formatTime(selectedSlot.entryTime)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className={config.textMuted}>Parked Duration:</span>
                    <span className="text-emerald-700 font-bold">{getDuration(selectedSlot.entryTime)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const vNum = selectedSlot.vehicleNumber;
                    setSelectedSlot(null);
                    if (vNum) onQuickExit(vNum);
                  }}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Process Exit for {selectedSlot.vehicleNumber}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`${config.primaryBgLight} border ${config.primaryBorderLight} rounded-2xl p-5 text-center`}>
                  <CheckCircle2 className={`w-8 h-8 ${config.primaryText} mx-auto mb-2`} />
                  <p className={`text-sm font-bold ${config.textPrimary}`}>This Slot is Free</p>
                  <p className={`text-xs ${config.textMuted} mt-1`}>
                    Slot {selectedSlot.slotNumber} is currently open and ready for parking assignment.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const sNum = selectedSlot.slotNumber;
                    setSelectedSlot(null);
                    onQuickPark(sNum);
                  }}
                  className={`w-full py-3 rounded-xl ${config.primaryBtn} ${config.primaryBtnText} font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Vehicle Entry</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
