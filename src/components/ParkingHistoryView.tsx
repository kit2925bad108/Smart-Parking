import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download
} from 'lucide-react';
import { ParkingHistoryItem } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ParkingHistoryViewProps {
  history: ParkingHistoryItem[];
}

export const ParkingHistoryView: React.FC<ParkingHistoryViewProps> = ({ history }) => {
  const { config } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'exitTime' | 'fee' | 'durationHours'>('exitTime');
  const [sortAsc, setSortAsc] = useState(false);

  const vehicleTypes = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => {
      if (h.vehicleType) set.add(h.vehicleType);
    });
    return Array.from(set);
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => {
        const matchesSearch =
          item.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.slotNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'ALL' || item.vehicleType === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'exitTime') {
          diff = new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime();
        } else if (sortBy === 'fee') {
          diff = a.fee - b.fee;
        } else if (sortBy === 'durationHours') {
          diff = a.durationHours - b.durationHours;
        }
        return sortAsc ? diff : -diff;
      });
  }, [history, searchTerm, typeFilter, sortBy, sortAsc]);

  const totalFeeCollected = useMemo(() => {
    return history.reduce((sum, h) => sum + (h.fee || 0), 0);
  }, [history]);

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--';
    const date = new Date(timeStr);
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const exportCSV = () => {
    const headers = ['Vehicle Number,Vehicle Type,Slot,Entry Time,Exit Time,Duration (Hours),Fee (INR)'];
    const rows = filteredHistory.map(
      (h) => `"${h.vehicleNumber}","${h.vehicleType}","${h.slotNumber}","${h.entryTime}","${h.exitTime}",${h.durationHours},${h.fee}`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parking_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`${config.bgCard} p-6 rounded-2xl border ${config.borderCard} shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200`}>
        <div>
          <h1 className={`text-xl font-bold ${config.textPrimary} flex items-center gap-2`}>
            <History className={`w-5 h-5 ${config.primaryText}`} />
            <span>Parking Transaction History</span>
          </h1>
          <p className={`text-sm ${config.textMuted} mt-1`}>
            Complete audit log of all completed parking sessions, durations, and fee transactions.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`text-[11px] ${config.textMuted} uppercase tracking-wider block font-bold`}>Total Revenue</span>
            <span className={`text-lg font-mono font-black ${config.primaryText}`}>₹{totalFeeCollected}</span>
          </div>
          <button
            onClick={exportCSV}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl ${config.isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'} border ${config.borderCard} text-xs font-bold transition cursor-pointer`}
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`${config.bgCard} p-4 rounded-2xl border ${config.borderCard} shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200`}>
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vehicle number or slot..."
            className={`w-full ${config.isDark ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'} border ${config.borderCard} rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 transition`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Vehicle Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`${config.isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'} border ${config.borderCard} rounded-xl px-3 py-2 text-xs font-medium focus:outline-none cursor-pointer shadow-2xs`}
            >
              <option value="ALL">All Vehicle Types</option>
              {vehicleTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`${config.isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'} border ${config.borderCard} rounded-xl px-3 py-2 text-xs font-medium focus:outline-none cursor-pointer shadow-2xs`}
            >
              <option value="exitTime">Sort by Exit Time</option>
              <option value="fee">Sort by Parking Fee</option>
              <option value="durationHours">Sort by Duration</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className={`px-3 py-2 rounded-xl ${config.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} text-xs font-semibold border ${config.borderCard} cursor-pointer transition`}
            >
              {sortAsc ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className={`${config.bgCard} rounded-2xl border ${config.borderCard} overflow-hidden shadow-sm transition-colors duration-200`}>
        {filteredHistory.length === 0 ? (
          <div className={`p-12 text-center ${config.textMuted} text-xs`}>
            No history records match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className={`${config.isDark ? 'bg-slate-850' : 'bg-slate-50'} ${config.textMuted} uppercase tracking-wider text-[11px] border-b ${config.borderCard}`}>
                <tr>
                  <th className="px-5 py-3.5">Vehicle Number</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Slot</th>
                  <th className="px-5 py-3.5">Entry Time</th>
                  <th className="px-5 py-3.5">Exit Time</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5">Fee</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${config.isDark ? 'divide-slate-800' : 'divide-slate-100'} ${config.textSecondary}`}>
                {filteredHistory.map((item) => (
                  <tr key={item.id} className={`hover:${config.isDark ? 'bg-slate-850' : 'bg-slate-50'} transition`}>
                    <td className={`px-5 py-3.5 whitespace-nowrap font-bold ${config.textPrimary}`}>
                      {item.vehicleNumber}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded ${config.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'} border ${config.borderCard} text-[10px] font-semibold`}>
                        {item.vehicleType}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap font-bold ${config.primaryText}`}>
                      {item.slotNumber}
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap ${config.textMuted}`}>
                      {formatTime(item.entryTime)}
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap ${config.textSecondary} font-medium`}>
                      {formatTime(item.exitTime)}
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap ${config.textPrimary} font-bold`}>
                      {item.durationHours} hrs
                    </td>
                    <td className={`px-5 py-3.5 whitespace-nowrap ${config.primaryText} font-bold text-sm`}>
                      ₹{item.fee}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
