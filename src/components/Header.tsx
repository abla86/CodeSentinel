import React from 'react';
import { ShieldCheck, ShieldAlert, User, LogIn, UserPlus, Sparkles, Terminal, BookMarked, ScrollText, CheckCircle2, Settings as SettingsIcon, GitBranch, Lock } from 'lucide-react';
import { UserAccount } from '../types';

interface HeaderProps {
  activeTab: 'portfolio' | 'sentinel' | 'registry' | 'audit' | 'security';
  setActiveTab: (tab: 'portfolio' | 'sentinel' | 'registry' | 'audit' | 'security') => void;
  currentUser: UserAccount | null;
  onOpenAuth: (mode: 'login' | 'register' | 'rbac' | 'architecture') => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenBranchSanitation: () => void;
  verifiedCount: number;
  totalCount: number;
  onTriggerSweep: () => void;
  isSweeping: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onOpenSettings,
  onOpenBranchSanitation,
  verifiedCount,
  totalCount,
  onTriggerSweep,
  isSweeping,
}) => {
  const isSecurityAuthorized = currentUser?.role === 'lead_engineer' || currentUser?.role === 'security_auditor';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/50">
                <ShieldCheck className="w-5 h-5 text-cyan-200" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-100 tracking-tight">CodeSentinel</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded font-semibold">
                  v2.4 Truth Engine
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
                GitHub som kilde til sannhet • Ingen gjetting
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800/90 text-xs font-semibold">
            <button
              id="nav-tab-portfolio"
              onClick={() => setActiveTab('portfolio')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'portfolio'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verifisert Portfolio
            </button>

            <button
              id="nav-tab-sentinel"
              onClick={() => setActiveTab('sentinel')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'sentinel'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              CodeSentinel Kontrollsenter
            </button>

            <button
              id="nav-tab-registry"
              onClick={() => setActiveTab('registry')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'registry'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              Prosjektregister
            </button>

            <button
              id="nav-tab-audit"
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              Revisjonslogg
            </button>

            <button
              id="nav-tab-security"
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'security'
                  ? isSecurityAuthorized
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40 font-bold'
                    : 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {isSecurityAuthorized ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Sikkerhetslag (12)</span>
              {!isSecurityAuthorized && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  RBAC
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            {/* Quick Sweep Button */}
            <button
              id="quick-sweep-btn"
              onClick={onTriggerSweep}
              disabled={isSweeping}
              className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
              title="Kjør full CodeSentinel valideringstest"
            >
              {isSweeping ? (
                <span className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{isSweeping ? 'Validerer...' : 'Kjør Sannhetstest'}</span>
            </button>

            {/* Git Branch Sanitation Button */}
            <button
              id="header-branch-sanitation-btn"
              onClick={onOpenBranchSanitation}
              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-xl transition-all"
              title="Git Branch-Sanering & Duplikatkontroll"
            >
              <GitBranch className="w-4 h-4" />
            </button>

            {/* Settings & Preferences Button */}
            <button
              id="header-settings-btn"
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-xl transition-all"
              title="Innstillinger & Preferanser"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Auth Section */}
            {currentUser ? (
              <button
                id="user-profile-btn"
                onClick={onOpenProfile}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all text-xs"
              >
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${currentUser.avatarColor} flex items-center justify-center font-bold text-white text-[11px]`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-200 leading-none">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                    {currentUser.role === 'lead_engineer' ? 'Lead Architect' : currentUser.role === 'security_auditor' ? 'Revisor' : 'Gjest'}
                  </div>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Logg inn
                </button>
                <button
                  id="header-register-btn"
                  onClick={() => onOpenAuth('register')}
                  className="px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-950"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Registrer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden py-2 border-t border-slate-800/80 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'portfolio' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('sentinel')}
            className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'sentinel' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
          >
            CodeSentinel
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'registry' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
          >
            Register
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'audit' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
          >
            Revisjonslogg
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1 rounded-md shrink-0 ${activeTab === 'security' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'}`}
          >
            Sikkerhetslag
          </button>
        </div>
      </div>
    </header>
  );
};
