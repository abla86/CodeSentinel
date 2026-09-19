import React, { useState, useEffect } from 'react';
import { Binary, Copy, Check, ArrowRightLeft, Sparkles, RefreshCw } from 'lucide-react';
import { playCyberSound } from '../utils/audio';

interface PayloadAnalyzerProps {
  onLog: (module: string, message: string, level?: 'info' | 'success' | 'warn' | 'secure') => void;
  resetTrigger: number;
}

type CodecType = 'base64' | 'hex' | 'binary' | 'url' | 'rot13';

export const PayloadAnalyzer: React.FC<PayloadAnalyzerProps> = ({ onLog, resetTrigger }) => {
  const [inputVal, setInputVal] = useState('SGVsbG8gQ3liZXJTZWMhIFplcm8ta25vd2xlZGdlIHByb3RlY3Rpb24=');
  const [codec, setCodec] = useState<CodecType>('base64');
  const [direction, setDirection] = useState<'decode' | 'encode'>('decode');
  const [outputVal, setOutputVal] = useState('');
  const [copied, setCopied] = useState(false);
  const [detectedType, setDetectedType] = useState<string | null>(null);

  useEffect(() => {
    if (resetTrigger > 0) {
      setInputVal('');
      setOutputVal('');
      setDetectedType(null);
    }
  }, [resetTrigger]);

  // Auto-detect format heuristics
  useEffect(() => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setDetectedType(null);
      return;
    }

    if (/^[01\s]+$/.test(trimmed) && trimmed.replace(/\s+/g, '').length % 8 === 0) {
      setDetectedType('Binær sekvens (0/1)');
    } else if (/^[0-9a-fA-F\s]+$/.test(trimmed) && trimmed.replace(/\s+/g, '').length >= 4 && trimmed.replace(/\s+/g, '').length % 2 === 0) {
      setDetectedType('Hexadesimal (HEX)');
    } else if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length % 4 === 0 && trimmed.length >= 8) {
      setDetectedType('Base64 Kodet');
    } else if (/%[0-9a-fA-F]{2}/.test(trimmed)) {
      setDetectedType('URL-Prosentkodet');
    } else {
      setDetectedType('Standard tekst / ASCII');
    }
  }, [inputVal]);

  useEffect(() => {
    processConversion();
  }, [inputVal, codec, direction]);

  const processConversion = () => {
    if (!inputVal) {
      setOutputVal('');
      return;
    }

    try {
      if (codec === 'base64') {
        if (direction === 'encode') {
          const enc = new TextEncoder().encode(inputVal);
          let binary = '';
          for (let i = 0; i < enc.length; i++) binary += String.fromCharCode(enc[i]);
          setOutputVal(btoa(binary));
        } else {
          const decodedBinary = atob(inputVal.trim());
          const bytes = new Uint8Array(decodedBinary.length);
          for (let i = 0; i < decodedBinary.length; i++) bytes[i] = decodedBinary.charCodeAt(i);
          setOutputVal(new TextDecoder().decode(bytes));
        }
      } else if (codec === 'hex') {
        if (direction === 'encode') {
          const enc = new TextEncoder().encode(inputVal);
          setOutputVal(Array.from(enc).map(b => b.toString(16).padStart(2, '0')).join(' '));
        } else {
          const cleanHex = inputVal.replace(/\s+/g, '');
          if (cleanHex.length % 2 !== 0) throw new Error('Hex-streng har ujevn lengde');
          const bytes = new Uint8Array(cleanHex.length / 2);
          for (let i = 0; i < cleanHex.length; i += 2) {
            bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
          }
          setOutputVal(new TextDecoder().decode(bytes));
        }
      } else if (codec === 'binary') {
        if (direction === 'encode') {
          const enc = new TextEncoder().encode(inputVal);
          setOutputVal(Array.from(enc).map(b => b.toString(2).padStart(8, '0')).join(' '));
        } else {
          const cleanBin = inputVal.replace(/\s+/g, '');
          if (cleanBin.length % 8 !== 0) throw new Error('Binær streng må bestå av 8-bit blokker');
          const bytes = new Uint8Array(cleanBin.length / 8);
          for (let i = 0; i < cleanBin.length; i += 8) {
            bytes[i / 8] = parseInt(cleanBin.substring(i, i + 8), 2);
          }
          setOutputVal(new TextDecoder().decode(bytes));
        }
      } else if (codec === 'url') {
        if (direction === 'encode') {
          setOutputVal(encodeURIComponent(inputVal));
        } else {
          setOutputVal(decodeURIComponent(inputVal));
        }
      } else if (codec === 'rot13') {
        // ROT13 is symmetric
        const rot = inputVal.replace(/[a-zA-Z]/g, c => {
          const base = c <= 'Z' ? 65 : 97;
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
        setOutputVal(rot);
      }
    } catch (err: any) {
      setOutputVal(`[Konverteringsfeil]: ${err.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputVal);
    setCopied(true);
    playCyberSound('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const swapDirection = () => {
    playCyberSound('click');
    setDirection(prev => (prev === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white font-mono flex items-center gap-2">
            <Binary className="w-5 h-5 text-cyan-400" />
            PAYLOAD & STRENG-INSPEKTØR
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyser obfuskert kode, avkod Base64/Hex-tokens, eller konverter data til binære formater.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {detectedType && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              Detektert: {detectedType}
            </span>
          )}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
        {/* Codec bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['base64', 'hex', 'binary', 'url', 'rot13'] as CodecType[]).map(c => (
              <button
                key={c}
                onClick={() => {
                  playCyberSound('click');
                  setCodec(c);
                }}
                className={`px-3 py-1.5 rounded text-xs font-mono font-medium uppercase transition-all ${
                  codec === c
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={swapDirection}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Modus: <strong>{direction === 'decode' ? 'Avkod (Decode)' : 'Kod (Encode)'}</strong></span>
          </button>
        </div>

        {/* Input & Output boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <label htmlFor="payload-input" className="font-semibold">INNDATA</label>
              <span className="text-slate-500">{inputVal.length} tegn</span>
            </div>
            <textarea
              id="payload-input"
              rows={10}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Skriv eller lim inn payload..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-3 text-xs text-slate-200 font-mono resize-none outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-300">
              <label htmlFor="payload-output" className="font-semibold">RESULTAT ({direction.toUpperCase()})</label>
              {outputVal && (
                <button
                  id="btn-copy-payload"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Kopiert' : 'Kopier'}</span>
                </button>
              )}
            </div>
            <textarea
              id="payload-output"
              rows={10}
              readOnly
              value={outputVal}
              placeholder="Konvertert utdata vises her..."
              className="w-full bg-[#070b12] border border-slate-800 rounded-lg p-3 text-xs text-cyan-300 font-mono resize-none outline-none select-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
