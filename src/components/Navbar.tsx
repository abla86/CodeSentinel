import React from 'react';
import { ShieldCheck, ShieldAlert, Volume2, VolumeX, Flame, Terminal, Lock, FileCode2, Eye, KeyRound, Binary, ShieldAlert as DefenseIcon } from 'lucide-react';
import { ActiveTab } from '../types';
import { playCyberSound } from '../utils/audio';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onPanicWipe: () => void;
  terminalOpen: boolean;
  setTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  toggleSound,
  onPanicWipe,
  terminalOpen,
  setTerminalOpen
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'text-vault', label: 'Teksthvelv', icon: <Lock className="w-4 h-4" /> },
    { id: 'file-vault', label: 'Filhvelv', icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'steganography', label: 'Steganografi', icon: <Eye className="w-4 h-4" /> },
    { id: 'hash-studio', label: 'Hash Studio', icon: <Terminal className="w-4 h-4" /> },
    { id: 'password-audit', label: 'Passordrevisjon', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'payload-decoder', label: 'Payload Dekoder', icon: <Binary className="w-4 h-4" /> },
    { id: 'cyber-defense', label: 'Forsvar & Herding', icon: <DefenseIcon className="w-4 h-4" /> }
  ];

  return (
    <header className="border-b border-slate-800/80 bg-[#0c121e]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top status banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800/40 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">ZERO-KNOWLEDGE ARKITEKTUR</span>
          </div>
          <span className="hidden md:inline text-slate-400 font-mono text-[11px]">
            Ingen data sendes til server • 100% Klientside Web Crypto • AES-256-GCM
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-sound-toggle"
            onClick={toggleSound}
            title={soundEnabled ? 'Demp lydeffekter' : 'Aktiver lydeffekter'}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors border border-slate-700/50"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <button
            id="btn-terminal-toggle"
            onClick={() => {
              playCyberSound('click');
              setTerminalOpen(!terminalOpen);
            }}
            title="Åpne/lukk Cyber Terminal Logg"
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
              terminalOpen
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Kryptologg</span>
          </button>

          <button
            id="btn-panic-wipe"
            onClick={() => {
              playCyberSound('wipe');
              onPanicWipe();
            }}
            title="Nødsletting: Tømmer minne, buffere og dekryptert innhold umiddelbart"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-600/40 text-rose-300 hover:text-rose-100 font-mono text-[11px] font-medium transition-all group"
          >
            <Flame className="w-3 h-3 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>Nødslett minne</span>
          </button>
        </div>
      </div>

      {/* Main navigation & title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600/30 via-slate-800 to-emerald-600/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/40">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-mono">
                CYBER<span className="text-cyan-400">VAULT</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                v2.4 SECURE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cybersikkerhet, klientside krypto-hvelv og digitalt forsvar
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                  playCyberSound('click');
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 border border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-950'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
