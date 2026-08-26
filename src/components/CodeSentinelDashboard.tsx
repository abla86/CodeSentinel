import React, { useState } from 'react';
import { RegistryProject, VerificationResult, AppSettings, LiveHtmlInspection } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Play, 
  Eye, 
  FileText, 
  Lock, 
  Sparkles, 
  Filter, 
  Wrench, 
  Globe, 
  ExternalLink,
  Cpu,
  Bot,
  Zap,
  Activity
} from 'lucide-react';
import { runCodeSentinelVerification, autoRepairProjectIdentity } from '../lib/sentinel';

interface CodeSentinelDashboardProps {
  projects: RegistryProject[];
  verificationResults: Record<string, VerificationResult>;
  onRunSweep: () => void;
  onRunAutonomousCycle?: () => void;
  isSweeping: boolean;
  onSelectProject: (project: RegistryProject) => void;
  canRunSentinel: boolean;
  onOpenAuth: () => void;
  onAutoRepairProject?: (project: RegistryProject) => void;
  settings?: AppSettings;
}

export const CodeSentinelDashboard: React.FC<CodeSentinelDashboardProps> = ({
  projects,
  verificationResults,
  onRunSweep,
  onRunAutonomousCycle,
  isSweeping,
  onSelectProject,
  canRunSentinel,
  onOpenAuth,
  onAutoRepairProject,
  settings,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'flagged' | 'blocked'>('all');
  const [repairNotice, setRepairNotice] = useState<string | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const selectedResult = selectedProject ? verificationResults[selectedProject.id] || runCodeSentinelVerification(selectedProject, undefined, settings) : null;

  const totalVerified = Object.values(verificationResults).filter(r => r.overallStatus === 'verified').length;
  const totalFlagged = Object.values(verificationResults).filter(r => r.overallStatus === 'flagged').length;
  const totalBlocked = Object.values(verificationResults).filter(r => r.overallStatus === 'blocked_disallowed' || projects.find(p => p.id === r.projectId)?.isDisallowedAsOwnWork).length;

  const handleRepair = (project: RegistryProject) => {
    if (!onAutoRepairProject) return;
    const { repairedProject, changesApplied } = autoRepairProjectIdentity(project);
    onAutoRepairProject(repairedProject);
    setRepairNotice(`Suksess: ${changesApplied.join('. ')}`);
    setTimeout(() => setRepairNotice(null), 5000);
  };

  const filteredProjects = projects.filter(p => {
    const res = verificationResults[p.id];
    const status = res?.overallStatus || p.status;
    if (activeFilter === 'verified') return status === 'verified';
    if (activeFilter === 'flagged') return status === 'flagged';
    if (activeFilter === 'blocked') return status === 'blocked_disallowed' || p.isDisallowedAsOwnWork;
    return true;
  });

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Top Banner / Pipeline Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <Terminal className="w-4 h-4" />
              <span>KONTROLLSENTRAL FOR REVISJON & KILDESANNHET (abla86)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>CodeSentinel Sannhetsmotor & Verifiseringsrørledning</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live GitHub REST API
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Automatisk kryssvalidering mellom portfolio-registeret og ekte GitHub-repositorier for <strong>abla86</strong>. 
              Garanterer at ingen uprøvde påstander eller feil applikasjonsidentiteter (Anti-Kenya sperre) lekker ut i produksjon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {canRunSentinel ? (
              <>
                {onRunAutonomousCycle && (
                  <button
                    id="run-autonomous-agent-btn"
                    onClick={onRunAutonomousCycle}
                    disabled={isSweeping}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center gap-2 disabled:opacity-50"
                    title="Kjører autonom syklus: diagnostiserer, reparerer avvik og re-verifiserer automatisk"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{isSweeping ? 'Autonom agent arbeider...' : 'Kjør Autonom Sannhetsagent'}</span>
                  </button>
                )}

                <button
                  id="run-sweep-dashboard-btn"
                  onClick={onRunSweep}
                  disabled={isSweeping}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSweeping ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  <span>{isSweeping ? 'Verifiserer...' : 'Kjør Full Sweep'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Logg inn for å kjøre test</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Pipeline Flowchart */}
        <div className="mt-6 pt-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Sannhetsflyt: GitHub (abla86) → CodeSentinel Engine → Verifisert Portfolio
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-cyan-400 font-mono text-[10px] font-bold mb-1">01. KILDESANNHET</div>
                <div className="font-semibold text-slate-200">GitHub API (abla86)</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  README.md, package.json dependencies, commit SHA og CI/CD workflows.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Live kildekobling</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-cyan-400 font-mono text-[10px] font-bold mb-1">02. APPLIKASJONSIDENTITET</div>
                <div className="font-semibold text-slate-200">Live URL HTML-Inspeksjon</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Parser &lt;title&gt; og meta tags på demo-URL (Anti-Kenya sperre).
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Ikke bare HTTP 200</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-sm shadow-cyan-950 flex flex-col justify-between">
              <div>
                <div className="text-cyan-300 font-mono text-[10px] font-bold mb-1">03. CODESENTINEL TEST</div>
                <div className="font-semibold text-cyan-200">14 Deterministiske Regler</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Kryssjekker påstander, pakker, CI-status & sperrer tredjeparts kode.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Eksplisitt «ikke gjett»</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-cyan-400 font-mono text-[10px] font-bold mb-1">04. UTFALL & AUTO-REPARASJON</div>
                <div className="font-semibold text-slate-200">Autonom Sannhets-Sync</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Grønt → Publiseres. <br />
                  Avvik → Autonom selvreparasjon med PR-patch.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                <span>Selvkorrigerende</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attribution Guard Warning Card (cross-device-sdk) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-800/80 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-rose-200">
                Eksplisitt Sikkerhetssperre: Attribusjonsbeskyttelse (#CS-09)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-900/60 text-rose-300 border border-rose-700 font-bold">
                STATUS: LÅST BLOKKERING
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              CodeSentinel har en fastlåst sikkerhetsregel som forbyr å presentere <code className="text-rose-300 font-mono px-1 py-0.5 bg-slate-950 rounded">external-frameworks/cross-device-sdk</code> (eller andre eksterne/tredjeparts rammeverk) som eget ingeniørarbeid.
              Prosjektet er registrert i oversikten som sperret, og vil aldri eksponeres i den offentlige portfolioen til Annebeth / abla86.
            </p>
          </div>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Project Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Prosjekter i Registeret ({projects.length})
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[10px]">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-0.5 rounded ${activeFilter === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
              >
                Alle ({projects.length})
              </button>
              <button
                onClick={() => setActiveFilter('verified')}
                className={`px-2 py-0.5 rounded ${activeFilter === 'verified' ? 'bg-emerald-900 text-emerald-200 font-bold' : 'text-slate-400'}`}
              >
                Verifisert ({totalVerified})
              </button>
              <button
                onClick={() => setActiveFilter('flagged')}
                className={`px-2 py-0.5 rounded ${activeFilter === 'flagged' ? 'bg-amber-900 text-amber-200 font-bold' : 'text-slate-400'}`}
              >
                Flagget ({totalFlagged})
              </button>
              <button
                onClick={() => setActiveFilter('blocked')}
                className={`px-2 py-0.5 rounded ${activeFilter === 'blocked' ? 'bg-rose-900 text-rose-200 font-bold' : 'text-slate-400'}`}
              >
                Sperret ({totalBlocked})
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredProjects.map((proj) => {
              const res = verificationResults[proj.id];
              const isBlocked = proj.isDisallowedAsOwnWork || res?.overallStatus === 'blocked_disallowed';
              const isSelected = proj.id === selectedProject?.id;

              return (
                <button
                  key={proj.id}
                  id={`sentinel-select-${proj.id}`}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500/80 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/80 hover:bg-slate-800/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100">{proj.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {proj.tier.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-1">
                      {proj.githubRepo}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 text-right">
                    {isBlocked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Sperret (#CS-09)
                      </span>
                    ) : res?.overallStatus === 'verified' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{res.score}%</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{res?.score || 0}%</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed CodeSentinel Inspector for Selected Project */}
        <div className="lg:col-span-7">
          {selectedProject && selectedResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              
              {/* Inspector Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100">{selectedProject.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedProject.githubRepo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedProject.shortDescription}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onAutoRepairProject && selectedResult.score < 100 && !selectedProject.isDisallowedAsOwnWork && (
                    <button
                      onClick={() => handleRepair(selectedProject)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow"
                      title="Reparer HTML-identitet og synkroniser stakk automatisk"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Auto-Reparer</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectProject(selectedProject)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Inspiser Alt</span>
                  </button>
                </div>
              </div>

              {/* Repair Notice Alert */}
              {repairNotice && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{repairNotice}</span>
                </div>
              )}

              {/* Live Deployment Identity Card & Anti-Kenya Inspection */}
              {selectedProject.deploymentUrl && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>Live Identitet: &lt;title&gt;{selectedProject.actualHtmlTitle || selectedProject.expectedHtmlTitle || selectedProject.name}&lt;/title&gt;</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>URL: {selectedProject.deploymentUrl}</span>
                        {selectedResult.liveHtmlInspection && (
                          <span className="text-emerald-400">
                            • {selectedResult.liveHtmlInspection.latencyMs}ms respons
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href={selectedProject.deploymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 rounded-lg font-medium flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>Åpne Demo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Score & Verdict Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                selectedResult.overallStatus === 'verified'
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                  : selectedResult.overallStatus === 'blocked_disallowed'
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              }`}>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Sentinel Sannhetsdom (Regelsett v2.4)
                  </div>
                  <div className="text-base font-bold mt-0.5 flex items-center gap-2">
                    {selectedResult.overallStatus === 'verified' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {selectedResult.overallStatus === 'blocked_disallowed' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
                    {selectedResult.overallStatus === 'flagged' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    
                    <span>
                      {selectedResult.overallStatus === 'verified' ? '100% Verifisert mot GitHub Sannhetskilde' :
                       selectedResult.overallStatus === 'blocked_disallowed' ? 'Attribusjonssperre: Ikke tillatt i portfolio' :
                       'Udokumenterte påstander funnet – Flagget for manuell kontroll'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold font-mono">
                    {selectedResult.score}/100
                  </div>
                  <div className="text-[10px] text-slate-400">Sannhetsscore</div>
                </div>
              </div>

              {/* Rule Checks Detail */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Automatiske Valideringskontroller ({selectedResult.checks.length})
                </div>

                <div className="space-y-2 text-xs">
                  {selectedResult.checks.map((chk) => (
                    <div
                      key={chk.id}
                      className={`p-3 rounded-xl border ${
                        chk.status === 'passed'
                          ? 'bg-slate-950/80 border-slate-800/80 text-slate-300'
                          : chk.status === 'warning'
                          ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                          : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-100 flex items-center gap-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-slate-400 border border-slate-800">
                            {chk.ruleCode}
                          </span>
                          {chk.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          chk.status === 'passed' ? 'bg-emerald-500/20 text-emerald-300' :
                          chk.status === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-rose-500/20 text-rose-300'
                        }`}>
                          {chk.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1 bg-slate-900/60 p-2 rounded border border-slate-800/60">
                        {chk.details}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
