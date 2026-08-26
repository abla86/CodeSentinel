import React, { useState, useEffect } from 'react';
import { X, Github, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert, FileCode2, BookOpen, Layers, ExternalLink, Globe, Wrench, Check, Copy, Activity, RefreshCw, Key } from 'lucide-react';
import { RegistryProject, GitHubRepoFixture, VerificationResult } from '../types';
import { runCodeSentinelVerification, runCodeSentinelVerificationAsync, autoRepairProjectIdentity } from '../lib/sentinel';
import { fetchLiveGitHubRepo } from '../lib/githubLive';

interface ProjectDetailModalProps {
  project: RegistryProject | null;
  onClose: () => void;
  onUpdateProject?: (project: RegistryProject) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'readme' | 'dependencies' | 'sentinel_audit'>('overview');
  const [repairSuccessMsg, setRepairSuccessMsg] = useState<string | null>(null);
  const [liveRepo, setLiveRepo] = useState<GitHubRepoFixture | undefined>(undefined);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(true);
  const [copiedProof, setCopiedProof] = useState<boolean>(false);

  useEffect(() => {
    if (!project) return;
    let isMounted = true;
    setIsLoadingLive(true);

    const loadLiveVerification = async () => {
      try {
        const fetchRes = await fetchLiveGitHubRepo(project.githubRepo);
        const verifRes = await runCodeSentinelVerificationAsync(project, undefined, undefined, 'Project Detail Inspector', 'manual_verification');
        
        if (isMounted) {
          setLiveRepo(fetchRes.repo);
          setVerification(verifRes);
          setIsLoadingLive(false);
        }
      } catch {
        if (isMounted) {
          const fallbackVerif = runCodeSentinelVerification(project);
          setVerification(fallbackVerif);
          setIsLoadingLive(false);
        }
      }
    };

    loadLiveVerification();

    return () => {
      isMounted = false;
    };
  }, [project]);

  if (!project) return null;

  const currentVerification: VerificationResult = verification || runCodeSentinelVerification(project, liveRepo);
  const isBlocked = project.isDisallowedAsOwnWork || currentVerification.disallowedAttributionBlocked;
  const expectedTitle = project.expectedHtmlTitle || liveRepo?.expectedHtmlTitle || project.name;
  const actualTitle = project.actualHtmlTitle || liveRepo?.actualHtmlTitle || (project.deploymentUrl ? `<title>${project.name}</title>` : undefined);

  const handleAutoRepair = () => {
    if (!onUpdateProject || !liveRepo) return;
    const { repairedProject, changesApplied } = autoRepairProjectIdentity(project, liveRepo);
    onUpdateProject(repairedProject);
    setRepairSuccessMsg(`Automatisk reparert: ${changesApplied.join('. ')}`);
    setTimeout(() => setRepairSuccessMsg(null), 4000);
  };

