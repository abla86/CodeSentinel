import React, { useState } from 'react';
import { X, User, Shield, KeyRound, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types';
import { USER_ROLES, updateUserProfile, logoutUser } from '../lib/auth';

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserAccount;
  onClose: () => void;
  onUserUpdated: (user: UserAccount) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onUserUpdated,
  onLogout,
}) => {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const currentRoleInfo = USER_ROLES[user.role] || USER_ROLES.guest_reviewer;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);

    const res = await updateUserProfile(user.id, {
      name,
      role,
      newPassword: newPassword ? newPassword : undefined,
    });

    setSaving(false);

    if (res.success && res.user) {
      setFeedback({ type: 'success', message: 'Profilen ble oppdatert!' });
      onUserUpdated(res.user);
      setNewPassword('');
    } else {
      setFeedback({ type: 'error', message: res.error || 'Kunne ikke oppdatere profilen.' });
    }
  };

  const handleLogoutClick = () => {
    logoutUser();
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="user-profile-modal"
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-800">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${user.avatarColor} flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              {user.name}
            </h2>
            <div className="text-xs text-slate-400 font-mono">{user.email}</div>
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Shield className="w-3 h-3" />
              {currentRoleInfo.name}
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-start gap-2.5 ${
            feedback.type === 'success' ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300' : 'bg-rose-950/50 border border-rose-800 text-rose-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Permissions Overview */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Aktive Tilgangsrettigheter</span>
          </div>
          <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Redigere Prosjektregister:</span>
              <span className={currentRoleInfo.canEditRegistry ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {currentRoleInfo.canEditRegistry ? '✓ Tillatt' : '✗ Kun skrivebeskyttet'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Kjøre CodeSentinel Sannhetstest:</span>
              <span className={currentRoleInfo.canRunSentinel ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {currentRoleInfo.canRunSentinel ? '✓ Tillatt' : '✗ Kun visning'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Godkjenne / Løse Flaggede Avvik:</span>
              <span className={currentRoleInfo.canApproveFlags ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {currentRoleInfo.canApproveFlags ? '✓ Tillatt' : '✗ Kun visning'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Visningsnavn</label>
            <div className="relative">
              <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Rolle (Velg for å teste tilgang)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="lead_engineer">{USER_ROLES.lead_engineer.name}</option>
              <option value="security_auditor">{USER_ROLES.security_auditor.name}</option>
              <option value="guest_reviewer">{USER_ROLES.guest_reviewer.name}</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Endre Passord (valgfritt)</label>
            <div className="relative">
              <KeyRound className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="La stå tomt for å beholde gjeldende"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              id="save-profile-btn"
              type="submit"
              disabled={saving}
              className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              Lagre Endringer
            </button>
            <button
              id="user-logout-btn"
              type="button"
              onClick={handleLogoutClick}
              className="py-2 px-3 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logg ut
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
