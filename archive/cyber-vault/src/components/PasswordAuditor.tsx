import React, { useState, useEffect } from 'react';
import { KeyRound, RefreshCw, Copy, Check, ShieldCheck, ShieldAlert, Sparkles, Sliders, AlertTriangle } from 'lucide-react';
import { calculatePasswordEntropy, generateSecurePassword } from '../utils/crypto';
import { playCyberSound } from '../utils/audio';

interface PasswordAuditorProps {
  onLog: (module: string, message: string, level?: 'info' | 'success' | 'warn' | 'secure') => void;
  resetTrigger: number;
}

export const PasswordAuditor: React.FC<PasswordAuditorProps> = ({ onLog, resetTrigger }) => {
  // Generator config
  const [length, setLength] = useState(24);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // Auditor test input
  const [testPassword, setTestPassword] = useState('');

  // Passphrase generator words
  const WORD_LIST = [
    'cyber', 'nexus', 'quantum', 'cipher', 'falcon', 'matrix', 'orbital',
    'shadow', 'shield', 'phantom', 'beacon', 'vector', 'horizon', 'glacier',
    'nebula', 'pulsar', 'vortex', 'titan', 'aurora', 'zenith', 'sentinel'
  ];

  const handleGenerate = () => {
    playCyberSound('click');
    const pwd = generateSecurePassword(length, includeUpper, includeLower, includeNumbers, includeSymbols);
    setGeneratedPassword(pwd);
    setTestPassword(pwd);
    onLog('Passordrevisjon', `Genererte nytt passord (${length} tegn) med CSPRNG entropi.`, 'secure');
  };

  const handleGeneratePassphrase = () => {
    playCyberSound('click');
    const randomVals = new Uint32Array(4);
    window.crypto.getRandomValues(randomVals);
    const phrase = Array.from(randomVals)
      .map(v => WORD_LIST[v % WORD_LIST.length])
      .join('-') + '-' + (Math.floor(Math.random() * 899) + 100);
    setGeneratedPassword(phrase);
    setTestPassword(phrase);
    onLog('Passordrevisjon', `Genererte minnevennlig Diceware-passfrase.`, 'secure');
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  useEffect(() => {
    if (resetTrigger > 0) {
      setTestPassword('');
    }
  }, [resetTrigger]);

  const handleCopy = () => {
    navigator.clipboard.writeText(testPassword || generatedPassword);
    setCopied(true);
    playCyberSound('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const entropy = calculatePasswordEntropy(testPassword);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <h2 className="text-base font-semibold text-white font-mono flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-cyan-400" />
          KRYPTOGRAFISK PASSORD-MOTOR & ENTROPI-ANALYSE
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Generer uforutsigbare nøkler med maskinvare-tilfeldighet (CSPRNG) og beregn motstand mot brute-force angrep.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              NØKKELGENERATOR (CSPRNG)
            </span>
            <button
              onClick={handleGeneratePassphrase}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
            >
              Lag Diceware-frase
            </button>
          </div>

          {/* Length Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <label htmlFor="length-range">Lengde: <strong>{length} tegn</strong></label>
              <span className="text-slate-500">8 - 64 tegn</span>
            </div>
            <input
              id="length-range"
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={e => setLength(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-1">
            <label className="flex items-center gap-2 bg-slate-950/60 p-2 rounded border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={includeUpper}
                onChange={e => setIncludeUpper(e.target.checked)}
                className="accent-cyan-500 rounded"
              />
              <span>Store bokstaver (A-Z)</span>
            </label>
            <label className="flex items-center gap-2 bg-slate-950/60 p-2 rounded border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLower}
                onChange={e => setIncludeLower(e.target.checked)}
                className="accent-cyan-500 rounded"
              />
              <span>Små bokstaver (a-z)</span>
            </label>
            <label className="flex items-center gap-2 bg-slate-950/60 p-2 rounded border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={e => setIncludeNumbers(e.target.checked)}
                className="accent-cyan-500 rounded"
              />
              <span>Tall (0-9)</span>
            </label>
            <label className="flex items-center gap-2 bg-slate-950/60 p-2 rounded border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={e => setIncludeSymbols(e.target.checked)}
                className="accent-cyan-500 rounded"
              />
              <span>Spesialtegn (!@#)</span>
            </label>
          </div>

          <button
            id="btn-generate-password"
            onClick={handleGenerate}
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-cyan-950/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>GENERER NY SIKKER NØKKEL</span>
          </button>
        </div>

        {/* Right Column: Interactive Password Auditor & Entropy */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SANNTIDS REVISJON & BRUTE-FORCE BEREGNING
            </span>
            <button
              id="btn-copy-audited-password"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopiert!' : 'Kopier passord'}</span>
            </button>
          </div>

          {/* Test Input */}
          <div className="relative">
            <input
              id="test-password-input"
              type="text"
              value={testPassword}
              onChange={e => setTestPassword(e.target.value)}
              placeholder="Skriv eller generer passord for å teste styrken..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-3 text-sm text-slate-200 font-mono pr-12 outline-none select-all"
            />
          </div>

          {/* Entropy Metric Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Shannon Entropi</div>
              <div className="text-lg font-bold font-mono text-cyan-400">{entropy.bits} bits</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Teoretisk styrke</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Sikkerhetsgrad</div>
              <div className={`text-lg font-bold font-mono ${
                entropy.score >= 90 ? 'text-emerald-400' : entropy.score >= 60 ? 'text-cyan-400' : 'text-amber-400'
              }`}>
                {entropy.verdict}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Score: {entropy.score} / 100</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Knekketid (GPU-Cluster)</div>
              <div className="text-xs font-bold font-mono text-slate-200 truncate" title={entropy.crackTimeText}>
                {entropy.crackTimeText}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">100 milliarder gjetninger/s</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  entropy.score >= 90
                    ? 'bg-emerald-500'
                    : entropy.score >= 70
                    ? 'bg-cyan-500'
                    : entropy.score >= 40
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${entropy.score}%` }}
              />
            </div>
          </div>

          {/* Warnings & Suggestions */}
          {entropy.warnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                SÅRBARHETSVARSLER
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                {entropy.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
