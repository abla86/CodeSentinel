import React, { useState, useRef } from 'react';
import { Terminal, Copy, Check, ShieldCheck, ShieldAlert, Upload, FileCheck, RefreshCw, Key } from 'lucide-react';
import { computeHashes } from '../utils/crypto';
import { HashResult } from '../types';
import { playCyberSound } from '../utils/audio';

interface HashStudioProps {
  onLog: (module: string, message: string, level?: 'info' | 'success' | 'warn' | 'secure') => void;
  resetTrigger: number;
}

export const HashStudio: React.FC<HashStudioProps> = ({ onLog, resetTrigger }) => {
  const [sourceType, setSourceType] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('CyberVault Secure Checksum Standard 2026');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<HashResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Verification tool
  const [expectedHash, setExpectedHash] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (resetTrigger > 0) {
      setInputText('');
      setSelectedFile(null);
      setHashes(null);
      setExpectedHash('');
    }
  }, [resetTrigger]);

  // Initial calculation
  React.useEffect(() => {
    if (sourceType === 'text' && inputText) {
      calculateTextHash(inputText);
    }
  }, [inputText, sourceType]);

  const calculateTextHash = async (text: string) => {
    setIsCalculating(true);
    try {
      const result = await computeHashes(text);
      setHashes(result);
    } catch (err: any) {
      onLog('Hash Studio', `Feil ved hash-beregning: ${err.message}`, 'warn');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setSelectedFile(file);
      setIsCalculating(true);
      playCyberSound('click');
      onLog('Hash Studio', `Beregner SHA-256/512 sjekksum for ${file.name}...`, 'info');

      try {
        const buffer = await file.arrayBuffer();
        const result = await computeHashes(buffer);
        setHashes(result);
        playCyberSound('success');
        onLog('Hash Studio', `Sjekksum beregnet for ${file.name}: ${result.sha256.slice(0, 16)}...`, 'success');
      } catch (err: any) {
        playCyberSound('alert');
        onLog('Hash Studio', `Feil ved lesing av fil: ${err.message}`, 'warn');
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    playCyberSound('click');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Compare expected hash against all computed hashes
  const cleanExpected = expectedHash.trim().toLowerCase();
  let matchAlgorithm: string | null = null;
  if (cleanExpected && hashes) {
    if (hashes.sha256.toLowerCase() === cleanExpected) matchAlgorithm = 'SHA-256';
    else if (hashes.sha512.toLowerCase() === cleanExpected) matchAlgorithm = 'SHA-512';
    else if (hashes.sha384.toLowerCase() === cleanExpected) matchAlgorithm = 'SHA-384';
    else if (hashes.sha1.toLowerCase() === cleanExpected) matchAlgorithm = 'SHA-1';
    else if (hashes.md5.toLowerCase() === cleanExpected) matchAlgorithm = 'MD5';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white font-mono flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            KRYPTOGRAFISK HASH & SJEKKSUM STUDIO
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verifiser filers integritet, oppdag manipulasjon og generer kryptografiske fingeravtrykk.
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            id="btn-source-text"
            onClick={() => {
              playCyberSound('click');
              setSourceType('text');
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              sourceType === 'text'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tekst & Streng
          </button>
          <button
            id="btn-source-file"
            onClick={() => {
              playCyberSound('click');
              setSourceType('file');
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              sourceType === 'file'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fil på disk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Key className="w-4 h-4 text-cyan-400" />
              {sourceType === 'text' ? 'INNDATA-TEKST' : 'VELG FIL FOR SJEKKSUM'}
            </span>

            {sourceType === 'text' ? (
              <textarea
                id="hash-input-text"
                rows={5}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Skriv inn tekst for å beregne kryptografiske fingeravtrykk..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-3 text-xs text-slate-200 font-mono resize-none outline-none"
              />
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-36 ${
                  selectedFile
                    ? 'border-cyan-500/50 bg-cyan-950/20'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={e => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-1">
                    <FileCheck className="w-8 h-8 text-cyan-400 mx-auto" />
                    <div className="text-xs font-mono font-bold text-slate-200 break-all">{selectedFile.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs font-mono text-slate-300">Klikk for å velge fil fra maskinen</p>
                  </div>
                )}
              </div>
            )}

            {/* Expected hash verification tool */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label htmlFor="expected-hash-input" className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                <span>VERIFISER MOT FORVENTET HASH</span>
                <span className="text-[10px] text-slate-500 font-normal">Integritetssjekk</span>
              </label>
              <input
                id="expected-hash-input"
                type="text"
                value={expectedHash}
                onChange={e => setExpectedHash(e.target.value)}
                placeholder="Lim inn offisiell SHA-256 eller MD5 sjekksum..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono outline-none"
              />

              {expectedHash.trim() && (
                <div>
                  {matchAlgorithm ? (
                    <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <strong>MATCH FUNNET!</strong> Filen stemmer 100% overens med den offisielle {matchAlgorithm}-sjekksummen.
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <strong>INGEN MATCH!</strong> Sjekksummen stemmer ikke med noen av de beregnede hashene. Filen kan være endret eller korrupt.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Computed Hashes */}
        <div className="lg:col-span-7 space-y-3">
          {hashes ? (
            <div className="space-y-3">
              {[
                { label: 'SHA-256 (Gullstandard sikkerhet)', val: hashes.sha256, key: 'sha256', bits: '256-bit' },
                { label: 'SHA-512 (Høyest entropi)', val: hashes.sha512, key: 'sha512', bits: '512-bit' },
                { label: 'SHA-384 (NIST Suite B)', val: hashes.sha384, key: 'sha384', bits: '384-bit' },
                { label: 'SHA-1 (Arv/Legacy)', val: hashes.sha1, key: 'sha1', bits: '160-bit' },
                { label: 'MD5 (Sjekksum / Legacy)', val: hashes.md5, key: 'md5', bits: '128-bit' }
              ].map(h => {
                const isMatch = matchAlgorithm === h.key.toUpperCase();
                return (
                  <div
                    key={h.key}
                    className={`p-3 rounded-lg border transition-all ${
                      isMatch
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md shadow-emerald-950/40'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        {h.label}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {h.bits}
                        </span>
                      </span>
                      <button
                        onClick={() => handleCopy(h.val, h.key)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-slate-800/80 rounded border border-slate-700 hover:bg-slate-800"
                      >
                        {copiedKey === h.key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === h.key ? 'Kopiert' : 'Kopier'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-slate-300 break-all bg-slate-950/80 p-2 rounded border border-slate-800/60 select-all">
                      {h.val}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-500 mb-2" />
              <span>Beregner sjekksummer...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
