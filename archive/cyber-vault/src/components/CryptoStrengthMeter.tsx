import React from 'react';
import { ShieldCheck, ShieldAlert, Shield, Zap, Sparkles, Activity, AlertTriangle } from 'lucide-react';
import { calculatePasswordEntropy } from '../utils/crypto';
import { PasswordEntropy } from '../types';

interface CryptoStrengthMeterProps {
  password: string;
  title?: string;
  showDetails?: boolean;
  compact?: boolean;
  id?: string;
}

export const CryptoStrengthMeter: React.FC<CryptoStrengthMeterProps> = ({
  password,
  title = 'Crypto Strength',
  showDetails = true,
  compact = false,
  id = 'crypto-strength-meter'
}) => {
  const entropy: PasswordEntropy = calculatePasswordEntropy(password);

  // Color mapping based on entropy score & verdict
  const getColorStyles = () => {
    if (!password) {
      return {
        bar: 'bg-slate-700',
        text: 'text-slate-400',
        badge: 'bg-slate-800 text-slate-400 border-slate-700',
        glow: 'shadow-none',
        icon: <Shield className="w-3.5 h-3.5 text-slate-500" />
      };
    }
    if (entropy.score >= 90) {
      return {
        bar: 'bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-300',
        text: 'text-emerald-400',
        badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-900/30',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      };
    }
    if (entropy.score >= 65) {
      return {
        bar: 'bg-gradient-to-r from-blue-500 to-cyan-400',
        text: 'text-cyan-400',
        badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-900/30',
        glow: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
      };
    }
    if (entropy.score >= 40) {
      return {
        bar: 'bg-gradient-to-r from-amber-600 to-amber-400',
        text: 'text-amber-400',
        badge: 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-900/30',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.25)]',
        icon: <Shield className="w-3.5 h-3.5 text-amber-400" />
      };
    }
    return {
      bar: 'bg-gradient-to-r from-rose-600 to-rose-400',
      text: 'text-rose-400',
      badge: 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-900/30',
      glow: 'shadow-[0_0_10px_rgba(244,63,94,0.3)]',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
    };
  };

  const colors = getColorStyles();
  const clampedScore = Math.max(password ? 5 : 0, Math.min(100, entropy.score));

  if (compact) {
    return (
      <div id={id} className="space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            {colors.icon}
            <span>{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold ${colors.text}`}>
              {entropy.bits} bits
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors.badge}`}>
              {password ? entropy.verdict : 'Ingen nøkkel'}
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${colors.bar} ${colors.glow}`}
            style={{ width: `${clampedScore}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3 font-mono"
    >
      {/* Top Header: Title, Bits Counter & Verdict Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-slate-900 border border-slate-800">
            {colors.icon}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 tracking-wider flex items-center gap-1.5 uppercase">
              <span>{title}</span>
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400">
              Sanntids Shannon-entropi & brute-force resistans
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={`text-sm font-extrabold tracking-tight ${colors.text}`}>
              {entropy.bits} <span className="text-[10px] font-normal text-slate-400">BITS</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {entropy.score}% Styrkegrad
            </div>
          </div>

          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${colors.badge}`}>
            {password ? entropy.verdict : 'Venter på nøkkel'}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar with Segment Guides */}
      <div className="space-y-1">
        <div className="relative w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800 p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${colors.bar} ${colors.glow}`}
            style={{ width: `${clampedScore}%` }}
          />
          {/* Subtle 25%, 50%, 75% tick marks for visual precision */}
          <div className="absolute inset-0 flex justify-between pointer-events-none px-[25%] opacity-20">
            <div className="w-[1px] h-full bg-white" />
            <div className="w-[1px] h-full bg-white" />
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 px-0.5">
          <span>0 bits (Svak)</span>
          <span>64 bits (Moderat)</span>
          <span>100 bits (Sterk)</span>
          <span>128+ bits (Militær)</span>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Real-time Telemetry Grid: Charsets & Brute Force Calculation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className={`px-2 py-1.5 rounded-lg border text-center transition-colors ${
              entropy.hasLower
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
            }`}>
              <div className="text-[10px] uppercase font-bold">a-z</div>
              <div className="text-[9px] mt-0.5">Små tegn</div>
            </div>

            <div className={`px-2 py-1.5 rounded-lg border text-center transition-colors ${
              entropy.hasUpper
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
            }`}>
              <div className="text-[10px] uppercase font-bold">A-Z</div>
              <div className="text-[9px] mt-0.5">Store tegn</div>
            </div>

            <div className={`px-2 py-1.5 rounded-lg border text-center transition-colors ${
              entropy.hasNumber
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
            }`}>
              <div className="text-[10px] uppercase font-bold">0-9</div>
              <div className="text-[9px] mt-0.5">Sifre</div>
            </div>

            <div className={`px-2 py-1.5 rounded-lg border text-center transition-colors ${
              entropy.hasSpecial
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
            }`}>
              <div className="text-[10px] uppercase font-bold">#!?</div>
              <div className="text-[9px] mt-0.5">Symboler</div>
            </div>
          </div>

          {/* Crack Resistance & Feedback */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] pt-1 border-t border-slate-800/80 text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>GPU-knekketid:</span>
              <strong className={`font-mono ${colors.text}`}>
                {password ? entropy.crackTimeText : 'Ingen nøkkel angitt'}
              </strong>
            </div>

            <div className="text-[10px] text-slate-500">
              Lengde: <strong className="text-slate-300">{entropy.length}</strong> tegn
            </div>
          </div>

          {/* Contextual Warning if weak password */}
          {password && entropy.warnings.length > 0 && entropy.score < 70 && (
            <div className="flex items-start gap-1.5 text-[10px] text-amber-300/90 bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{entropy.warnings[0]}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