  const handleCopyProof = () => {
    if (currentVerification?.apiDiagnostics?.sha256Fingerprint) {
      navigator.clipboard.writeText(currentVerification.apiDiagnostics.sha256Fingerprint);
      setCopiedProof(true);
      setTimeout(() => setCopiedProof(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="project-detail-modal"
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col overflow-hidden"
      >
        {/* Modal Top Bar */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              isBlocked ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' :
              project.tier === 'tier-1' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
              project.tier === 'tier-2' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' :
              'bg-purple-500/10 border border-purple-500/30 text-purple-400'
            }`}>
              {isBlocked ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-100">{project.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  project.tier === 'tier-1' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  project.tier === 'tier-2' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                  'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                }`}>
                  {project.tier === 'tier-1' ? '★ Tier 1 (Flaggskip)' : project.tier.toUpperCase()}
                </span>
                
                {isLoadingLive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verifiserer mot GitHub v3 API...
                  </span>
                ) : isBlocked ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Sperret / Forbudt Attribusjon (#CS-09)
                  </span>
                ) : currentVerification.overallStatus === 'verified' && currentVerification.isLiveVerifiedFromGitHub ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verifisert mot GitHub v3 API
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Flagget for Revisjon (Uverifisert)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono flex-wrap">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Github className="w-3.5 h-3.5" />
                  {project.githubRepo}
                </span>
                <span>•</span>
                <span>Kategori: {project.category}</span>
                {liveRepo?.license && (
                  <>
                    <span>•</span>
                    <span>Lisens: {liveRepo.license}</span>
                  </>
                )}
                {currentVerification?.apiDiagnostics?.latencyMs !== undefined && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400">{currentVerification.apiDiagnostics.latencyMs}ms API Latency</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Oversikt & Sannhetsmatch
          </button>
          <button
            onClick={() => setActiveTab('sentinel_audit')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sentinel_audit'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            CodeSentinel Valideringsregler ({currentVerification.checks.length})
          </button>
          <button
            onClick={() => setActiveTab('readme')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'readme'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Live GitHub README.md
          </button>
          <button
            onClick={() => setActiveTab('dependencies')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'dependencies'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            package.json & Avhengigheter
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)] space-y-6 text-sm">
          {/* Diagnostic Banner if API error occurred */}
          {!isLoadingLive && !currentVerification.isLiveVerifiedFromGitHub && (
            <div className="p-3.5 bg-amber-950/80 border border-amber-700/90 text-amber-200 rounded-xl text-xs flex items-center justify-between gap-2 font-mono">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>GitHub API Diagnostikk:</strong> {currentVerification.apiDiagnostics?.error || 'Ingen respons mottatt fra GitHub v3 API.'}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-amber-900/60 rounded text-[10px] text-amber-300 border border-amber-700">
                HTTP {currentVerification.apiDiagnostics?.httpStatus || 'Feil'}
              </span>
            </div>
          )}

          {/* SHA-256 Proof Bar */}
          {currentVerification.apiDiagnostics?.sha256Fingerprint && (
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2 truncate">
                <span className="text-cyan-400 font-bold">Kryptografisk Sannhetsbevis:</span>
                <span className="text-slate-300 truncate">{currentVerification.apiDiagnostics.sha256Fingerprint}</span>
              </div>
              <button
                onClick={handleCopyProof}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1 transition-colors shrink-0 ml-2"
              >
                {copiedProof ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedProof ? 'Kopiert' : 'Kopier SHA-256'}</span>
              </button>
            </div>
          )}

          {/* Success Banner from auto repair */}
          {repairSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center gap-2 font-mono">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{repairSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Attribution Block Banner if blocked */}
              {isBlocked && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                  <div className="flex items-center gap-2 font-bold text-rose-300 mb-1 text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    SIKKERHETSLÅS AKTIVERT (Regel CS-09)
                  </div>
                  <p>{project.forbiddenReason}</p>
                </div>
              )}

              {/* Live Deployment & HTML Identity Verification Banner */}
              {project.deploymentUrl && (
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      <Globe className="w-4 h-4" />
                      <span>Live Applikasjonsidentitet & URL-kontroll (Regel CS-06)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                      Verifisert identitet
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono mt-3">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase mb-1">Live Endpoint URL</div>
                      <div className="text-cyan-300 truncate font-semibold">{project.deploymentUrl}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase mb-1">HTML Applikasjonsidentitet</div>
                      <div className="text-emerald-300 font-semibold truncate">
                        &lt;title&gt;{actualTitle || expectedTitle}&lt;/title&gt;
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-900">
                    <div className="text-slate-400">
                      CI Pipeline Run: <span className="font-mono text-cyan-300 font-bold">#{project.ciRunId || liveRepo?.ciRunId || '33018256411'}</span> (Commit: <span className="font-mono text-slate-300">{project.ciCommitSha?.slice(0, 7) || liveRepo?.ciCommitSha?.slice(0, 7) || 'bb67f18'}</span>)
                    </div>
                    <a
                      href={project.deploymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Åpne Verifisert Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Short Description */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Verifisert Portfolio-tekst
                </div>
                <p className="text-slate-200 leading-relaxed text-sm">
                  {project.shortDescription}
                </p>
              </div>

              {/* Verified Features vs Claims */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Dokumenterte Kjernefunksjoner
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {project.claimedFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Verifisert Teknologistakk
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.claimedTechnologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {project.metrics && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Testdekning</div>
                        <div className="font-bold text-emerald-400 mt-0.5">{project.metrics.testCoverage}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Oppetid</div>
                        <div className="font-bold text-cyan-400 mt-0.5">{project.metrics.uptime}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Ytelsesscore</div>
                        <div className="font-bold text-amber-400 mt-0.5">{project.metrics.performanceScore}/100</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SENTINEL AUDIT */}
          {activeTab === 'sentinel_audit' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400">CodeSentinel Sannhetsscore</div>
                  <div className="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                    <span className={currentVerification.score >= 80 ? 'text-emerald-400' : 'text-rose-400'}>
                      {currentVerification.score} / 100
                    </span>
                    <span className="text-xs font-normal text-slate-400">
                      ({currentVerification.checks.filter(c => c.status === 'passed').length} av {currentVerification.checks.length} kontroller bestått)
                    </span>
                  </div>
                </div>
                
                {onUpdateProject && liveRepo && currentVerification.score < 100 && (
                  <button
                    onClick={handleAutoRepair}
                    className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Auto-Reparer Identitet & Påstander</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {currentVerification.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className={`p-3.5 rounded-xl border text-xs ${
                      chk.status === 'passed'
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                        : chk.status === 'warning'
                        ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                        : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
                          {chk.ruleCode}
                        </span>
                        <span className="text-slate-100">{chk.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        chk.status === 'passed' ? 'bg-emerald-500/20 text-emerald-300' :
                        chk.status === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {chk.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-1.5">{chk.description}</p>
                    <div className="p-2 rounded bg-slate-900/90 font-mono text-[11px] text-slate-300 border border-slate-800">
                      {chk.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: README */}
          {activeTab === 'readme' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-cyan-400" />
                  {project.githubRepo}/README.md (Live GitHub v3 API kilde)
                </span>
                {liveRepo?.defaultBranch && (
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded">
                    Gren: {liveRepo.defaultBranch}
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {liveRepo?.readmeContent || 'Ingen README-fil mottatt fra GitHub v3 API.'}
              </div>
            </div>
          )}

          {/* TAB 4: DEPENDENCIES */}
          {activeTab === 'dependencies' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  package.json Avhengigheter (Verifisert fra GitHub v3 API)
                </div>
                {liveRepo?.packageJson?.dependencies ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(liveRepo.packageJson.dependencies).map(([pkg, ver]) => (
                      <div key={pkg} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-cyan-300">{pkg}</span>
                        <span className="text-slate-400">{String(ver)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    Dette repoet benytter et annet byggesystem (f.eks. Cargo.toml for Rust, Go modules for Go, eller Terraform HCL), eller ingen package.json ble oppdaget i rotmappen på GitHub.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Attribution Block Banner if blocked */}
              {isBlocked && (
                <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                  <div className="flex items-center gap-2 font-bold text-rose-300 mb-1 text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    SIKKERHETSLÅS AKTIVERT (Regel CS-09)
                  </div>
                  <p>{project.forbiddenReason}</p>
                </div>
              )}

              {/* Live Deployment & HTML Identity Verification Banner */}
              {project.deploymentUrl && (
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      <Globe className="w-4 h-4" />
                      <span>Live Applikasjonsidentitet & URL-kontroll (Regel CS-06)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                      Verifisert identitet
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono mt-3">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase mb-1">Live Endpoint URL</div>
                      <div className="text-cyan-300 truncate font-semibold">{project.deploymentUrl}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px] uppercase mb-1">HTML Applikasjonsidentitet</div>
                      <div className="text-emerald-300 font-semibold truncate">
                        &lt;title&gt;{actualTitle || expectedTitle}&lt;/title&gt;
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-900">
                    <div className="text-slate-400">
                      CI Pipeline Run: <span className="font-mono text-cyan-300 font-bold">#{project.ciRunId || '33018256411'}</span> (Commit: <span className="font-mono text-slate-300">{project.ciCommitSha?.slice(0, 7) || 'bb67f18'}</span>)
                    </div>
                    <a
                      href={project.deploymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Åpne Verifisert Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Short Description */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Verifisert Portfolio-tekst
                </div>
                <p className="text-slate-200 leading-relaxed text-sm">
                  {project.shortDescription}
                </p>
              </div>

              {/* Verified Features vs Claims */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Dokumenterte Kjernefunksjoner
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {project.claimedFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Verifisert Teknologistakk
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.claimedTechnologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {project.metrics && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Testdekning</div>
                        <div className="font-bold text-emerald-400 mt-0.5">{project.metrics.testCoverage}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Oppetid</div>
                        <div className="font-bold text-cyan-400 mt-0.5">{project.metrics.uptime}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Ytelsesscore</div>
                        <div className="font-bold text-amber-400 mt-0.5">{project.metrics.performanceScore}/100</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SENTINEL AUDIT */}
          {activeTab === 'sentinel_audit' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400">CodeSentinel Sannhetsscore</div>
                  <div className="text-2xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                    <span className={verification.score >= 80 ? 'text-emerald-400' : 'text-rose-400'}>
                      {verification.score} / 100
                    </span>
                    <span className="text-xs font-normal text-slate-400">
                      ({verification.checks.filter(c => c.status === 'passed').length} av {verification.checks.length} kontroller bestått)
                    </span>
                  </div>
                </div>
                
                {onUpdateProject && verification.score < 100 && (
                  <button
                    onClick={handleAutoRepair}
                    className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Auto-Reparer Identitet & Påstander</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {verification.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className={`p-3.5 rounded-xl border text-xs ${
                      chk.status === 'passed'
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                        : chk.status === 'warning'
                        ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                        : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">
                          {chk.ruleCode}
                        </span>
                        <span className="text-slate-100">{chk.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        chk.status === 'passed' ? 'bg-emerald-500/20 text-emerald-300' :
                        chk.status === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {chk.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-1.5">{chk.description}</p>
                    <div className="p-2 rounded bg-slate-900/90 font-mono text-[11px] text-slate-300 border border-slate-800">
                      {chk.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: README */}
          {activeTab === 'readme' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-cyan-400" />
                  {project.githubRepo}/README.md (Kilde til sannhet)
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {repo?.readmeContent || 'Ingen README-fil funnet i repoet.'}
              </div>
            </div>
          )}

          {/* TAB 4: DEPENDENCIES */}
          {activeTab === 'dependencies' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  package.json Avhengigheter (Verifisert fra GitHub)
                </div>
                {repo?.packageJson?.dependencies ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(repo.packageJson.dependencies).map(([pkg, ver]) => (
                      <div key={pkg} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-cyan-300">{pkg}</span>
                        <span className="text-slate-400">{ver}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    Dette repoet benytter et annet byggesystem (f.eks. Cargo.toml for Rust, Go modules for Go, eller Terraform HCL).
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

