import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCode2,
  Github,
  Globe,
  Layers,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react';
import { GitHubRepoFixture, RegistryProject, VerificationResult } from '../types';
import {
  autoRepairProjectIdentity,
  runCodeSentinelVerification,
  runCodeSentinelVerificationAsync,
} from '../lib/sentinel';
import { fetchLiveGitHubRepo } from '../lib/githubLive';

interface ProjectDetailModalProps {
  project: RegistryProject | null;
  onClose: () => void;
  onUpdateProject?: (project: RegistryProject) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'readme' | 'dependencies' | 'sentinel_audit'>('overview');
  const [liveRepo, setLiveRepo] = useState<GitHubRepoFixture | undefined>();
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [repairSuccessMsg, setRepairSuccessMsg] = useState<string | null>(null);
  const [copiedProof, setCopiedProof] = useState(false);

  useEffect(() => {
    if (!project) return;

    let mounted = true;
    setIsLoadingLive(true);

    const load = async () => {
      try {
        const repoResult = await fetchLiveGitHubRepo(project.githubRepo);
        const verificationResult = await runCodeSentinelVerificationAsync(
          project,
          undefined,
          undefined,
          'Project Detail Inspector',
          'manual_verification',
        );

        if (!mounted) return;
        setLiveRepo(repoResult.repo);
        setVerification(verificationResult);
      } catch {
        if (!mounted) return;
        setVerification(runCodeSentinelVerification(project));
      } finally {
        if (mounted) setIsLoadingLive(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [project]);

  if (!project) return null;

  const currentVerification = verification ?? runCodeSentinelVerification(project, liveRepo);
  const blocked = project.isDisallowedAsOwnWork || currentVerification.disallowedAttributionBlocked;
  const expectedTitle = project.expectedHtmlTitle || liveRepo?.expectedHtmlTitle || project.name;
  const actualTitle = project.actualHtmlTitle || liveRepo?.actualHtmlTitle;
  const passedChecks = currentVerification.checks.filter((check) => check.status === 'passed').length;

  const handleAutoRepair = () => {
    if (!onUpdateProject || !liveRepo) return;
    const result = autoRepairProjectIdentity(project, liveRepo);
    onUpdateProject(result.repairedProject);
    setRepairSuccessMsg(`Automatisk reparert: ${result.changesApplied.join('. ')}`);
  };

  const handleCopyProof = async () => {
    const fingerprint = currentVerification.apiDiagnostics?.sha256Fingerprint;
    if (!fingerprint) return;
    await navigator.clipboard.writeText(fingerprint);
    setCopiedProof(true);
    window.setTimeout(() => setCopiedProof(false), 2000);
  };

  const tabs = [
    ['overview', 'Oversikt', Layers],
    ['sentinel_audit', 'Sentinel', ShieldCheck],
    ['readme', 'README', BookOpen],
    ['dependencies', 'Avhengigheter', FileCode2],
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <section className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-800 bg-slate-950/80 p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className={`rounded-xl border p-3 ${blocked ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'}`}>
              {blocked ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">{project.name}</h2>
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs uppercase text-slate-300">
                  {project.tier}
                </span>
                {isLoadingLive ? (
                  <span className="flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300">
                    <RefreshCw className="h-3 w-3 animate-spin" /> Verifiserer
                  </span>
                ) : blocked ? (
                  <span className="flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs text-rose-300">
                    <ShieldAlert className="h-3 w-3" /> Blokkert
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> Verifisert
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-cyan-400"><Github className="h-3.5 w-3.5" />{project.githubRepo}</span>
                <span>•</span>
                <span>{project.category}</span>
                {liveRepo?.license && <><span>•</span><span>{liveRepo.license}</span></>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Lukk">
            <X className="h-5 w-5" />
          </button>
        </header>

        <nav className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/40 px-4">
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-medium ${activeTab === id ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </nav>

        <main className="space-y-5 overflow-y-auto p-6">
          {repairSuccessMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-950/60 p-3 text-xs text-emerald-200">
              <Check className="h-4 w-4" /> {repairSuccessMsg}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-5">
              {blocked && (
                <div className="rounded-xl border border-rose-800 bg-rose-950/50 p-4 text-sm text-rose-200">
                  <div className="mb-1 flex items-center gap-2 font-bold"><ShieldAlert className="h-4 w-4" /> Sikkerhetslås aktivert</div>
                  <p>{project.forbiddenReason || 'Attribusjonen er blokkert av verifiseringsmotoren.'}</p>
                </div>
              )}

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Beskrivelse</div>
                <p className="text-sm leading-relaxed text-slate-200">{project.shortDescription}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-400">Kjernefunksjoner</div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {project.claimedFeatures.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{feature}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-cyan-400">Teknologier</div>
                  <div className="flex flex-wrap gap-2">
                    {project.claimedTechnologies.map((technology) => <span key={technology} className="rounded-md border border-cyan-800/60 bg-cyan-950/60 px-2 py-1 font-mono text-xs text-cyan-300">{technology}</span>)}
                  </div>
                </div>
              </div>

              {project.deploymentUrl && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400"><Globe className="h-4 w-4" /> Live deployment</div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div><div className="text-[10px] uppercase text-slate-500">URL</div><div className="truncate font-mono text-xs text-cyan-300">{project.deploymentUrl}</div></div>
                    <div><div className="text-[10px] uppercase text-slate-500">HTML-tittel</div><div className="font-mono text-xs text-emerald-300">{actualTitle || expectedTitle}</div></div>
                  </div>
                  <a href={project.deploymentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500">
                    Åpne demo <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sentinel_audit' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400">Sannhetsscore</div>
                  <div className="text-2xl font-bold text-emerald-400">{currentVerification.score} / 100</div>
                  <div className="text-xs text-slate-500">{passedChecks} av {currentVerification.checks.length} kontroller bestått</div>
                </div>
                {onUpdateProject && liveRepo && currentVerification.score < 100 && (
                  <button onClick={handleAutoRepair} className="flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500">
                    <Wrench className="h-3.5 w-3.5" /> Auto-reparer
                  </button>
                )}
              </div>

              {currentVerification.apiDiagnostics?.sha256Fingerprint && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
                  <span className="truncate text-slate-300">SHA-256: {currentVerification.apiDiagnostics.sha256Fingerprint}</span>
                  <button onClick={() => void handleCopyProof()} className="flex shrink-0 items-center gap-1 rounded bg-slate-800 px-2 py-1 text-slate-200">
                    <Copy className="h-3 w-3" /> {copiedProof ? 'Kopiert' : 'Kopier'}
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {currentVerification.checks.map((check) => (
                  <div key={check.id} className={`rounded-xl border p-3 text-xs ${check.status === 'passed' ? 'border-slate-800 bg-slate-950/60' : check.status === 'warning' ? 'border-amber-800 bg-amber-950/40' : 'border-rose-800 bg-rose-950/40'}`}>
                    <div className="flex items-center justify-between gap-3 font-semibold"><span>{check.ruleCode} — {check.title}</span><span>{check.status}</span></div>
                    <p className="mt-1 text-slate-400">{check.description}</p>
                    <p className="mt-2 font-mono text-slate-300">{check.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'readme' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-400"><Github className="h-4 w-4" /> Live GitHub README</div>
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-slate-300">{liveRepo?.readmeContent || 'Ingen README mottatt.'}</pre>
            </div>
          )}

          {activeTab === 'dependencies' && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400"><FileCode2 className="h-4 w-4" /> Avhengigheter</div>
              {liveRepo?.packageJson?.dependencies ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(liveRepo.packageJson.dependencies).map(([name, version]) => <div key={name} className="flex justify-between rounded border border-slate-800 bg-slate-900 p-2 font-mono text-xs"><span className="text-cyan-300">{name}</span><span className="text-slate-400">{String(version)}</span></div>)}
                </div>
              ) : <p className="text-xs text-slate-500">Ingen package.json-avhengigheter funnet.</p>}
            </div>
          )}

          {!isLoadingLive && !currentVerification.isLiveVerifiedFromGitHub && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-800 bg-amber-950/40 p-3 text-xs text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {currentVerification.apiDiagnostics?.error || 'Live GitHub-verifisering er ikke tilgjengelig.'}
            </div>
          )}
        </main>
      </section>
    </div>
  );
};
