import React from 'react';
import { CheckCircle2, X, Zap, Printer } from 'lucide-react';
import { ExitResponse } from '../types';
import { useTheme } from '../context/ThemeContext';

export interface ExitReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExitResponse | null;
}

export const ExitReceiptModal: React.FC<ExitReceiptModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const { config } = useTheme();

  if (!isOpen || !data) return null;

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`${config.bgCard} rounded-3xl max-w-lg w-full border ${config.borderCard} shadow-2xl p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between border-b ${config.borderCard} pb-4`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className={`text-lg font-black ${config.textPrimary}`}>
                Vehicle Exit Cleared
              </h2>
              <p className={`text-xs ${config.textMuted} font-medium`}>
                Invoice #{data.vehicleNumber}-{Date.now().toString().slice(-4)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl text-slate-400 hover:${config.textPrimary} hover:bg-slate-100 transition cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className={`${config.isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-2xl p-5 border space-y-3 font-mono text-xs`}>
          <div className={`flex justify-between items-center pb-2 border-b ${config.borderCard}`}>
            <span className={config.textMuted}>Vehicle Number</span>
            <span className={`text-base font-black ${config.textPrimary} ${config.isDark ? 'bg-slate-800' : 'bg-white'} px-2 py-0.5 rounded border ${config.borderCard}`}>
              {data.vehicleNumber}
            </span>
          </div>
          <div className={`flex justify-between pb-2 border-b ${config.borderCard}`}>
            <span className={config.textMuted}>Freed Parking Slot</span>
            <span className="font-bold text-emerald-700 text-sm">
              {data.slotNumber}
            </span>
          </div>
          <div className={`flex justify-between pb-2 border-b ${config.borderCard}`}>
            <span className={config.textMuted}>Entry Timestamp</span>
            <span className={`${config.textSecondary} font-semibold`}>{formatDateTime(data.entryTime)}</span>
          </div>
          <div className={`flex justify-between pb-2 border-b ${config.borderCard}`}>
            <span className={config.textMuted}>Exit Timestamp</span>
            <span className={`${config.textSecondary} font-semibold`}>{formatDateTime(data.exitTime)}</span>
          </div>
          <div className={`flex justify-between pb-2 border-b ${config.borderCard}`}>
            <span className={config.textMuted}>Billed Duration</span>
            <span className={`font-bold ${config.textPrimary}`}>{data.durationHours} Hours</span>
          </div>

          {/* Total Fee Box */}
          <div className={`${config.isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 rounded-xl border flex items-center justify-between`}>
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${config.textMuted} block`}>
                TOTAL AMOUNT DUE
              </span>
              <span className={`text-xs ${config.textMuted}`}>
                {data.feeFormula || 'Standard tariff applied'}
              </span>
            </div>
            <div className={`text-3xl font-black ${config.primaryText}`}>
              ₹{data.fee}
            </div>
          </div>
        </div>

        {/* Queue Auto-Allocation Banner */}
        {data.autoAllocatedVehicle && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <span className="font-bold block mb-0.5 flex items-center gap-1.5 text-amber-800">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Slot {data.slotNumber} Promoted to Waiting Queue:
            </span>
            <span className={`font-mono ${config.textPrimary} font-semibold`}>
              {data.autoAllocatedVehicle.vehicleNumber} ({data.autoAllocatedVehicle.ownerName})
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handlePrint}
            className={`flex-1 py-3 rounded-xl ${config.isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'} text-xs font-bold border ${config.borderCard} flex items-center justify-center gap-2 transition cursor-pointer`}
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Invoice</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl ${config.primaryBtn} ${config.primaryBtnText} text-xs font-bold shadow-md transition cursor-pointer`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
