import React from 'react';
import { Terminal, Trash2, X } from 'lucide-react';
import { LogEntry } from '../types';

interface TerminalLogProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TerminalLog: React.FC<TerminalLogProps> = ({
  logs,
  onClearLogs,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <aside aria-label="Kryptografisk aktivitetslogg" className="fixed bottom-0 left-0 right-0 z-30 bg-[#070b12] border-t border-slate-800/90 shadow-2xl backdrop-blur-xl max-h-64 flex flex-col transition-all">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold text-slate-200">
            CYBER ACTIVITY LOG // KRYPTOGRAFISK REVISJONSSPÅR
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
            {logs.length} hendelser
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-clear-logs"
            onClick={onClearLogs}
            title="Tøm aktivitetslogg"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Tøm</span>
          </button>
          <button
            id="btn-close-logs"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-3 font-mono text-xs space-y-1.5 scrollbar-thin">
        {logs.length === 0 ? (
          <p className="text-slate-500 italic">Ingen kryptografiske operasjoner utført ennå.</p>
        ) : (
          logs.map(log => {
            let color = 'text-slate-300';
            let badge = 'bg-slate-800 text-slate-300';
            if (log.level === 'success') {
              color = 'text-emerald-300';
              badge = 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30';
            } else if (log.level === 'warn') {
              color = 'text-amber-300';
              badge = 'bg-amber-950/70 text-amber-400 border border-amber-500/30';
            } else if (log.level === 'secure') {
              color = 'text-cyan-300';
              badge = 'bg-cyan-950/70 text-cyan-400 border border-cyan-500/30';
            }

            return (
              <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/50 px-1 py-0.5 rounded">
                <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                <span className={`px-1 rounded text-[10px] uppercase font-semibold ${badge}`}>
                  {log.module}
                </span>
                <span className={`flex-1 break-all ${color}`}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
