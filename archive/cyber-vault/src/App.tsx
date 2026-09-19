/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, LogEntry } from './types';
import { Navbar } from './components/Navbar';
import { TerminalLog } from './components/TerminalLog';
import { TextVault } from './components/TextVault';
import { FileVault } from './components/FileVault';
import { StegoLab } from './components/StegoLab';
import { HashStudio } from './components/HashStudio';
import { PasswordAuditor } from './components/PasswordAuditor';
import { PayloadAnalyzer } from './components/PayloadAnalyzer';
import { DefenseGuide } from './components/DefenseGuide';
import { isSoundEnabled, setSoundEnabled, playCyberSound } from './utils/audio';
import { ShieldCheck, Cpu, HardDrive, Zap, Info, Flame } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('text-vault');
  const [soundOn, setSoundOn] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showWipeNotice, setShowWipeNotice] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'secure',
      module: 'Kjerne',
      message: 'CyberVault Sikkerhetskjerne v2.4 initialisert. Web Crypto API tilgjengelig.'
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      module: 'Nettverk',
      message: 'Air-Gapped Modus: Null nettverkskall til eksterne servere for krypto-data.'
    }
  ]);

  const addLog = (
    module: string,
    message: string,
    level: 'info' | 'success' | 'warn' | 'secure' = 'info'
  ) => {
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      module
    };
    setLogs(prev => [newEntry, ...prev.slice(0, 99)]);
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playCyberSound('click');
  };

  const handlePanicWipe = () => {
    setResetTrigger(prev => prev + 1);
    addLog('Nødsletting', 'PANIC BUTTON AKTIVERT: Alle aktive buffere, klartekster og sesjonsnøkler nullstilt.', 'warn');
    setShowWipeNotice(true);
    setTimeout(() => {
      setShowWipeNotice(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundOn}
        toggleSound={handleToggleSound}
        onPanicWipe={handlePanicWipe}
        terminalOpen={terminalOpen}
        setTerminalOpen={setTerminalOpen}
      />

      {/* Emergency Wipe Banner Notification */}
      {showWipeNotice && (
        <div className="bg-rose-900/90 border-b border-rose-500 text-white px-4 py-2.5 text-center text-xs font-mono font-bold flex items-center justify-center gap-2 animate-bounce">
          <Flame className="w-4 h-4 text-rose-300" />
          <span>MINNET ER NULLSTILT: Alle åpne nøkler og dekryptert data er fjernet fra arbeidsminnet (RAM).</span>
        </div>
      )}

      {/* Main workspace container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-20">
        {activeTab === 'text-vault' && (
          <TextVault onLog={addLog} resetTrigger={resetTrigger} />
        )}

        {activeTab === 'file-vault' && (
          <FileVault onLog={addLog} resetTrigger={resetTrigger} />
        )}

        {activeTab === 'steganography' && (
          <StegoLab onLog={addLog} resetTrigger={resetTrigger} />
        )}

        {activeTab === 'hash-studio' && (
          <HashStudio onLog={addLog} resetTrigger={resetTrigger} />
        )}

        {activeTab === 'password-audit' && (
          <PasswordAuditor onLog={addLog} resetTrigger={resetTrigger} />
        )}

        {activeTab === 'payload-decoder' && (
          <PayloadAnalyzer onLog={addLog} resetTrigger={resetTrigger} />
        )}

        {activeTab === 'cyber-defense' && (
          <DefenseGuide onLog={addLog} />
        )}
      </main>

      {/* Bottom status telemetry bar */}
      <footer className="border-t border-slate-800/80 bg-[#090d15] py-3 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TLS 1.3 / Subtles Aktiv</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Maskinvare CSPRNG</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Zero-Remote Persistence</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setTerminalOpen(!terminalOpen)}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              {terminalOpen ? 'Skjul Kryptologg' : `Vis Kryptologg (${logs.length})`}
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">
              Bygget for etisk sikkerhet & konfidensialitet
            </span>
          </div>
        </div>
      </footer>

      {/* Terminal Drawer */}
      <TerminalLog
        logs={logs}
        onClearLogs={() => setLogs([])}
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
      />
    </div>
  );
}
