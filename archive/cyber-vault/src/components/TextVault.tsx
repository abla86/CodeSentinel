import React, { useState } from 'react';
import { Lock, Unlock, Copy, Check, Download, Upload, ShieldCheck, AlertCircle, Eye, EyeOff, Sparkles, Key, FileText, Wand2 } from 'lucide-react';
import { encryptText, decryptText, calculatePasswordEntropy, generateSecurePassword } from '../utils/crypto';
import { playCyberSound } from '../utils/audio';
import { CryptoStrengthMeter } from './CryptoStrengthMeter';

interface TextVaultProps {
  onLog: (module: string, message: string, level?: 'info' | 'success' | 'warn' | 'secure') => void;
  resetTrigger: number;
}

export const TextVault: React.FC<TextVaultProps> = ({ onLog, resetTrigger }) => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  
  // Encrypt state
  const [plainText, setPlainText] = useState('');
  const [encPassword, setEncPassword] = useState('');
  const [encHint, setEncHint] = useState('');
  const [showEncPassword, setShowEncPassword] = useState(false);
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [copiedEnc, setCopiedEnc] = useState(false);

  // Decrypt state
  const [cipherInput, setCipherInput] = useState('');
  const [decPassword, setDecPassword] = useState('');
  const [showDecPassword, setShowDecPassword] = useState(false);
  const [decryptedOutput, setDecryptedOutput] = useState('');
  const [detectedHint, setDetectedHint] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decError, setDecError] = useState<string | null>(null);
  const [copiedDec, setCopiedDec] = useState(false);

  // React to resetTrigger (panic wipe)
  React.useEffect(() => {
    if (resetTrigger > 0) {
      setPlainText('');
      setEncPassword('');
      setEncHint('');
      setEncryptedOutput('');
      setCipherInput('');
      setDecPassword('');
      setDecryptedOutput('');
      setDecError(null);
      setDetectedHint(null);
    }
  }, [resetTrigger]);

  const encEntropy = calculatePasswordEntropy(encPassword);

  const handleGenerateEncKey = () => {
    const generated = generateSecurePassword(24, true, true, true, true);
    setEncPassword(generated);
    setShowEncPassword(true);
    playCyberSound('click');
    onLog('Teksthvelv', 'Genererte 24-tegns militærgrad CSPRNG krypteringsnøkkel.', 'secure');
  };

  const handleEncrypt = async () => {
    if (!plainText.trim()) {
      onLog('Teksthvelv', 'Mangler tekst å kryptere', 'warn');
      return;
    }
    if (!encPassword) {
      onLog('Teksthvelv', 'Passord er påkrevd for kryptering', 'warn');
      return;
    }

    setIsEncrypting(true);
    playCyberSound('encrypt');
    try {
      onLog('Krypto-motor', 'Initialiserer PBKDF2 med 100 000 iterasjoner & 128-bit salt...', 'info');
      const cipherJson = await encryptText(plainText, encPassword, encHint);
      setEncryptedOutput(cipherJson);
      playCyberSound('success');
      onLog('Teksthvelv', `Tekst (${plainText.length} tegn) kryptert med AES-256-GCM og autentiserings-tag!`, 'success');
    } catch (err: any) {
      playCyberSound('alert');
      onLog('Teksthvelv', `Feil under kryptering: ${err.message}`, 'warn');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    if (!cipherInput.trim()) {
      setDecError('Vennligst lim inn den krypterte pakken');
      return;
    }
    if (!decPassword) {
      setDecError('Vennligst oppgi dekrypteringspassord');
      return;
    }

    setDecError(null);
    setIsDecrypting(true);
    playCyberSound('decrypt');
    try {
      onLog('Krypto-motor', 'Verifiserer GCM-autentiseringstag og utleder AES-256 nøkkel...', 'info');
      const plain = await decryptText(cipherInput, decPassword);
      setDecryptedOutput(plain);
      playCyberSound('success');
      onLog('Teksthvelv', 'Dekryptering vellykket! Integritet og autentisitet bekreftet.', 'success');
    } catch (err: any) {
      playCyberSound('alert');
      setDecError(err.message);
      onLog('Teksthvelv', `Dekryptering feilet: ${err.message}`, 'warn');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCipherInputChange = (val: string) => {
    setCipherInput(val);
    try {
      const parsed = JSON.parse(val);
      if (parsed.hint) {
        setDetectedHint(parsed.hint);
      } else {
        setDetectedHint(null);
      }
    } catch {
      setDetectedHint(null);
    }
  };

  const handleCopy = (text: string, isEnc: boolean) => {
    navigator.clipboard.writeText(text);
    playCyberSound('click');
    if (isEnc) {
      setCopiedEnc(true);
      setTimeout(() => setCopiedEnc(false), 2000);
    } else {
      setCopiedDec(true);
      setTimeout(() => setCopiedDec(false), 2000);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    playCyberSound('click');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleCipherInputChange(reader.result);
        onLog('Teksthvelv', `Lastet inn kryptert fil: ${file.name}`, 'info');
      }
    };
    reader.readAsText(file);
  };

  const loadTemplate = (type: 'credentials' | 'note' | 'keys') => {
    if (type === 'credentials') {
      setPlainText(`[PRODUKSJONSSIKKERHET]
Server: prod-db-node-01.internal
Bruker: sysadmin_root
Kryptonøkkel: 9f8a7e6d5c4b3a2190fedcba87654321
Adgangsnivå: Tier-0 Airgapped`);
    } else if (type === 'note') {
      setPlainText(`Konfidensiell strategisk plan:
1. Skifte samtlige roterende tokens hver 30. dag.
2. Etablere zero-trust mikrosegmentering for all API-trafikk.
3. Ingen rå passord eller hemmeligheter i git repositorier.`);
    } else if (type === 'keys') {
      setPlainText(`-----BEGIN ENCRYPTED PRIVATE DATA-----
Vault ID: SEC-NODE-7729
Recovery Seed: arctic galaxy horizon orbit cipher nebula echo vector
Timestamp: ${new Date().toISOString()}
-----END ENCRYPTED PRIVATE DATA-----`);
    }
    playCyberSound('click');
  };

  return (
    <div className="space-y-6">
      {/* Header controls & mode toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white font-mono flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            AES-256-GCM MILITÆRGRAD TEKSTHVELV
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Autentisert kryptering (AEAD) med PBKDF2 SHA-256 nøkkelutledning og 128-bit integritets-tag.
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            id="btn-mode-encrypt"
            onClick={() => {
              playCyberSound('click');
              setMode('encrypt');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              mode === 'encrypt'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Krypter</span>
          </button>
          <button
            id="btn-mode-decrypt"
            onClick={() => {
              playCyberSound('click');
              setMode('decrypt');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              mode === 'decrypt'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Dekrypter</span>
          </button>
        </div>
      </div>

      {mode === 'encrypt' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plaintext input form */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="plain-text-input" className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                KLARTEKST / HEMMELIG MELDING
              </label>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Maler:</span>
                <button
                  type="button"
                  onClick={() => loadTemplate('credentials')}
                  className="hover:text-cyan-300 underline underline-offset-2 ml-1"
                >
                  Server
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => loadTemplate('note')}
                  className="hover:text-cyan-300 underline underline-offset-2"
                >
                  Plan
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => loadTemplate('keys')}
                  className="hover:text-cyan-300 underline underline-offset-2"
                >
                  Nøkler
                </button>
              </div>
            </div>

            <textarea
              id="plain-text-input"
              rows={8}
              value={plainText}
              onChange={e => setPlainText(e.target.value)}
              placeholder="Skriv eller lim inn hemmelige passord, notater, tokens eller konfigurasjoner her..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-lg p-3 text-sm text-slate-200 font-mono resize-none placeholder-slate-600 outline-none"
            />

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="enc-password-input" className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    HOVEDPASSORD (ENCRYPTION KEY)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateEncKey}
                    className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Autogenerer CSPRNG-nøkkel</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="enc-password-input"
                    type={showEncPassword ? 'text' : 'password'}
                    value={encPassword}
                    onChange={e => setEncPassword(e.target.value)}
                    placeholder="Angi et sterkt passord for å låse hvelvet..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 rounded-lg px-3 py-2.5 text-sm text-slate-200 font-mono pr-10 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEncPassword(!showEncPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showEncPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-time Crypto Strength Meter with Progress Bar */}
              <CryptoStrengthMeter
                password={encPassword}
                title="Crypto Strength"
                id="textvault-enc-strength-meter"
                showDetails={true}
              />

              <div>
                <label htmlFor="enc-hint-input" className="text-xs font-mono text-slate-400 mb-1 block">
                  VALGFRITT PASSORD-HINT (Ulukket metadata)
                </label>
                <input
                  id="enc-hint-input"
                  type="text"
                  value={encHint}
                  onChange={e => setEncHint(e.target.value)}
                  placeholder="F.eks: 'Kombinasjon fra safe på kontoret'"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono outline-none"
                />
              </div>

              <button
                id="btn-execute-encrypt"
                onClick={handleEncrypt}
                disabled={isEncrypting || !plainText.trim() || !encPassword}
                className="w-full py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-mono font-bold text-sm tracking-wide transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>{isEncrypting ? 'KRYPTERER NÅ...' : 'KRYPTER MED AES-256-GCM'}</span>
              </button>
            </div>
          </div>

          {/* Ciphertext Output */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  KRYPTERT UTDATA (ARMORED PAYLOAD)
                </span>
                {encryptedOutput && (
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-copy-enc"
                      onClick={() => handleCopy(encryptedOutput, true)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                    >
                      {copiedEnc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEnc ? 'Kopiert!' : 'Kopier'}</span>
                    </button>
                    <button
                      id="btn-download-enc"
                      onClick={() => handleDownload(encryptedOutput, 'sikker_melding.cybervault.json')}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Last ned</span>
                    </button>
                  </div>
                )}
              </div>

              {encryptedOutput ? (
                <div className="relative">
                  <pre className="w-full bg-[#070b12] border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-300 font-mono h-64 overflow-y-auto whitespace-pre-wrap break-all select-all">
                    {encryptedOutput}
                  </pre>
                </div>
              ) : (
                <div className="h-64 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Lock className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
                  <p className="text-xs font-mono">
                    Kryptert resultat vises her etter at du trykker «Krypter med AES-256-GCM».
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Pakken inneholder kryptografisk salt, IV og autentiseringstagg.
                  </p>
                </div>
              )}
            </div>

            {/* Technical security specs card */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-slate-300 font-semibold mb-1 flex items-center gap-1 text-cyan-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                SIKKERHETSSPESIFIKASJONER
              </div>
              <div className="flex justify-between">
                <span>Algoritme:</span>
                <span className="text-slate-200">AES-GCM (Galois/Counter Mode 256-bit)</span>
              </div>
              <div className="flex justify-between">
                <span>Nøkkelutledning:</span>
                <span className="text-slate-200">PBKDF2 SHA-256 (100 000 iterasjoner)</span>
              </div>
              <div className="flex justify-between">
                <span>Integritet:</span>
                <span className="text-slate-200">128-bit GMAC Autentiserings-tag</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Decrypt Form */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="cipher-input" className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                LIM INN KRYPTERT JSON-PAKKE
              </label>
              <label
                htmlFor="file-upload-enc-json"
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Last opp fil</span>
                <input
                  id="file-upload-enc-json"
                  type="file"
                  accept=".json,.cybervault-text,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              id="cipher-input"
              rows={8}
              value={cipherInput}
              onChange={e => handleCipherInputChange(e.target.value)}
              placeholder='Lim inn den krypterte JSON-pakken som starter med {"version": "2.0", "algorithm": "AES-GCM-256"...}'
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-lg p-3 text-xs text-slate-200 font-mono resize-none placeholder-slate-600 outline-none"
            />

            {detectedHint && (
              <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Passord-hint funnet: <strong>{detectedHint}</strong></span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label htmlFor="dec-password-input" className="text-xs font-mono text-slate-300 font-semibold mb-1 block">
                  DEKRYPTERINGSPASSORD
                </label>
                <div className="relative">
                  <input
                    id="dec-password-input"
                    type={showDecPassword ? 'text' : 'password'}
                    value={decPassword}
                    onChange={e => setDecPassword(e.target.value)}
                    placeholder="Skriv inn passordet som ble brukt til å låse teksten..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-lg px-3 py-2.5 text-sm text-slate-200 font-mono pr-10 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDecPassword(!showDecPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showDecPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {decPassword && (
                <CryptoStrengthMeter
                  password={decPassword}
                  title="Crypto Strength"
                  id="textvault-dec-strength-meter"
                  compact={true}
                />
              )}

              {decError && (
                <div className="p-3 rounded bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs font-mono flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Dekryptering feilet</div>
                    <div>{decError}</div>
                  </div>
                </div>
              )}

              <button
                id="btn-execute-decrypt"
                onClick={handleDecrypt}
                disabled={isDecrypting || !cipherInput.trim() || !decPassword}
                className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-mono font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Unlock className="w-4 h-4" />
                <span>{isDecrypting ? 'DEKRYPTERER & VERIFISERER...' : 'DEKRYPTER MELDING'}</span>
              </button>
            </div>
          </div>

          {/* Decrypted Output */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  DEKRYPTERT KLARTEKST
                </span>
                {decryptedOutput && (
                  <button
                    id="btn-copy-dec"
                    onClick={() => handleCopy(decryptedOutput, false)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                  >
                    {copiedDec ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDec ? 'Kopiert!' : 'Kopier'}</span>
                  </button>
                )}
              </div>

              {decryptedOutput ? (
                <div className="relative">
                  <div className="w-full bg-[#070b12] border border-emerald-500/40 rounded-lg p-3.5 text-sm text-emerald-200 font-mono h-64 overflow-y-auto whitespace-pre-wrap break-words select-all">
                    {decryptedOutput}
                  </div>
                </div>
              ) : (
                <div className="h-64 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Unlock className="w-8 h-8 mb-2 opacity-30 text-emerald-400" />
                  <p className="text-xs font-mono">
                    Dekryptert klartekst vil vises her når gyldig nøkkel oppgis.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-slate-300 font-semibold mb-1 flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                AUTENTISITETSGARANTI
              </div>
              <p className="text-slate-400 leading-relaxed">
                AES-GCM garanterer at dersom så mye som 1 enkelt bit i den krypterte meldingen er endret eller kompromittert, vil dekrypteringen avvises automatisk av nettleserens krypto-motor.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
