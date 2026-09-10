import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Lock, Unlock, Download, Upload, Image as ImageIcon, ShieldCheck, AlertCircle, Sparkles, Check, Copy } from 'lucide-react';
import { hideMessageInImage, extractMessageFromImage } from '../utils/steganography';
import { encryptText, decryptText } from '../utils/crypto';
import { playCyberSound } from '../utils/audio';

interface StegoLabProps {
  onLog: (module: string, message: string, level?: 'info' | 'success' | 'warn' | 'secure') => void;
  resetTrigger: number;
}

export const StegoLab: React.FC<StegoLabProps> = ({ onLog, resetTrigger }) => {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  // Encode state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [secretMessage, setSecretMessage] = useState('');
  const [useEncryption, setUseEncryption] = useState(true);
  const [stegoPassword, setStegoPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stegoResult, setStegoResult] = useState<{
    blob: Blob;
    dataUrl: string;
    capacityBytes: number;
  } | null>(null);

  // Decode state
  const [stegoFileToDecode, setStegoFileToDecode] = useState<File | null>(null);
  const [decodePreview, setDecodePreview] = useState<string | null>(null);
  const [decodedRawText, setDecodedRawText] = useState('');
  const [decodePassword, setDecodePassword] = useState('');
  const [showDecodePassword, setShowDecodePassword] = useState(false);
  const [finalExtractedText, setFinalExtractedText] = useState('');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const decodeInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (resetTrigger > 0) {
      setCoverFile(null);
      setCoverPreview(null);
      setSecretMessage('');
      setStegoPassword('');
      setStegoResult(null);
      setStegoFileToDecode(null);
      setDecodePreview(null);
      setDecodedRawText('');
      setDecodePassword('');
      setFinalExtractedText('');
      setDecodeError(null);
    }
  }, [resetTrigger]);

  const handleCoverSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setStegoResult(null);
      playCyberSound('click');
      onLog('Steganografi', `Dekningsbilde lastet inn: ${file.name}`, 'info');
    }
  };

  const handleDecodeFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setStegoFileToDecode(file);
      setDecodePreview(URL.createObjectURL(file));
      setDecodedRawText('');
      setFinalExtractedText('');
      setDecodeError(null);
      playCyberSound('click');
      onLog('Steganografi', `Stego-bilde valgt for ekstrahering: ${file.name}`, 'info');
    }
  };

  const handleExecuteEncode = async () => {
    if (!coverFile || !secretMessage.trim()) return;

    setIsProcessing(true);
    playCyberSound('encrypt');
    try {
      let payloadToHide = secretMessage;

      if (useEncryption && stegoPassword) {
        onLog('Steganografi', 'Forhåndskrypterer hemmelighet med AES-256-GCM før pikselinjeksjon...', 'secure');
        payloadToHide = await encryptText(secretMessage, stegoPassword);
      }

      onLog('Steganografi', 'Koder data inn i minst signifikante bits (LSB) i RGB-kanaler...', 'info');
      const result = await hideMessageInImage(coverFile, payloadToHide);
      setStegoResult(result);
      playCyberSound('success');
      onLog('Steganografi', 'Fullført! Hemmeligheten er nå usynlig innebygd i bildepiksler.', 'success');
    } catch (err: any) {
      playCyberSound('alert');
      onLog('Steganografi', `Feil: ${err.message}`, 'warn');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteDecode = async () => {
    if (!stegoFileToDecode) return;

    setIsDecoding(true);
    setDecodeError(null);
    playCyberSound('decrypt');
    try {
      onLog('Steganografi', 'Ekstraherer LSB-bitsekvens fra bildecanvas...', 'info');
      const rawText = await extractMessageFromImage(stegoFileToDecode);
      setDecodedRawText(rawText);

      // Check if it's an encrypted JSON package
      let isEncrypted = false;
      try {
        const parsed = JSON.parse(rawText);
        if (parsed.algorithm === 'AES-GCM-256') {
          isEncrypted = true;
        }
      } catch {
        // Not JSON encrypted
      }

      if (isEncrypted) {
        if (!decodePassword) {
          setDecodeError('Bildet inneholder en AES-256 kryptert melding. Oppgi passord for å låse opp.');
          setFinalExtractedText('');
        } else {
          onLog('Steganografi', 'Dekrypterer ekstrahert AES-256 pakke...', 'secure');
          const decrypted = await decryptText(rawText, decodePassword);
          setFinalExtractedText(decrypted);
          playCyberSound('success');
          onLog('Steganografi', 'Dekryptering og ekstrahering fullført!', 'success');
        }
      } else {
        setFinalExtractedText(rawText);
        playCyberSound('success');
        onLog('Steganografi', 'Ukryptert tekstmelding ekstrahert fra bilde.', 'success');
      }
    } catch (err: any) {
      playCyberSound('alert');
      setDecodeError(err.message);
      onLog('Steganografi', `Ekstrahering feilet: ${err.message}`, 'warn');
    } finally {
      setIsDecoding(false);
    }
  };

  const handleCopyExtracted = () => {
    navigator.clipboard.writeText(finalExtractedText);
    setCopiedText(true);
    playCyberSound('click');
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white font-mono flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            PIKSEL-STEGANOGRAFI & USYNLIG DATAINJEKSJON
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Skjul hemmelige meldinger i bildet uten synlig forskjell ved hjelp av LSB (Least Significant Bit).
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            id="btn-stego-mode-encode"
            onClick={() => {
              playCyberSound('click');
              setMode('encode');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              mode === 'encode'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Skjul i bilde</span>
          </button>
          <button
            id="btn-stego-mode-decode"
            onClick={() => {
              playCyberSound('click');
              setMode('decode');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              mode === 'decode'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Les fra bilde</span>
          </button>
        </div>
      </div>

      {mode === 'encode' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              1. VELG DEKNINGSBILDE (COVER IMAGE)
            </span>

            <div
              onClick={() => coverInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-36 ${
                coverPreview
                  ? 'border-cyan-500/50 bg-cyan-950/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
              }`}
            >
              <input
                ref={coverInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={e => handleCoverSelect(e.target.files)}
                className="hidden"
              />
              {coverPreview ? (
                <div className="flex items-center gap-4">
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className="w-20 h-20 object-cover rounded border border-slate-700"
                  />
                  <div className="text-left">
                    <div className="text-xs font-mono font-bold text-slate-200 break-all">{coverFile?.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Størrelse: {((coverFile?.size || 0) / 1024).toFixed(1)} KB
                    </div>
                    <span className="text-[11px] text-cyan-400 underline">Klikk for å endre bilde</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-7 h-7 text-slate-500 mx-auto" />
                  <p className="text-xs font-mono text-slate-300">Last opp bilde (PNG anbefales)</p>
                  <p className="text-[10px] text-slate-500">Minst 200x200 piksler for god kapasitet</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="secret-message-input" className="text-xs font-mono text-slate-300 font-semibold mb-1 block">
                  2. HEMMELIG MELDING ELLER NØKKEL
                </label>
                <textarea
                  id="secret-message-input"
                  rows={4}
                  value={secretMessage}
                  onChange={e => setSecretMessage(e.target.value)}
                  placeholder="Skriv inn teksten eller koden som skal usynliggjøres i bildet..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-2.5 text-xs text-slate-200 font-mono resize-none outline-none"
                />
              </div>

              {/* Encryption toggle */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useEncryption}
                      onChange={e => setUseEncryption(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Dobbel beskyttelse: AES-256 kryptering før pikselgjemming</span>
                  </label>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>

                {useEncryption && (
                  <div className="pt-2">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={stegoPassword}
                        onChange={e => setStegoPassword(e.target.value)}
                        placeholder="Angi krypteringspassord..."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded px-3 py-1.5 text-xs text-slate-200 font-mono pr-10 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                id="btn-execute-stego-encode"
                onClick={handleExecuteEncode}
                disabled={isProcessing || !coverFile || !secretMessage.trim() || (useEncryption && !stegoPassword)}
                className="w-full py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-mono font-bold text-sm tracking-wide transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                <span>{isProcessing ? 'GENERERER STEGO-BILDE...' : 'SKJUL DATA I BILDE'}</span>
              </button>
            </div>
          </div>

          {/* Stego Result */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                FERDIG STEGANOGRAFISK BILDE
              </span>

              {stegoResult ? (
                <div className="bg-[#070b12] border border-cyan-500/40 rounded-xl p-5 text-center space-y-3">
                  <div className="max-h-52 overflow-hidden rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center">
                    <img
                      src={stegoResult.dataUrl}
                      alt="Stego Result"
                      className="max-h-52 object-contain mx-auto"
                    />
                  </div>

                  <div className="text-xs font-mono text-slate-300">
                    <span className="text-emerald-400 font-bold">100% visuell likhet.</span> Dataene ligger i de laveste fargebitene.
                  </div>

                  <a
                    id="btn-download-stego-image"
                    href={stegoResult.dataUrl}
                    download="stego_secret_image.png"
                    onClick={() => playCyberSound('click')}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>LAST NED TAPSFRI PNG MED HEMMELIG DATA</span>
                  </a>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-48">
                  <Eye className="w-8 h-8 opacity-30 text-cyan-400 mb-2" />
                  <p className="text-xs font-mono">
                    Det genererte bildet vises her og kan lastes ned som tapsfri PNG.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-slate-300 font-semibold mb-1 flex items-center gap-1 text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                LSB SIKKERHET
              </div>
              <p className="leading-relaxed">
                Fordi vi endrer kun den aller minste binære biten i fargeverdiene (fra f.eks. 142 til 143), er det umulig for det menneskelige øyet å se forskjellen, og tradisjonelle filskannere ser kun et gyldig bilde.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Decode Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-400" />
              VELG BILDE SOM INNEHOLDER SKJULT MELDING
            </span>

            <div
              onClick={() => decodeInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-36 ${
                decodePreview
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
              }`}
            >
              <input
                ref={decodeInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={e => handleDecodeFileSelect(e.target.files)}
                className="hidden"
              />
              {decodePreview ? (
                <div className="flex items-center gap-4">
                  <img
                    src={decodePreview}
                    alt="Stego Decode"
                    className="w-20 h-20 object-cover rounded border border-slate-700"
                  />
                  <div className="text-left">
                    <div className="text-xs font-mono font-bold text-slate-200 break-all">{stegoFileToDecode?.name}</div>
                    <span className="text-[11px] text-emerald-400 underline">Klikk for å bytte bilde</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-7 h-7 text-slate-500 mx-auto" />
                  <p className="text-xs font-mono text-slate-300">Last opp stego-bilde</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="decode-password-input" className="text-xs font-mono text-slate-300 font-semibold mb-1 block">
                  PASSORD (Dersom bildet ble kryptert)
                </label>
                <div className="relative">
                  <input
                    id="decode-password-input"
                    type={showDecodePassword ? 'text' : 'password'}
                    value={decodePassword}
                    onChange={e => setDecodePassword(e.target.value)}
                    placeholder="Angi passord hvis aktuelt..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded px-3 py-2 text-xs text-slate-200 font-mono pr-10 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDecodePassword(!showDecodePassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showDecodePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {decodeError && (
                <div className="p-3 rounded bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs font-mono flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Feil ved ekstrahering</div>
                    <div>{decodeError}</div>
                  </div>
                </div>
              )}

              <button
                id="btn-execute-stego-decode"
                onClick={handleExecuteDecode}
                disabled={isDecoding || !stegoFileToDecode}
                className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-mono font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Unlock className="w-4 h-4" />
                <span>{isDecoding ? 'SKANNER PIKSLER...' : 'EKSTRAHER HEMMELIGHET'}</span>
              </button>
            </div>
          </div>

          {/* Extracted Output */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  EKSTRAHERT KLARTEKST FRA BILDE
                </span>
                {finalExtractedText && (
                  <button
                    id="btn-copy-stego-text"
                    onClick={handleCopyExtracted}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Kopiert!' : 'Kopier'}</span>
                  </button>
                )}
              </div>

              {finalExtractedText ? (
                <div className="w-full bg-[#070b12] border border-emerald-500/40 rounded-lg p-3 text-sm text-emerald-200 font-mono h-64 overflow-y-auto whitespace-pre-wrap break-words select-all">
                  {finalExtractedText}
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-48">
                  <Unlock className="w-8 h-8 opacity-30 text-emerald-400 mb-2" />
                  <p className="text-xs font-mono">
                    Ekstrahert hemmelig innhold vil dukke opp her så snart bildet er analysert.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
