/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { VehicleEntryView } from './components/VehicleEntryView';
import { VehicleExitView } from './components/VehicleExitView';
import { ParkingSlotsView } from './components/ParkingSlotsView';
import { WaitingQueueView } from './components/WaitingQueueView';
import { ParkingHistoryView } from './components/ParkingHistoryView';
import { apiFetch } from './api/config';
import { 
  DashboardStats, 
  ParkingSlot, 
  Vehicle, 
  WaitingVehicle, 
  ParkingHistoryItem 
} from './types';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { AdminLoginView } from './components/AdminLoginView';

export default function App() {
  const { config } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [parkedVehicles, setParkedVehicles] = useState<Vehicle[]>([]);
  const [queue, setQueue] = useState<WaitingVehicle[]>([]);
  const [history, setHistory] = useState<ParkingHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadAllData = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const [statsData, slotsData, parkedData, queueData, historyData] = await Promise.all([
        apiFetch<DashboardStats>('/dashboard').catch(() => null),
        apiFetch<ParkingSlot[]>('/slots').catch(() => []),
        apiFetch<Vehicle[]>('/vehicles').catch(() => []),
        apiFetch<WaitingVehicle[]>('/queue').catch(() => []),
        apiFetch<ParkingHistoryItem[]>('/history').catch(() => [])
      ]);

      if (statsData) setStats(statsData);
      setSlots(slotsData || []);
      setParkedVehicles(parkedData || []);
      setQueue(queueData || []);
      setHistory(historyData || []);
    } catch (err: any) {
      console.error('Error fetching parking data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    // Poll every 8 seconds to keep live state synchronized across any parallel tabs
    const interval = setInterval(() => {
      loadAllData(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  const handleResetData = async () => {
    if (!window.confirm('Reset all demo data back to clean state?')) return;
    try {
      await apiFetch('/reset', { method: 'POST' });
      showToast('Parking database reset successfully', 'info');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reset', 'error');
    }
  };

  const handleSeedFull = async () => {
    try {
      const res = await apiFetch<{ message: string }>('/seed-full', { method: 'POST' });
      showToast(res.message || 'All 20 parking slots filled! Next entry will queue.', 'success');
      await loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to seed full slots', 'error');
    }
  };

  const handleQuickExit = (vehicleNumber: string) => {
    setCurrentTab('exit');
  };

  const handleQuickPark = (slotNumber: string) => {
    setCurrentTab('entry');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${config.bgPage} flex flex-col items-center justify-center space-y-3 font-sans`}>
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className={`text-xs ${config.textMuted} font-mono`}>Verifying administrator session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginView />;
  }

  return (
    <div className={`min-h-screen ${config.bgPage} ${config.textPrimary} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Navbar */}
      <Navbar
        onRefresh={() => loadAllData()}
        onReset={handleResetData}
        onSeedFull={handleSeedFull}
        isRefreshing={isRefreshing}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          waitingCount={queue.length}
          occupiedCount={parkedVehicles.length}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <div className={`w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin`}></div>
              <p className={`text-xs ${config.textMuted} font-mono`}>
                Connecting to Smart Parking System...
              </p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  slots={slots}
                  onNavigate={(tab) => setCurrentTab(tab)}
                  onSelectSlot={(slot) => {
                    if (slot.status === 'OCCUPIED' && slot.vehicleNumber) {
                      handleQuickExit(slot.vehicleNumber);
                    } else {
                      handleQuickPark(slot.slotNumber);
                    }
                  }}
                  onSeedFull={handleSeedFull}
                />
              )}

              {currentTab === 'entry' && (
                <VehicleEntryView
                  onSuccess={() => {
                    loadAllData(true);
                    showToast('Entry operation recorded in database', 'success');
                  }}
                  availableSlotsCount={stats?.availableSlots ?? 0}
                />
              )}

              {currentTab === 'exit' && (
                <VehicleExitView
                  parkedVehicles={parkedVehicles}
                  onSuccess={() => {
                    loadAllData(true);
                    showToast('Vehicle exit processed & invoice generated', 'success');
                  }}
                />
              )}

              {currentTab === 'slots' && (
                <ParkingSlotsView
                  slots={slots}
                  onQuickExit={(vNum) => {
                    setCurrentTab('exit');
                  }}
                  onQuickPark={(sNum) => {
                    setCurrentTab('entry');
                  }}
                />
              )}

              {currentTab === 'queue' && (
                <WaitingQueueView
                  queue={queue}
                  onNavigate={(tab) => setCurrentTab(tab)}
                />
              )}

              {currentTab === 'history' && (
                <ParkingHistoryView history={history} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center space-x-2.5 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-white text-emerald-900 border-emerald-300'
                : toast.type === 'error'
                ? 'bg-white text-rose-900 border-rose-300'
                : 'bg-white text-indigo-900 border-indigo-300'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-600 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
