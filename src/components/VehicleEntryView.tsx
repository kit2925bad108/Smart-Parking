import React, { useState } from 'react';
import { 
  Car, 
  User, 
  Tag, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import { apiFetch } from '../api/config';
import { EntryResponse } from '../types';
import { useTheme } from '../context/ThemeContext';

interface VehicleEntryViewProps {
  onSuccess: () => void;
  availableSlotsCount: number;
}

export const VehicleEntryView: React.FC<VehicleEntryViewProps> = ({
  onSuccess,
  availableSlotsCount
}) => {
  const { config } = useTheme();
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EntryResponse | null>(null);

  const samplePlates = ['TN38AB1234', 'TN40CD5678', 'KA05MN9900', 'MH12XY7788', 'DL03ZZ4567'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setError('Please enter a vehicle registration number.');
      return;
    }
    if (!ownerName.trim()) {
      setError('Please enter the vehicle owner name.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiFetch<EntryResponse>('/vehicles/entry', {
        method: 'POST',
        body: JSON.stringify({
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehicleType,
          ownerName: ownerName.trim()
        })
      });

      setResult(data);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to process vehicle entry');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setVehicleNumber('');
    setOwnerName('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className={`${config.bgCard} p-6 rounded-2xl border ${config.borderCard} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200`}>
        <div>
          <h1 className={`text-xl font-bold ${config.textPrimary} flex items-center gap-2`}>
            <Car className={`w-5 h-5 ${config.primaryText}`} />
            <span>Vehicle Entry Registration</span>
          </h1>
          <p className={`text-sm ${config.textMuted} mt-1`}>
            Automated parking slot assignment and waiting queue registration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              availableSlotsCount > 0
                ? `${config.primaryBgLight} ${config.primaryText} ${config.primaryBorderLight}`
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {availableSlotsCount > 0 ? `${availableSlotsCount} Slots Available` : 'Parking Full (Queue Active)'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Col: Entry Form */}
        <div className={`md:col-span-7 ${config.bgCard} rounded-2xl border ${config.borderCard} p-6 shadow-sm transition-colors duration-200`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle Number */}
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
                  placeholder="e.g. TN38AB1234"
                  maxLength={15}
                  className={`w-full ${config.isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} border ${config.borderCard} rounded-xl px-4 py-3 font-mono uppercase tracking-wider text-sm focus:outline-none focus:ring-1 transition`}
                />
                <Tag className={`w-4 h-4 ${config.textMuted} absolute right-3.5 top-3.5`} />
              </div>

              {/* Sample Plate suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className={`text-[11px] ${config.textMuted} font-medium`}>Quick fill:</span>
                {samplePlates.map((plate) => (
                  <button
                    key={plate}
                    type="button"
                    onClick={() => setVehicleNumber(plate)}
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${config.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'} hover:opacity-80 border ${config.borderCard} transition cursor-pointer`}
                  >
                    {plate}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${config.textSecondary} mb-1.5`}>
                Vehicle Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {['Car', 'Bike', 'SUV', 'Electric Car', 'Truck'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVehicleType(type)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                      vehicleType === type
                        ? `${config.primaryBtn} ${config.primaryBtnText} border-transparent shadow-xs`
                        : `${config.isDark ? 'bg-slate-850 text-slate-300' : 'bg-slate-50 text-slate-700'} ${config.borderCard} hover:opacity-80`
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider ${config.textSecondary} mb-1.5`}>
                Owner Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => {
                    setOwnerName(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Muthukrishnan"
                  className={`w-full ${config.isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} border ${config.borderCard} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition`}
                />
                <User className={`w-4 h-4 ${config.textMuted} absolute right-3.5 top-3.5`} />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl ${config.primaryBtn} ${config.primaryBtnText} font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Allocating Slot...</span>
                </>
              ) : (
                <>
                  <Car className="w-4 h-4" />
                  <span>PARK VEHICLE</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Live Feedback & Receipt Card */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4">
          {result ? (
            <div
              className={`rounded-2xl border p-6 shadow-sm ${config.bgCard} ${
                result.status === 'PARKED'
                  ? 'border-emerald-300'
                  : 'border-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-4">
                {result.status === 'PARKED' ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className={`font-bold text-base ${config.textPrimary}`}>
                    {result.status === 'PARKED'
                      ? '✓ Vehicle parked successfully'
                      : '⚠ Parking Full'}
                  </h3>
                  <p className={`text-xs ${config.textMuted} font-medium`}>
                    {result.message}
                  </p>
                </div>
              </div>

              <div className={`${config.isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-xl p-4 border space-y-2 text-xs font-mono`}>
                <div className={`flex justify-between border-b ${config.borderCard} pb-2`}>
                  <span className={config.textMuted}>Vehicle Number:</span>
                  <span className={`font-bold ${config.textPrimary}`}>{result.vehicleNumber}</span>
                </div>
                <div className={`flex justify-between border-b ${config.borderCard} pb-2`}>
                  <span className={config.textMuted}>Vehicle Type:</span>
                  <span className={config.textSecondary}>{result.vehicleType}</span>
                </div>
                <div className={`flex justify-between border-b ${config.borderCard} pb-2`}>
                  <span className={config.textMuted}>Owner Name:</span>
                  <span className={config.textSecondary}>{result.ownerName}</span>
                </div>

                {result.status === 'PARKED' ? (
                  <div className="flex justify-between pt-1 text-sm font-bold text-emerald-700">
                    <span>Allocated Slot:</span>
                    <span className="bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 text-emerald-800">
                      {result.slotNumber}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between pt-1 text-sm font-bold text-amber-700">
                    <span>Queue Position:</span>
                    <span className="bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300 text-amber-800">
                      #{result.queuePosition} (FIFO)
                    </span>
                  </div>
                )}

                <div className={`flex justify-between pt-1 text-[11px] ${config.textMuted}`}>
                  <span>Timestamp:</span>
                  <span>{new Date(result.entryTime || '').toLocaleTimeString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetForm}
                className={`mt-4 w-full py-2.5 rounded-xl ${config.isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'} text-xs font-bold border ${config.borderCard} transition cursor-pointer`}
              >
                Park Another Vehicle
              </button>
            </div>
          ) : (
            <div className={`${config.bgCard} rounded-2xl border ${config.borderCard} p-6 flex flex-col justify-center items-center text-center h-full min-h-[260px] shadow-sm transition-colors duration-200`}>
              <div className={`w-12 h-12 rounded-2xl ${config.primaryBgLight} border ${config.primaryBorderLight} flex items-center justify-center ${config.primaryText} mb-3`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className={`text-sm font-bold ${config.textPrimary} mb-1`}>
                Automated Allocation Engine
              </h3>
              <p className={`text-xs ${config.textMuted} max-w-xs`}>
                Fill the vehicle registration form on the left. The system will automatically allocate the closest available slot or add the vehicle to the waiting queue if full.
              </p>
            </div>
          )}

          {/* Operational Policy Card */}
          <div className={`${config.isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-xl p-4 border text-xs`}>
            <h4 className={`font-bold ${config.textSecondary} text-xs flex items-center gap-1.5 mb-2`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.statusDot}`}></span>
              Parking Entry Protocol:
            </h4>
            <div className={`font-mono text-[11px] ${config.textMuted} space-y-1`}>
              <p>1. Verify vehicle plate registration</p>
              <p>2. Automatically allocate lowest free slot (P01-P20)</p>
              <p>3. If capacity reached, position in waiting queue</p>
              <p>4. Issue timestamped digital entry ticket</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
