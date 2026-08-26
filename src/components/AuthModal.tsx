import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Server, 
  Database,
  ShieldAlert, 
  Cpu, 
  Layers, 
  FileCheck2,
  Sparkles,
  ArrowRight,
  Shield,
  Check,
  Ban
} from 'lucide-react';
import { 
  loginUser, 
  registerUser, 
  USER_ROLES, 
  getBackendArchitectureSketch, 
  fetchRbacRoleDefinitions 
} from '../lib/auth';
import { UserAccount, SecurityArchitectureSketch, UserRole, PreSeededAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register' | 'rbac' | 'architecture';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'rbac' | 'architecture'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'lead_engineer' | 'security_auditor' | 'guest_reviewer'>('lead_engineer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [architectureSketch, setArchitectureSketch] = useState<SecurityArchitectureSketch | null>(null);
  
  // Database-backed RBAC state
  const [dbRoles, setDbRoles] = useState<UserRole[]>(Object.values(USER_ROLES));
  const [preSeededAccounts, setPreSeededAccounts] = useState<PreSeededAccount[]>([]);
  const [dbSource, setDbSource] = useState<string>('Laster databaseroller...');

  useEffect(() => {
    if (isOpen) {
      getBackendArchitectureSketch().then(setArchitectureSketch);
      fetchRbacRoleDefinitions().then((data) => {
        if (data && data.roles) {
          setDbRoles(data.roles);
          setPreSeededAccounts(data.preSeededAccounts || []);
          setDbSource(data.databaseSource || 'Secure Server Database');
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickFill = (acc: PreSeededAccount) => {
    setEmail(acc.email);
    setPassword(acc.testPassword);
    setMode('login');
    setError(null);
    setSuccessMsg(`Hentet legitimasjon for ${acc.roleName} fra sikker database. Klikk Logg inn.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password);
        if (res.success && res.user) {
          const roleObj = dbRoles.find(r => r.id === res.user?.role) || USER_ROLES[res.user.role];
          setSuccessMsg(`Vellykket innlogging som ${res.user.name} (${roleObj?.name || res.user.role}). Rolle validert av backend.`);
          setTimeout(() => {
            onSuccess(res.user!);
            onClose();
          }, 600);
        } else {
          setError(res.error || 'Ugyldig e-post eller passord. Sjekk oppgitte opplysninger.');
        }
      } else if (mode === 'register') {
        if (password.length < 8) {
          setError('Passordet må være minst 8 tegn for tilstrekkelig entropi.');
          setLoading(false);
          return;
        }

        const res = await registerUser(name, email, password, role);
        if (res.success && res.user) {
          setSuccessMsg(`Konto opprettet i sikker database og signert sesjon etablert for ${res.user.name}!`);
          setTimeout(() => {
            onSuccess(res.user!);
            onClose();
          }, 600);
        } else {
          setError(res.error || 'Registrering feilet.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Uventet feil under kommunikasjon med autentiseringstjener.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="auth-modal-card"
        className={`relative w-full ${
          mode === 'architecture' || mode === 'rbac' ? 'max-w-3xl' : 'max-w-md'
        } bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 overflow-hidden transition-all duration-300`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <span>
                  {mode === 'login' && 'Autentisering & Sikker Innlogging'}
                  {mode === 'register' && 'Registrer Bruker i Sikker Database'}
                  {mode === 'rbac' && 'Role-Based Access Control (RBAC)'}
                  {mode === 'architecture' && 'Backend Sikkerhetsarkitektur'}
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Database-Autoritativ
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Roller og rettigheter hentes fra sikker backend – aldri fra manipulerbar klienttilstand.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-950/90 p-1 rounded-xl border border-slate-800 mt-4 gap-1 overflow-x-auto">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 min-w-[85px] py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Logg inn
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 min-w-[95px] py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Opprett konto
            </button>
            <button
              id="auth-tab-rbac"
              type="button"
              onClick={() => { setMode('rbac'); setError(null); }}
              className={`flex-1 min-w-[120px] py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'rbac'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>RBAC Matrise</span>
            </button>
            <button
              id="auth-tab-architecture"
              type="button"
              onClick={() => { setMode('architecture'); setError(null); }}
              className={`flex-1 min-w-[110px] py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'architecture'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Sikkerhetsskisse</span>
            </button>
          </div>
        </div>

        {/* Error & Success Feedback Banners */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* View 1: Database-Backed RBAC Matrix & Role Directory */}
        {mode === 'rbac' && (
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Database className="w-4 h-4" />
                  <span>Kilde: {dbSource}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Aktiv Håndheving
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Brukerroller og tilganger administreres på serveren. Klienten kan aldri endre sin egen rolle lokalt, og sensitive verktøy som <strong>Sikkerhetslag Dashboard</strong> krever verifisert <span className="text-cyan-300 font-semibold">Lead Engineer</span> eller <span className="text-amber-300 font-semibold">Security Auditor</span>-rolle.
              </p>
            </div>

            {/* Role Cards Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {dbRoles.map((r) => (
                <div 
                  key={r.id} 
                  className={`p-3.5 rounded-xl bg-slate-950/90 border flex flex-col justify-between ${
                    r.id === 'lead_engineer' 
                      ? 'border-cyan-500/40' 
                      : r.id === 'security_auditor' 
                      ? 'border-amber-500/40' 
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        r.id === 'lead_engineer'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : r.id === 'security_auditor'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {r.badge || r.id.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-100">{r.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{r.description}</p>
                    
                    {/* Granular Permissions List */}
                    <div className="mt-3 pt-2.5 border-t border-slate-900 space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Sikkerhetslag Dashboard:</span>
                        {r.canAccessSecurityDashboard ? (
                          <span className="text-emerald-400 flex items-center gap-0.5"><Check className="w-3 h-3" /> Tillatt</span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-0.5"><Ban className="w-3 h-3" /> Sperret</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">CodeSentinel Sweep:</span>
                        {r.canRunSentinel ? (
                          <span className="text-emerald-400 flex items-center gap-0.5"><Check className="w-3 h-3" /> Tillatt</span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-0.5"><Ban className="w-3 h-3" /> Sperret</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Prosjektregister:</span>
                        {r.canEditRegistry ? (
                          <span className="text-emerald-400 flex items-center gap-0.5"><Check className="w-3 h-3" /> Rediger</span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-0.5">Lesetilgang</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Git-Sanering & Prune:</span>
                        {r.canManageGitSanitation ? (
                          <span className="text-emerald-400 flex items-center gap-0.5"><Check className="w-3 h-3" /> Tillatt</span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-0.5"><Ban className="w-3 h-3" /> Sperret</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pre-seeded Account Quick-login Button */}
                  {preSeededAccounts.find(a => a.role === r.id) && (
                    <button
                      type="button"
                      onClick={() => handleQuickFill(preSeededAccounts.find(a => a.role === r.id)!)}
                      className="mt-3 w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Test denne rollen</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 2: Architecture Blueprint Sketch View */}
        {mode === 'architecture' && architectureSketch && (
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
                <Cpu className="w-4 h-4" />
                <span>{architectureSketch.title}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {architectureSketch.overview}
              </p>
            </div>

            <div className="space-y-3">
              {architectureSketch.pillars.map((pillar, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono text-[10px] font-bold">
                      0{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200">{pillar.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pl-7">
                    {pillar.description}
                  </p>
                  <div className="mt-2 pl-7">
                    <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto">
                      <code>{pillar.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex items-center justify-between text-xs text-cyan-200">
              <span className="text-[11px]">Klar til å teste med ekte server-autentisering?</span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
              >
                Gå til innlogging
              </button>
            </div>
          </div>
        )}

        {/* View 3 & 4: Standard Login / Register Form */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Quick-fill selector for Evaluators & Auditors */}
            {mode === 'login' && preSeededAccounts.length > 0 && (
              <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Hurtigvelg testbruker fra databasen:
                  </span>
                  <button
                    type="button"
                    onClick={() => setMode('rbac')}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Se RBAC-matrise
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {preSeededAccounts.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className={`p-2 rounded-lg text-left transition-all border ${
                        email === acc.email
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/30'
                          : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] font-bold truncate">
                        {acc.role === 'lead_engineer' ? 'Lead Engineer' : acc.role === 'security_auditor' ? 'Auditor' : 'Gjest'}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono truncate">
                        {acc.role === 'lead_engineer' ? 'Full tilgang' : acc.role === 'security_auditor' ? 'Sikkerhet/Audit' : 'Lesetilgang'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fullt navn / Utvikleridentitet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="f.eks. Annebeth Andersen"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                E-postadresse
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="f.eks. annebeth.andersen@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Passord
                </label>
                {mode === 'register' && (
                  <span className="text-[10px] text-slate-400 font-mono">Minst 8 tegn</span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-10 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 p-0.5"
                  title={showPassword ? 'Skjul passord' : 'Vis passord'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Rolle & Autorisasjonsnivå (Hentet fra Sikker Database)
                </label>
                <select
                  id="reg-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500"
                >
                  {dbRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.badge || r.id})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  {dbRoles.find(r => r.id === role)?.description || USER_ROLES[role]?.description}
                </p>
              </div>
            )}

            {/* Server Security Guard Information Badge */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Passord hashes på server med PBKDF2-SHA512 og 128-bit unikt kryptografisk salt.</span>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:from-cyan-700 active:to-blue-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{mode === 'login' ? 'Logg inn på Sikker Server' : 'Opprett Sikker Konto'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
