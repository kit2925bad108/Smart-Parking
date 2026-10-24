import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { adminUser, updateProfile } = useAuth();
  const { config } = useTheme();

  const [name, setName] = useState(adminUser?.name || 'Muthukrishnan (Admin)');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword && newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setLoading(true);
    const result = await updateProfile({
      name,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined
    });
    setLoading(false);

    if (result.success) {
      setStatus({ type: 'success', message: 'Admin profile updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setStatus({ type: 'error', message: result.message || 'Failed to update credentials.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`${config.bgCard} rounded-3xl max-w-lg w-full border ${config.borderCard} shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${config.borderCard} pb-4`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${config.brandGradient} flex items-center justify-center text-white shadow-xs`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-lg font-black ${config.textPrimary}`}>
                Administrator Profile &amp; Security
              </h2>
              <p className={`text-xs ${config.textMuted}`}>
                Manage admin credentials and session configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl text-slate-400 hover:${config.textPrimary} hover:bg-slate-100 transition cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              status.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Current Info Card */}
        <div className={`${config.isDark ? 'bg-slate-850' : 'bg-slate-50'} rounded-2xl p-4 border ${config.borderCard} space-y-2 text-xs font-mono`}>
          <div className="flex justify-between">
            <span className={config.textMuted}>Role:</span>
            <span className={`font-bold ${config.primaryText}`}>{adminUser?.role || 'ADMIN'}</span>
          </div>
          <div className="flex justify-between">
            <span className={config.textMuted}>Username:</span>
            <span className={`font-bold ${config.textPrimary}`}>{adminUser?.username || 'admin'}</span>
          </div>
          <div className="flex justify-between">
            <span className={config.textMuted}>Last Session:</span>
            <span className={config.textSecondary}>
              {adminUser?.lastLogin ? new Date(adminUser.lastLogin).toLocaleTimeString() : 'Active Now'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider ${config.textSecondary} mb-1.5`}>
              Admin Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full ${config.isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} border ${config.borderCard} rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 transition`}
            />
          </div>

          <div className={`pt-3 border-t ${config.borderCard}`}>
            <span className={`block text-xs font-bold uppercase tracking-wider ${config.textSecondary} mb-3 flex items-center gap-1.5`}>
              <KeyRound className="w-3.5 h-3.5" />
              Change Admin Password (Optional)
            </span>

            <div className="space-y-3">
              <div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password (required to change)"
                  className={`w-full ${config.isDark ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'} border ${config.borderCard} rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 transition font-mono`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className={`w-full ${config.isDark ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'} border ${config.borderCard} rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 transition font-mono`}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New"
                  className={`w-full ${config.isDark ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'} border ${config.borderCard} rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 transition font-mono`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl ${config.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'} text-xs font-bold border ${config.borderCard} hover:opacity-80 transition cursor-pointer`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl ${config.primaryBtn} ${config.primaryBtnText} text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50`}
            >
              {loading ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
