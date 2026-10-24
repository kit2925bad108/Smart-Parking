import React from 'react';
import { 
  ListOrdered, 
  ArrowRight, 
  Clock, 
  Car, 
  User, 
  Zap, 
  CheckCircle2
} from 'lucide-react';
import { WaitingVehicle } from '../types';
import { useTheme } from '../context/ThemeContext';

interface WaitingQueueViewProps {
  queue: WaitingVehicle[];
  onNavigate: (tab: any) => void;
}

export const WaitingQueueView: React.FC<WaitingQueueViewProps> = ({
  queue,
  onNavigate
}) => {
  const { config } = useTheme();

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getWaitingDuration = (timeStr?: string) => {
    if (!timeStr) return '';
    const diffMs = Date.now() - new Date(timeStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`${config.bgCard} p-6 rounded-2xl border ${config.borderCard} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200`}>
        <div>
          <h1 className={`text-xl font-bold ${config.textPrimary} flex items-center gap-2`}>
            <ListOrdered className="w-5 h-5 text-amber-600" />
            <span>Waiting Queue (FIFO Engine)</span>
          </h1>
          <p className={`text-sm ${config.textMuted} mt-1`}>
            Automated First-In-First-Out waiting queue when all 20 parking slots are occupied.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {queue.length} in Queue
          </span>
        </div>
      </div>

      {/* Prominent FIFO Queue Banner */}
      <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-amber-950 text-sm">
              FIFO Principle: First vehicle in ➔ First vehicle out
            </h3>
            <p className="text-amber-800/90 text-xs mt-0.5">
              When any vehicle exits from the 20 slots, the freed slot is automatically transferred to Position #1 in this queue without human intervention.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('exit')}
            className={`px-3.5 py-2 rounded-xl ${config.bgCard} hover:opacity-90 ${config.textPrimary} border border-amber-300 text-xs font-bold cursor-pointer transition shadow-2xs`}
          >
            Process an Exit to Free a Slot
          </button>
        </div>
      </div>

      {/* Queue Table Card */}
      <div className={`${config.bgCard} rounded-2xl border ${config.borderCard} overflow-hidden shadow-sm transition-colors duration-200`}>
        {queue.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`w-14 h-14 rounded-2xl ${config.primaryBgLight} border ${config.primaryBorderLight} mx-auto flex items-center justify-center ${config.primaryText} mb-3`}>
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className={`text-base font-bold ${config.textPrimary} mb-1`}>
              Waiting Queue is Currently Empty
            </h3>
            <p className={`text-xs ${config.textMuted} max-w-md mx-auto`}>
              Slots are either available, or all currently arrived vehicles have already been allocated parking slots.
            </p>
            <div className="mt-4">
              <button
                onClick={() => onNavigate('entry')}
                className={`px-4 py-2 rounded-xl ${config.primaryBtn} ${config.primaryBtnText} text-xs font-bold shadow-xs cursor-pointer transition`}
              >
                Park a Vehicle
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`${config.isDark ? 'bg-slate-850' : 'bg-slate-50'} ${config.textMuted} uppercase tracking-wider text-[11px] border-b ${config.borderCard}`}>
                <tr>
                  <th className="px-5 py-3.5">Position</th>
                  <th className="px-5 py-3.5">Vehicle Number</th>
                  <th className="px-5 py-3.5">Vehicle Type</th>
                  <th className="px-5 py-3.5">Owner Name</th>
                  <th className="px-5 py-3.5">Waiting Since</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${config.isDark ? 'divide-slate-800' : 'divide-slate-100'} ${config.textSecondary}`}>
                {queue.map((item, idx) => {
                  const isHead = idx === 0;
                  return (
                    <tr
                      key={item.vehicleNumber}
                      className={`hover:${config.isDark ? 'bg-slate-800/50' : 'bg-slate-50'} transition ${
                        isHead ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Position */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                            isHead
                              ? 'bg-amber-500 text-white shadow-xs'
                              : `${config.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'} border ${config.borderCard}`
                          }`}
                        >
                          {item.position}
                        </span>
                      </td>

                      {/* Vehicle Number */}
                      <td className={`px-5 py-4 whitespace-nowrap font-bold ${config.textPrimary} text-sm`}>
                        {item.vehicleNumber}
                      </td>

                      {/* Vehicle Type */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded ${config.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'} border ${config.borderCard} font-semibold text-[11px]`}>
                          {item.vehicleType}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className={`px-5 py-4 whitespace-nowrap ${config.textSecondary} font-medium`}>
                        {item.ownerName}
                      </td>

                      {/* Waiting Since */}
                      <td className={`px-5 py-4 whitespace-nowrap ${config.textMuted}`}>
                        <div className="flex flex-col">
                          <span className={`font-semibold ${config.textPrimary}`}>{formatTime(item.entryTime)}</span>
                          <span className="text-[10px] text-amber-700 font-semibold">
                            {getWaitingDuration(item.entryTime)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {isHead ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <Zap className="w-3 h-3 text-amber-600" />
                            NEXT IN LINE (AUTO-PROMOTED)
                          </span>
                        ) : (
                          <span className={`text-[11px] ${config.textMuted}`}>
                            Queued (#{item.position})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
