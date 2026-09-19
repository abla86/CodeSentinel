import React, { useState, useRef } from 'react';
import { FileCode2, Lock, Unlock, Download, Upload, ShieldCheck, AlertCircle, FileCheck, Eye, EyeOff, Sparkles, Key } from 'lucide-react';
import { encryptFile, decryptFile, calculatePasswordEntropy } from '../utils/crypto';
import { playCyberSound } from '../utils/audio';

interface FileVaultProps {
  onLog: (module: string, message: string, level?: 'info' | 'success' | 'warn' | 'secure') => void;
  resetTrigger: number;
}

export const FileVault: React.FC<FileVaultProps> = ({ onLog, resetTrigger }) => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Encrypt state
  const [encSelectedFile, setEncSelectedFile] = useState<File | null>(null);
  const [encPassword, setEncPassword] = useState('');
  const [showEncPassword, setShowEncPassword] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedFileResult, setEncryptedFileResult] = useState<{
    blob: Blob;
    fileName: string;
    size: number;
  } | null>(null);

  // Decrypt state
  const [decSelectedFile, setDecSelectedFile] = useState<File | null>(null);
  const [decPassword, setDecPassword] = useState('');
  const [showDecPassword, setShowDecPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedFileResult, setDecryptedFileResult] = useState<{
    blob: Blob;
    originalFileName: string;
    mimeType: string;
    previewUrl?: string;
  } | null>(null);
  const [decError, setDecError] = useState<string | null>(null);

  const encFileInputRef = useRef<HTMLInputElement>(null);
  const decFileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (resetTrigger > 0) {
      setEncSelectedFile(null);
      setEncPassword('');
      setEncryptedFileResult(null);
      setDecSelectedFile(null);
      setDecPassword('');
      setDecryptedFileResult(null);
      setDecError(null);
    }
  }, [resetTrigger]);

  const encEntropy = calculatePasswordEntropy(encPassword);

  const handleEncFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      setEncSelectedFile(files[0]);
      setEncryptedFileResult(null);
      playCyberSound('click');
      onLog('Filhvelv', `Fil valgt for kryptering: ${files[0].name} (${(files[0].size / 1024).toFixed(1)} KB)`, 'info');
    }
  };

  const handleDecFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      setDecSelectedFile(files[0]);
      setDecryptedFileResult(null);
      setDecError(null);
      playCyberSound('click');
      onLog('Filhvelv', `Kryptert fil valgt: ${files[0].name}`, 'info');
    }
  };

  const handleExecuteEncrypt = async () => {
    if (!encSelectedFile || !encPassword) return;

    setIsEncrypting(true);
    playCyberSound('encrypt');
    try {
      onLog('Krypto-motor', `Starter strømkryptering av ${encSelectedFile.name} med AES-256-GCM...`, 'info');
      const result = await encryptFile(encSelectedFile, encPassword);
      setEncryptedFileResult(result);
      playCyberSound('success');
      onLog('Filhvelv', `Fil vellykket kryptert til ${result.fileName}!`, 'success');
    } catch (err: any) {
      playCyberSound('alert');
      onLog('Filhvelv', `Feil under filkryptering: ${err.message}`, 'warn');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleExecuteDecrypt = async () => {
    if (!decSelectedFile || !decPassword) return;

    setIsDecrypting(true);
    setDecError(null);
    playCyberSound('decrypt');
    try {
      onLog('Krypto-motor', `Analyserer CyberVault-filhode og verifiserer GCM-integritet...`, 'info');
      const result = await decryptFile(decSelectedFile, decPassword);

      let previewUrl: string | undefined = undefined;
      if (result.mimeType.startsWith('image/') || result.mimeType.startsWith('text/')) {
        previewUrl = URL.createObjectURL(result.blob);
      }

      setDecryptedFileResult({
        ...result,
        previewUrl
      });
      playCyberSound('success');
      onLog('Filhvelv', `Fildekryptering vellykket: Gjenopprettet ${result.originalFileName}!`, 'success');
    } catch (err: any) {
      playCyberSound('alert');
      setDecError(err.message);
      onLog('Filhvelv', `Dekryptering feilet: ${err.message}`, 'warn');
    } finally {
      setIsDecrypting(false);
    }
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    playCyberSound('click');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white font-mono flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-cyan-400" />
            ZERO-KNOWLEDGE FILHVELV (.CYBERVAULT)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Beskytt PDF-er, bilder, kildekode og dokumenter med hardware-akselerert AES-256 kryptering.
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            id="btn-file-mode-encrypt"
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
            <span>Krypter fil</span>
          </button>
          <button
            id="btn-file-mode-decrypt"
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
            <span>Dekrypter fil</span>
          </button>
        </div>
      </div>

      {mode === 'encrypt' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-cyan-400" />
              VELG FIL SOM SKAL SIKRES
            </span>

            {/* Drag and drop zone */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                handleEncFileSelect(e.dataTransfer.files);
              }}
              onClick={() => encFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-48 ${
                encSelectedFile
                  ? 'border-cyan-500/60 bg-cyan-950/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
              }`}
            >
              <input
                ref={encFileInputRef}
                type="file"
                onChange={e => handleEncFileSelect(e.target.files)}
                className="hidden"
              />
              {encSelectedFile ? (
                <div className="space-y-2">
                  <FileCheck className="w-10 h-10 text-cyan-400 mx-auto" />
                  <div className="text-sm font-mono font-bold text-slate-200">{encSelectedFile.name}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    Størrelse: {(encSelectedFile.size / 1024).toFixed(1)} KB • Type: {encSelectedFile.type || 'binær'}
                  </div>
                  <p className="text-[11px] text-cyan-400 underline pt-1">Klikk for å bytte fil</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-mono text-slate-300">
                    Dra & slipp fil her, eller <span className="text-cyan-400 underline">velg fra disk</span>
                  </p>
                  <p className="text-xs text-slate-500">Alle filformater støttes (PDF, JPG, ZIP, DOCX, etc.)</p>
                </div>
              )}
            </div>

            {/* Password input */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="file-enc-password" className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    HOVEDPASSORD FOR FIL
                  </label>
                  {encPassword && (
                    <span className="text-[11px] font-mono text-cyan-400">
                      Entropi: {encEntropy.bits} bits
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="file-enc-password"
                    type={showEncPassword ? 'text' : 'password'}
                    value={encPassword}
                    onChange={e => setEncPassword(e.target.value)}
                    placeholder="Angi krypteringspassord..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 font-mono pr-10 outline-none"
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

              <button
                id="btn-execute-file-encrypt"
                onClick={handleExecuteEncrypt}
                disabled={isEncrypting || !encSelectedFile || !encPassword}
                className="w-full py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-mono font-bold text-sm tracking-wide transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>{isEncrypting ? 'KRYPTERER FIL...' : 'KRYPTER FIL MED AES-256'}</span>
              </button>
            </div>
          </div>

          {/* Encryption Result */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                KRYPTERT RESULTAT
              </span>

              {encryptedFileResult ? (
                <div className="bg-[#070b12] border border-cyan-500/40 rounded-xl p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-mono font-bold text-white break-all">
                      {encryptedFileResult.fileName}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Størrelse: {(encryptedFileResult.size / 1024).toFixed(1)} KB (Inkludert 128-bit MAC)
                    </p>
                  </div>

                  <button
                    id="btn-download-encrypted-file"
                    onClick={() => downloadBlob(encryptedFileResult.blob, encryptedFileResult.fileName)}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>LAST NED KRYPTERT PAKKE (.CYBERVAULT)</span>
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-48">
                  <Lock className="w-10 h-10 opacity-30 text-cyan-400 mb-2" />
                  <p className="text-xs font-mono">
                    Når filen er kryptert, kan du laste ned den beskyttede .cybervault-filen her.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-slate-300 font-semibold mb-1 flex items-center gap-1 text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                FORENSISK BESKYTTELSE
              </div>
              <p className="leading-relaxed">
                CyberVault kapsler filnavn, filtype og innhold inn i en ugjennomsiktig binær container med unikt tilfeldig salt og IV for hver operasjon. Uten passordet er innholdet matematisk uatskillelig fra hvit støy.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Decrypt Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-400" />
              VELG .CYBERVAULT FIL FOR GJENOPPRETTING
            </span>

            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                handleDecFileSelect(e.dataTransfer.files);
              }}
              onClick={() => decFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-48 ${
                decSelectedFile
                  ? 'border-emerald-500/60 bg-emerald-950/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
              }`}
            >
              <input
                ref={decFileInputRef}
                type="file"
                onChange={e => handleDecFileSelect(e.target.files)}
                className="hidden"
              />
              {decSelectedFile ? (
                <div className="space-y-2">
                  <FileCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="text-sm font-mono font-bold text-slate-200">{decSelectedFile.name}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    Størrelse: {(decSelectedFile.size / 1024).toFixed(1)} KB
                  </div>
                  <p className="text-[11px] text-emerald-400 underline pt-1">Klikk for å bytte fil</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-mono text-slate-300">
                    Velg eller dra inn <span className="text-emerald-400 font-semibold">.cybervault</span> fil
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="file-dec-password" className="text-xs font-mono text-slate-300 font-semibold mb-1 block">
                  PASSORD FOR FILEN
                </label>
                <div className="relative">
                  <input
                    id="file-dec-password"
                    type={showDecPassword ? 'text' : 'password'}
                    value={decPassword}
                    onChange={e => setDecPassword(e.target.value)}
                    placeholder="Angi passordet filen ble kryptert med..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 font-mono pr-10 outline-none"
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
                id="btn-execute-file-decrypt"
                onClick={handleExecuteDecrypt}
                disabled={isDecrypting || !decSelectedFile || !decPassword}
                className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-mono font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Unlock className="w-4 h-4" />
                <span>{isDecrypting ? 'DEKRYPTERER FIL...' : 'DEKRYPTER & GJENOPPRETT FIL'}</span>
              </button>
            </div>
          </div>

          {/* Decrypted File Result */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                GJENOPPRETTET FIL
              </span>

              {decryptedFileResult ? (
                <div className="bg-[#070b12] border border-emerald-500/40 rounded-xl p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center mx-auto">
                    <FileCheck className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-mono font-bold text-white break-all">
                      {decryptedFileResult.originalFileName}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      MIME-type: {decryptedFileResult.mimeType} • Størrelse: {(decryptedFileResult.blob.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  {decryptedFileResult.previewUrl && (
                    <div className="max-h-36 overflow-hidden rounded border border-slate-800 my-2">
                      <img
                        src={decryptedFileResult.previewUrl}
                        alt="Forhåndsvisning"
                        className="w-full object-contain max-h-36 mx-auto"
                      />
                    </div>
                  )}

                  <button
                    id="btn-download-decrypted-file"
                    onClick={() => downloadBlob(decryptedFileResult.blob, decryptedFileResult.originalFileName)}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>LAST NED GJENOPPRETTET FIL</span>
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-48">
                  <Unlock className="w-10 h-10 opacity-30 text-emerald-400 mb-2" />
                  <p className="text-xs font-mono">
                    Dekryptert fil vises her med opprinnelig format så snart du har dekryptert.
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
