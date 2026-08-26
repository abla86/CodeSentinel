import React, { useState } from 'react';
import { AppSettings, AppTheme, VerificationStrictness, BranchCleanupStrategy } from '../types';
import { 
  Settings as SettingsIcon, 
  Palette, 
  ShieldCheck, 
  GitBranch, 
  Bell, 
  Sliders, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Save, 
  X, 
  Check, 
  ShieldAlert, 
  Sparkles, 
  Terminal, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  FileCode2,
  Clock
} from 'lucide-react';
import { DEFAULT_SETTINGS, playChime } from '../lib/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (updated: AppSettings) => void;
  onRunImmediateSweep?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onRunImmediateSweep,
}) => {
  const [activeCategory, setActiveCategory] = useState<'appearance' | 'sentinel' | 'git' | 'notifications' | 'defaults'>('appearance');
  const [formState, setFormState] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if settings prop changes
  React.useEffect(() => {
    setFormState(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSettings(formState);
    if (formState.soundEffects) {
      playChime('success');
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleResetDefaults = () => {
    if (confirm('Tilbakestill alle innstillinger til standardverdier?')) {
      setFormState(DEFAULT_SETTINGS);
      onSaveSettings(DEFAULT_SETTINGS);
      if (DEFAULT_SETTINGS.soundEffects) {
        playChime('click');
      }
    }
  };

  const themes: { id: AppTheme; label: string; desc: string; previewBg: string; borderAccent: string }[] = [
    {
      id: 'midnight',
      label: 'Midnight Navy',
      desc: 'Dyp mørkeblå nattpalett med cyan-aksenter (standard)',
      previewBg: 'bg-slate-950 border-cyan-500',
      borderAccent: 'border-cyan-500',
    },
    {
      id: 'obsidian',
      label: 'Obsidian Minimal',
      desc: 'Kullsort monokrom med nøytrale gråtoner for maksimal kontrast',
      previewBg: 'bg-neutral-950 border-neutral-600',
      borderAccent: 'border-neutral-400',
    },
    {
      id: 'cyberpunk',
      label: 'Cyberpunk Matrix',
      desc: 'Futuristisk mørkt grensesnitt med neongrønne og smaragd-aksenter',
      previewBg: 'bg-slate-950 border-emerald-500',
      borderAccent: 'border-emerald-400',
    },
    {
      id: 'nordic',
      label: 'Nordic Aurora',
      desc: 'Arktisk skifergrå med fiolette og frosne blå toner',
      previewBg: 'bg-zinc-900 border-indigo-500',
      borderAccent: 'border-indigo-400',
    },
    {
      id: 'light',
      label: 'Clean Studio Light',
      desc: 'Høy-kontrast lys bakgrunn for dagtidsarbeid og rapportering',
      previewBg: 'bg-slate-100 border-slate-400 text-slate-900',
      borderAccent: 'border-blue-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="settings-modal-card"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Innstillinger & Preferanser
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  v2.4
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tilpass utseende, CodeSentinel-valideringsregler, git-sanering og varsler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              title="Tilbakestill standarder"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Standard</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Grid with Left Category Tabs & Right Form View */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Category Navigation (Left Sidebar) */}
          <div className="md:col-span-4 p-4 border-r border-slate-800 bg-slate-950/40 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => setActiveCategory('appearance')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeCategory === 'appearance'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Tema & Utseende</span>
            </button>

            <button
              onClick={() => setActiveCategory('sentinel')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeCategory === 'sentinel'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>CodeSentinel Sannhetsmotor</span>
            </button>

            <button
              onClick={() => setActiveCategory('git')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeCategory === 'git'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Git & Branch-Sanering</span>
            </button>

            <button
              onClick={() => setActiveCategory('notifications')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeCategory === 'notifications'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Varsler & Sikkerhetsalarm</span>
            </button>

            <button
              onClick={() => setActiveCategory('defaults')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeCategory === 'defaults'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Språk & Standardvisning</span>
            </button>

            {/* Quick Status Pill in Sidebar */}
            <div className="mt-8 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Sannhetskontroll Aktiv</span>
              </div>
              <div>Strictness: <span className="text-cyan-300 font-mono">{formState.strictness.toUpperCase()}</span></div>
              <div>Theme: <span className="text-slate-300 font-mono">{formState.theme}</span></div>
            </div>
          </div>

          {/* Setting Options Form (Right Body) */}
          <div className="md:col-span-8 p-6 overflow-y-auto max-h-[70vh] space-y-6">
            
            {/* 1. APPEARANCE & THEMES */}
            {activeCategory === 'appearance' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    Fargetemaer
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Velg visuell profil for dashboard, portfoliokort og sanntidsvisning
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {themes.map((t) => {
                    const isSelected = formState.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setFormState({ ...formState, theme: t.id });
                          if (formState.soundEffects) playChime('click');
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500'
                            : 'bg-slate-950/80 hover:bg-slate-800/50 border-slate-800'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 p-1 rounded-full bg-cyan-500 text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-3.5 h-3.5 rounded-full border ${t.previewBg}`} />
                          <span className="font-bold text-xs text-slate-200">{t.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Density and Accents */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Korttetthet (UI Density)</div>
                      <div className="text-[11px] text-slate-400">Juster avstand og størrelse på portfoliokort</div>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                      {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFormState({ ...formState, density: d })}
                          className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                            formState.density === d ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Monospace Teknologimerker</div>
                      <div className="text-[11px] text-slate-400">Bruk kildekodefont på språk- og arkitekturmerker</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.codeFontBadges}
                      onChange={(e) => setFormState({ ...formState, codeFontBadges: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Glatte Animasjoner & Overganger</div>
                      <div className="text-[11px] text-slate-400">Aktiver mikrobevegelser og feieeffekter</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.enableAnimations}
                      onChange={(e) => setFormState({ ...formState, enableAnimations: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. CODESENTINEL TRUTH ENGINE */}
            {activeCategory === 'sentinel' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    CodeSentinel Valideringsregler
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Definer terskelverdier for når påstander godkjennes eller flagges for manuell revisjon
                  </p>
                </div>

                {/* Strictness selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Valideringsstrenghet (Verification Strictness)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, strictness: 'zero_tolerance' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formState.strictness === 'zero_tolerance'
                          ? 'bg-rose-950/40 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs">Zero-Tolerance (95%)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Nekter enhver uklar referanse</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, strictness: 'strict' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formState.strictness === 'strict'
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs">Streng Balanse (80%)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Standard produksjonsterskel</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, strictness: 'permissive' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formState.strictness === 'permissive'
                          ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs">Permissiv (60%)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">For tidlige lab-prosjekter</div>
                    </button>
                  </div>
                </div>

                {/* Auto Sweep Interval */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Automatisk Sannhetstest (Auto-Sweep)</div>
                    <div className="text-[11px] text-slate-400">Kjør CodeSentinel i bakgrunnen med jevne mellomrom</div>
                  </div>
                  <select
                    value={formState.autoSweepInterval}
                    onChange={(e) => setFormState({ ...formState, autoSweepInterval: e.target.value as any })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="off">Av (Kun manuell)</option>
                    <option value="30s">Hver 30. sekund</option>
                    <option value="1m">Hvert minutt</option>
                    <option value="5m">Hvert 5. minutt</option>
                    <option value="15m">Hvert 15. minutt</option>
                  </select>
                </div>

                {/* Verification Toggles */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Krev Faktadokumentasjon i README</div>
                      <div className="text-[11px] text-slate-400">Flagg egenskaper som ikke kan gjenfinnes i README.md</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.requireReadmeDoc}
                      onChange={(e) => setFormState({ ...formState, requireReadmeDoc: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Valider Teknologistakk mot Package/Filer</div>
                      <div className="text-[11px] text-slate-400">Kryssjekk mot package.json, .csproj og repo-språk</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.requirePackageJsonCheck}
                      onChange={(e) => setFormState({ ...formState, requirePackageJsonCheck: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Synkroniser Beskrivelse fra README</div>
                      <div className="text-[11px] text-slate-400">Overskriv manuelle kortbeskrivelser med fakta fra GitHub</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.autoSyncDescriptionsFromReadme}
                      onChange={(e) => setFormState({ ...formState, autoSyncDescriptionsFromReadme: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                    />
                  </div>

                  {/* GitHub API & Autonomous Worker Controls */}
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <div>
                      <div className="text-xs font-bold text-slate-200">GitHub Personal Access Token (PAT)</div>
                      <div className="text-[11px] text-slate-400">Valgfritt: For å heve GitHub API hastighetsgrenser fra 60 til 5,000 requests/time.</div>
                      <input
                        type="password"
                        placeholder="ghp_..."
                        value={formState.githubPersonalAccessToken || ''}
                        onChange={(e) => setFormState({ ...formState, githubPersonalAccessToken: e.target.value })}
                        className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Live HTML Deployment-Inspeksjon</div>
                        <div className="text-[11px] text-slate-400">Gjennomfør sanntids inspeksjon av &lt;title&gt; og innhold på demo-URL (Anti-Kenya sperre)</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formState.enableLiveUrlInspection ?? true}
                        onChange={(e) => setFormState({ ...formState, enableLiveUrlInspection: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Autonom Selvreparasjons-Agent</div>
                        <div className="text-[11px] text-slate-400">La CodeSentinel automatisk reparere identitetsavvik og synkronisere mot GitHub-sannhet</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formState.enableAutonomousSelfWorker ?? true}
                        onChange={(e) => setFormState({ ...formState, enableAutonomousSelfWorker: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Tamper-Proof Attribution Guard Indicator */}
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-rose-200 flex items-center gap-2">
                        <span>Attribusjonsvern (#CS-09): Permanent Låst</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-900 text-rose-300 rounded font-bold">
                          SYSTEMLÅST
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        Sperre mot å fremstille <code className="text-rose-300 font-mono">cross-device-sdk</code> eller andre eksterne rammeverk som eget forfatterskap er permanent håndhevet i koden og kan ikke deaktiveres.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. GIT SANITATION & BRANCH PRUNING */}
            {activeCategory === 'git' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-cyan-400" />
                    Git-Sanering & Branch-Rydding
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Konfigurer strategien for å identifisere og rydde opp i duplikate brancher i repositories
                  </p>
                </div>

                {/* Strategy Cards */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Slette- og Sammenligningsregel
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, branchCleanupStrategy: 'merge_base' })}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                        formState.branchCleanupStrategy === 'merge_base'
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-200 flex items-center gap-2">
                          <span>git merge-base --is-ancestor (Anbefalt)</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                            Tryggest
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Sletter brancher hvis committen er en bekreftet forfader til main-grenen. Håndterer squash/rebase trygt.
                        </div>
                      </div>
                      <div className="shrink-0 font-mono text-[10px] text-cyan-400">Alternativ B</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, branchCleanupStrategy: 'exact_sha' })}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                        formState.branchCleanupStrategy === 'exact_sha'
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-200">
                          Eksakt SHA-match mot Main ($branchSha -eq $mainSha)
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Sletter kun dersom branchen peker til nøyaktig samme commit-hash som main sitt nåværende hode.
                        </div>
                      </div>
                      <div className="shrink-0 font-mono text-[10px] text-slate-400">Klassisk</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, branchCleanupStrategy: 'duplicate_heads' })}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                        formState.branchCleanupStrategy === 'duplicate_heads'
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-200">
                          Duplikat Sibling-Konsolidering
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Beholder første branch i en duplikatgruppe og fjerner overskytende kopier (f.eks. launch-hardening-1..5).
                        </div>
                      </div>
                      <div className="shrink-0 font-mono text-[10px] text-amber-400">Alternativ A</div>
                    </button>
                  </div>
                </div>

                {/* Stale and Dry Run */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Foreldet Gren-Terskel (Stale Branches)</div>
                      <div className="text-[11px] text-slate-400">Antall dager inaktivitet før en branch vurderes for sanering</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={7}
                        max={365}
                        value={formState.staleBranchDays}
                        onChange={(e) => setFormState({ ...formState, staleBranchDays: Number(e.target.value) || 30 })}
                        className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 text-center font-mono"
                      />
                      <span className="text-xs text-slate-400 font-mono">dager</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Automatisk Dry-Run Sikkerhet</div>
                      <div className="text-[11px] text-slate-400">Generer alltid en sletterapport og krev bekreftelse før git branch -D kjøres</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.autoDryRunBranchPrune}
                      onChange={(e) => setFormState({ ...formState, autoDryRunBranchPrune: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS & ALERTS */}
            {activeCategory === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    Varsler & Sikkerhetsvarsling
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Administrer toast-meldinger, varsellyder og overvåkningsalarmer
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Vis Toast-Varsler i Sanntid</div>
                      <div className="text-[11px] text-slate-400">Motta direkte tilbakemeldinger ved fullført sannhetstest</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.toastNotifications}
                      onChange={(e) => setFormState({ ...formState, toastNotifications: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Lydvarsler (Syntetiske Chimes)</div>
                      <div className="text-[11px] text-slate-400">Gjengi behagelige Web Audio-toner ved validering og sperrer</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => playChime('success')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono transition-colors"
                      >
                        Test Lyd
                      </button>
                      <input
                        type="checkbox"
                        checked={formState.soundEffects}
                        onChange={(e) => {
                          setFormState({ ...formState, soundEffects: e.target.checked });
                          if (e.target.checked) playChime('success');
                        }}
                        className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Høy-Prioritet Attribusjonsalarm</div>
                      <div className="text-[11px] text-slate-400">Varsle umiddelbart dersom et uautorisert bibliotek oppdages i katalogen</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.attributionBreachAlert}
                      onChange={(e) => setFormState({ ...formState, attributionBreachAlert: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Vis Discrepancy Badges i Portfoliokort</div>
                      <div className="text-[11px] text-slate-400">Marker antall udokumenterte påstander direkte på prosjektflaten</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formState.flaggedDiscrepancyBadges}
                      onChange={(e) => setFormState({ ...formState, flaggedDiscrepancyBadges: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-800 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. LOCALIZATION & DEFAULTS */}
            {activeCategory === 'defaults' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Språk & Standardvisning
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Velg startfane og språkdrakt for CodeSentinel
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Grensesnittspråk</div>
                      <div className="text-[11px] text-slate-400">Bruk norsk fagspråk eller engelsk standard</div>
                    </div>
                    <select
                      value={formState.language}
                      onChange={(e) => setFormState({ ...formState, language: e.target.value as any })}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="no">Norsk (Bokmål)</option>
                      <option value="en">English (US)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Standard Startfane</div>
                      <div className="text-[11px] text-slate-400">Hvilket visningsbilde som åpnes automatisk ved oppstart</div>
                    </div>
                    <select
                      value={formState.defaultView}
                      onChange={(e) => setFormState({ ...formState, defaultView: e.target.value as any })}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="portfolio">Verifisert Portfolio</option>
                      <option value="sentinel">CodeSentinel Kontrollsenter</option>
                      <option value="registry">Prosjektregister (JSON/Tabell)</option>
                      <option value="audit">Revisjonslogg & Sannhetsrapport</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            {savedSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Innstillinger lagret og aktivert!
              </span>
            ) : (
              <span>Endringer lagres automatisk i lokal lagring (localStorage)</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Lukk
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-950 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Lagre Innstillinger
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
