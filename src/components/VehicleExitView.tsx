import React, { useState } from 'react';
import { 
  LogOut, 
  Car, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Receipt, 
  RefreshCw 
} from 'lucide-react';
import { apiFetch } from '../api/config';
import { ExitResponse, Vehicle } from '../types';
import { useTheme } from '../context/ThemeContext';
import { ExitReceiptModal } from './ExitReceiptModal';

interface VehicleExitViewProps {
  parkedVehicles: Vehicle[];
  onSuccess: () => void;
}

export const VehicleExitView: React.FC<VehicleExitViewProps> = ({
  parkedVehicles,
  onSuccess
}) => {
  const { config } = useTheme();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [exitResult, setExitResult] = useState<ExitResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle registration number to process exit.');
      return;
    }

    setLoading(true);
    setError(null);
    setProcessingStatus('Verifying vehicle record...');

    try {
      await new Promise((r) => setTimeout(r, 250));
      setProcessingStatus('Calculating parked duration & tariff...');

      const data = await apiFetch<ExitResponse>('/vehicles/exit', {
        method: 'POST',
        body: JSON.stringify({
          vehicleNumber: vehicleNumber.trim().toUpperCase()
        })
      });

      await new Promise((r) => setTimeout(r, 200));
      setProcessingStatus('Finalizing invoice...');

      setExitResult(data);
      setShowModal(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Vehicle not found or already exited.');
    } finally {
      setLoading(false);
      setProcessingStatus('');
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className={`${config.bgCard} p-6 rounded-2xl border ${config.borderCard} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200`}>
        <div>
          <h1 className={`text-xl font-bold ${config.textPrimary} flex items-center gap-2`}>
            <LogOut className="w-5 h-5 text-rose-600" />
            <span>Vehicle Exit &amp; Automated Billing</span>
          </h1>
          <p className={`text-sm ${config.textMuted} mt-1`}>
            Automated duration calculation, standard parking fee computation, and instant slot release.
          </p>
        </div>
        <div className={`text-xs px-3.5 py-1.5 rounded-xl ${config.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'} border ${config.borderCard} font-mono font-semibold`}>
          {parkedVehicles.length} Vehicles Currently Parked
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Form & Active Parked Quick-Selector */}
        <div className="md:col-span-6 space-y-4">
          <div className={`${config.bgCard} rounded-2xl border ${config.borderCard} p-6 shadow-sm transition-colors duration-200`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${config.textSecondary} mb-1.5`}>
                  Vehicle Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => {
                      setVehicleNumber(e.target.value.toUpperCase());
                      setError(null);
                    }}
                    placeholder="Enter registration number (e.g. TN38AB1234)"
                    className={`w-full ${config.isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} border ${config.borderCard} rounded-xl px-4 py-3 font-mono uppercase tracking-wider text-sm focus:outline-none focus:ring-1 transition`}
                  />
                  <Car className={`w-4 h-4 ${config.textMuted} absolute right-3.5 top-3.5`} />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{processingStatus || 'Processing Exit...'}</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>PROCESS EXIT</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Parked Vehicles Quick Select List */}
          <div className={`${config.bgCard} rounded-2xl border ${config.borderCard} p-5 shadow-sm transition-colors duration-200`}>
            <h3 className={`text-xs font-bold ${config.textPrimary} uppercase tracking-wider mb-3 flex items-center justify-between`}>
              <span>Select Parked Vehicle ({parkedVehicles.length})</span>
              <span className={`text-[10px] ${config.textMuted} font-normal`}>Click to auto-fill</span>
            </h3>

            {parkedVehicles.length === 0 ? (
              <p className={`text-xs ${config.textMuted} py-6 text-center`}>
                No vehicles are currently parked in the slots.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {parkedVehicles.map((v) => (
                  <button
                    key={v.vehicleNumber}
                    onClick={() => {
                      setVehicleNumber(v.vehicleNumber);
                      setError(null);
                    }}
                    type="button"
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition cursor-pointer text-xs ${
                      vehicleNumber === v.vehicleNumber
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-medium'
                        : `${config.isDark ? 'bg-slate-850 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100'} ${config.borderCard} ${config.textSecondary}`
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`font-mono font-bold ${config.isDark ? 'bg-slate-800' : 'bg-white'} px-2 py-0.5 rounded ${config.textPrimary} border ${config.borderCard} text-[11px]`}>
                        {v.slotNumber}
                      </span>
                      <span className={`font-mono font-bold ${config.textPrimary}`}>{v.vehicleNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] ${config.textSecondary} font-medium block truncate max-w-[120px]`}>
                        {v.ownerName}
                      </span>
                      <span className={`text-[10px] ${config.textMuted}`}>
                        {v.vehicleType}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Exit Receipt Display */}
        <div className="md:col-span-6">
          {exitResult ? (
            <div className={`${config.bgCard} rounded-2xl border ${config.borderCard} p-6 shadow-sm space-y-4 transition-colors duration-200`}>
              {/* Receipt Header */}
              <div className={`flex items-center justify-between border-b ${config.borderCard} pb-4`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${config.textPrimary} text-base`}>
                      Parking Invoice &amp; Exit Pass
                    </h3>
                    <p className={`text-xs ${config.textMuted} font-medium`}>
                      Official Parking Receipt
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    PAID / CLEARED
                  </span>
                </div>
              </div>

              {/* Receipt Body Details */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className={`flex justify-between py-1.5 border-b ${config.borderCard}`}>
                  <span className={config.textMuted}>Vehicle Number:</span>
                  <span className={`font-bold ${config.textPrimary} text-sm`}>{exitResult.vehicleNumber}</span>
                </div>
                <div className={`flex justify-between py-1.5 border-b ${config.borderCard}`}>
                  <span className={config.textMuted}>Released Slot:</span>
                  <span className="font-bold text-emerald-700 text-sm">{exitResult.slotNumber}</span>
                </div>
                <div className={`flex justify-between py-1.5 border-b ${config.borderCard}`}>
                  <span className={config.textMuted}>Entry Time:</span>
                  <span className={`${config.textSecondary} font-semibold`}>{formatDateTime(exitResult.entryTime)}</span>
                </div>
                <div className={`flex justify-between py-1.5 border-b ${config.borderCard}`}>
                  <span className={config.textMuted}>Exit Time:</span>
                  <span className={`${config.textSecondary} font-semibold`}>{formatDateTime(exitResult.exitTime)}</span>
                </div>
                <div className={`flex justify-between py-1.5 border-b ${config.borderCard}`}>
                  <span className={config.textMuted}>Total Duration:</span>
                  <span className={`font-bold ${config.textPrimary}`}>{exitResult.durationHours} Hours</span>
                </div>

                {/* Big Fee Display */}
                <div className={`${config.isDark ? 'bg-slate-850' : 'bg-slate-50'} p-4 rounded-xl border ${config.borderCard} my-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-[11px] uppercase tracking-wider ${config.textMuted} font-bold block`}>
                        Parking Fee:
                      </span>
                      <span className={`text-xs ${config.textMuted} font-medium`}>
                        {exitResult.feeFormula || '₹30 1st hr + ₹20 addl hr'}
                      </span>
                    </div>
                    <div className={`text-2xl font-black ${config.primaryText} font-mono flex items-center`}>
                      <span>₹{exitResult.fee}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Queue Auto-Allocation Notification */}
              {exitResult.autoAllocatedVehicle ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Automated Queue Promotion (FIFO)</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    The freed slot <strong>{exitResult.slotNumber}</strong> was automatically allocated to the first waiting vehicle:
                  </p>
                  <div className={`${config.bgCard} p-2.5 rounded-lg border border-amber-200 font-mono text-[11px] ${config.textPrimary} flex justify-between font-medium`}>
                    <span>{exitResult.autoAllocatedVehicle.vehicleNumber} ({exitResult.autoAllocatedVehicle.vehicleType})</span>
                    <span className="text-amber-700 font-bold">Owner: {exitResult.autoAllocatedVehicle.ownerName}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Slot {exitResult.slotNumber} has been freed and is now available for new parking.</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className={`flex-1 py-2.5 rounded-xl ${config.primaryBtn} ${config.primaryBtnText} text-xs font-bold shadow-md transition cursor-pointer`}
                >
                  View Large Invoice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExitResult(null);
                    setVehicleNumber('');
                  }}
                  className={`py-2.5 px-4 rounded-xl ${config.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'} hover:opacity-80 text-xs font-semibold border ${config.borderCard} transition cursor-pointer`}
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className={`${config.bgCard} rounded-2xl border ${config.borderCard} p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] shadow-sm transition-colors duration-200`}>
              <div className={`w-14 h-14 rounded-2xl ${config.primaryBgLight} border ${config.primaryBorderLight} flex items-center justify-center ${config.primaryText} mb-3`}>
                <IndianRupee className="w-7 h-7" />
              </div>
              <h3 className={`text-sm font-bold ${config.textPrimary} mb-1`}>
                Automated Fee Calculation Rules
              </h3>
              <div className={`text-xs ${config.textMuted} space-y-2 mt-2 max-w-sm`}>
                <div className={`${config.isDark ? 'bg-slate-850' : 'bg-slate-50'} p-3 rounded-xl border ${config.borderCard} text-left font-mono space-y-1`}>
                  <p className="flex justify-between"><span>• First Hour:</span> <strong className={config.textPrimary}>₹30 (Minimum)</strong></p>
                  <p className="flex justify-between"><span>• Each Addl Hour:</span> <strong className={config.textPrimary}>₹20 / hour</strong></p>
                  <p className="flex justify-between"><span>• Auto-Promotion:</span> <strong className="text-emerald-700">Instant Queue Handover</strong></p>
                </div>
                <p className={`text-[11px] ${config.textMuted}`}>
                  Select any currently parked vehicle or type its plate number on the left to process exit.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prominent High-Visibility Exit Information Receipt Modal */}
      <ExitReceiptModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={exitResult}
      />
    </div>
  );
};
