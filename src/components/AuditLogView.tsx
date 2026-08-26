import React, { useState } from 'react';
import { AuditLogEntry } from '../types';
import { ScrollText, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, UserCheck, RefreshCw } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
  onClearLogs?: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'blocked' | 'success' | 'warning'>('all');

  const filteredLogs = logs.filter(l => {
    if (filter === 'blocked') return l.status === 'blocked' || l.action === 'SECURITY_BLOCKED';
    if (filter === 'success') return l.status === 'success';
    if (filter === 'warning') return l.status === 'warning';
    return true;
  });

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <ScrollText className="w-4 h-4" />
            <span>KONTROLLSPOR & REVISJONSHISTORIKK</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Revisjonslogg & Sannhetsrapport
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Tidsstemplet sporbarhet over alle CodeSentinel-valideringer, automatiske sperrer og registerendringer.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alle ({logs.length})
          </button>
          <button
            onClick={() => setFilter('blocked')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'blocked' ? 'bg-rose-900/60 text-rose-300 font-bold border border-rose-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⛔ Sperrer (Sikkerhet)
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'success' ? 'bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✓ Verifisert
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const isBlocked = log.status === 'blocked' || log.action === 'SECURITY_BLOCKED';
          const isSuccess = log.status === 'success';

          return (
            <div
              key={log.id}
              className={`p-4 rounded-xl border transition-all ${
                isBlocked
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-200 shadow-md shadow-rose-950/30'
                  : isSuccess
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isBlocked ? 'bg-rose-500/20 text-rose-400' : isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {isBlocked ? <ShieldAlert className="w-4 h-4" /> : isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-100">{log.action}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">Utført av: {log.actor}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleString('no-NO')}
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-sans pl-8">
                {log.details}
              </p>

              {log.projectId && (
                <div className="pl-8 mt-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-cyan-400 border border-slate-800">
                    Prosjekt-ID: {log.projectId}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
