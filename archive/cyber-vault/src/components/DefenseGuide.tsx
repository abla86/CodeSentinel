import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Server, Terminal, Lock, CheckCircle2, Circle } from 'lucide-react';
import { playCyberSound } from '../utils/audio';

interface DefenseGuideProps {
  onLog: (module: string, message: string, level?: 'info' | 'success' | 'warn' | 'secure') => void;
}

export const DefenseGuide: React.FC<DefenseGuideProps> = ({ onLog }) => {
  const [activeSubtab, setActiveSubtab] = useState<'headers' | 'firewall' | 'checklist'>('headers');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Security Headers Config State
  const [includeHSTS, setIncludeHSTS] = useState(true);
  const [includeCSP, setIncludeCSP] = useState(true);
  const [includeFrameOptions, setIncludeFrameOptions] = useState(true);
  const [serverType, setServerType] = useState<'nginx' | 'apache' | 'caddy'>('nginx');

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    'item-1': true,
    'item-2': true,
    'item-3': false,
    'item-4': false,
    'item-5': true
  });

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => {
      const next = { ...prev, [id]: !prev[id] };
      playCyberSound('click');
      return next;
    });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playCyberSound('click');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate Nginx / Apache config
  const getNginxConfig = () => {
    let lines = ['# Sikkerhetsherding for produksjonsserver'];
    if (includeHSTS) {
      lines.push('add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;');
    }
    if (includeFrameOptions) {
      lines.push('add_header X-Frame-Options "SAMEORIGIN" always;');
      lines.push('add_header X-Content-Type-Options "nosniff" always;');
      lines.push('add_header Referrer-Policy "strict-origin-when-cross-origin" always;');
      lines.push('add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;');
    }
    if (includeCSP) {
      lines.push('add_header Content-Security-Policy "default-src \'self\'; script-src \'self\'; object-src \'none\'; frame-ancestors \'self\';" always;');
    }
    lines.push('\n# Skjul NGINX versjonsnummer mot rekognosering');
    lines.push('server_tokens off;');
    return lines.join('\n');
  };

  const getUfwConfig = () => {
    return `# UFW Brannmur-herding for Linux/Ubuntu
# 1. Standardregel: Blokker alt innkommende, tillat utgående
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Rate-limit SSH for å forhindre brute-force angrep
sudo ufw limit 22/tcp comment 'Rate-limited SSH'

# 3. Tillat kun nødvendig web-trafikk (TLS)
sudo ufw allow 80/tcp comment 'HTTP (Redirect til HTTPS)'
sudo ufw allow 443/tcp comment 'HTTPS Kryptert'

# 4. Aktiver brannmuren med logging
sudo ufw logging medium
sudo ufw enable
sudo ufw status verbose`;
  };

  const checklist = [
    {
      id: 'item-1',
      title: 'Zero-Knowledge Kryptering',
      desc: 'Sørg for at konfidensiell brukerdata og nøkler kun krypteres lokalt i klientsiden (AES-256-GCM) før overføring.'
    },
    {
      id: 'item-2',
      title: 'Multifaktor-autentisering (MFA/FIDO2)',
      desc: 'Krev maskinvare-sikkerhetsnøkler (YubiKey/WebAuthn) eller tidsbasert TOTP på alle kritiske kontoer.'
    },
    {
      id: 'item-3',
      title: 'Automatisk Nøkkelrotasjon',
      desc: 'Roter API-nøkler, TLS-sertifikater og passord hver 30-90 dag med null nedetid.'
    },
    {
      id: 'item-4',
      title: 'Prinsippet om Laveste Privilegium (PoLP)',
      desc: 'Gi aldri root/superadmin-adgang til tjenester eller skript med mindre det er strengt nødvendig for oppgaven.'
    },
    {
      id: 'item-5',
      title: 'Sikker Hash-lagring (Argon2id / PBKDF2)',
      desc: 'Bruk aldri MD5 eller SHA-1 for passordlagring; bruk Argon2id eller PBKDF2 med minst 100 000 runder.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white font-mono flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            CYBER FORSVAR & SIKKERHETSHERDING
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Defensive verktøy: Konfigurer brannmurer, HTTP-sikkerhetsheadere og sjekkliste for produksjon.
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              playCyberSound('click');
              setActiveSubtab('headers');
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeSubtab === 'headers'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sikkerhetsheadere
          </button>
          <button
            onClick={() => {
              playCyberSound('click');
              setActiveSubtab('firewall');
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeSubtab === 'firewall'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Brannmur-regler
          </button>
          <button
            onClick={() => {
              playCyberSound('click');
              setActiveSubtab('checklist');
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeSubtab === 'checklist'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sikkerhetsrevisjon
          </button>
        </div>
      </div>

      {activeSubtab === 'headers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Server className="w-4 h-4 text-cyan-400" />
              KONFIGURER FORSVARSLAG
            </span>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <label className="flex items-center gap-2.5 p-2 rounded bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHSTS}
                  onChange={e => setIncludeHSTS(e.target.checked)}
                  className="accent-cyan-500"
                />
                <div>
                  <div className="font-semibold text-slate-200">HSTS (Strict-Transport-Security)</div>
                  <div className="text-[11px] text-slate-400">Tvinger alltid HTTPS over 2 år</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCSP}
                  onChange={e => setIncludeCSP(e.target.checked)}
                  className="accent-cyan-500"
                />
                <div>
                  <div className="font-semibold text-slate-200">CSP (Content-Security-Policy)</div>
                  <div className="text-[11px] text-slate-400">Blokkerer XSS og uautoriserte skript</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFrameOptions}
                  onChange={e => setIncludeFrameOptions(e.target.checked)}
                  className="accent-cyan-500"
                />
                <div>
                  <div className="font-semibold text-slate-200">Anti-Clickjacking & Sniffing</div>
                  <div className="text-[11px] text-slate-400">X-Frame-Options & nosniff beskyttelse</div>
                </div>
              </label>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                NGINX SERVER KONFIGURASJON
              </span>
              <button
                onClick={() => handleCopy(getNginxConfig(), 'nginx')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
              >
                {copiedKey === 'nginx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'nginx' ? 'Kopiert' : 'Kopier'}</span>
              </button>
            </div>

            <pre className="w-full bg-[#070b12] border border-slate-800 rounded-lg p-3 text-xs text-cyan-300 font-mono overflow-x-auto whitespace-pre-wrap">
              {getNginxConfig()}
            </pre>
          </div>
        </div>
      )}

      {activeSubtab === 'firewall' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              UFW HARDENING SKRIPT (DEFENSIV BRANNMUR)
            </span>
            <button
              onClick={() => handleCopy(getUfwConfig(), 'ufw')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
            >
              {copiedKey === 'ufw' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'ufw' ? 'Kopiert' : 'Kopier skript'}</span>
            </button>
          </div>

          <pre className="w-full bg-[#070b12] border border-slate-800 rounded-lg p-4 text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">
            {getUfwConfig()}
          </pre>
        </div>
      )}

      {activeSubtab === 'checklist' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
          <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-cyan-400" />
            CYBERSIKKERHET REVISJONSLISTE
          </span>

          <div className="space-y-2">
            {checklist.map(item => {
              const isChecked = !!checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-mono font-bold ${isChecked ? 'text-emerald-300' : 'text-slate-200'}`}>
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
