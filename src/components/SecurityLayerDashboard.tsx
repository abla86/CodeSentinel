import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  FileCheck2,
  History,
  RotateCcw,
  GitBranch,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  FileCode,
  Sparkles,
  Server,
  Eye,
  Sliders,
  Archive,
  Download,
  ShieldOff,
  UserCheck
} from 'lucide-react';
import {
  RegistryProject,
  AuditLogEntry,
  UserAccount,
  SecurityPillarStatus,
  SecurityApprovalToken,
  SnapshotBackup,
  SchemaValidationResult,
  TamperCheckResult,
  BranchSafetyEvaluation,
  AppSettings,
  QuarantineVaultEntry,
  RepoSafetyGuardEvaluation
} from '../types';
import {
  SECURITY_PILLARS,
  DEFAULT_SECURITY_POLICY,
  generateApprovalToken,
  getStoredApprovalTokens,
  validateApprovalToken,
  evaluateBranchSafety,
  validateRegistrySchema,
  createSnapshotBackup,
  getStoredSnapshots,
  restoreSnapshotBackup,
  verifyTamperIntegrity,
  getRateLimitStatus,
  generatePowerShellSecurityScript,
  getQuarantineVaultEntries,
  restoreFromQuarantineVault,
  exportVaultRecoveryLogfile,
  generatePowerShellRestoreScript,
  evaluateRepoSafetyGuard
} from '../lib/security';

interface SecurityLayerDashboardProps {
  projects: RegistryProject[];
  auditLogs: AuditLogEntry[];
  currentUser: UserAccount | null;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onRestoreProjects: (restored: RegistryProject[]) => void;
  onAddAuditLog: (log: AuditLogEntry) => void;
  onShowToast: (title: string, text: string, type?: 'success' | 'alert' | 'info') => void;
  onOpenAuth: () => void;
}

export const SecurityLayerDashboard: React.FC<SecurityLayerDashboardProps> = ({
  projects,
  auditLogs,
  currentUser,
  settings,
  onUpdateSettings,
  onRestoreProjects,
  onAddAuditLog,
  onShowToast,
  onOpenAuth,
}) => {
  // Sub-tabs in Security Center
  const [activeSecTab, setActiveSecTab] = useState<'pillars' | 'vault' | 'safety_guard' | 'tokens' | 'branch_rules' | 'snapshots' | 'schema' | 'script'>('pillars');

  // Vault state
  const [vaultEntries, setVaultEntries] = useState<QuarantineVaultEntry[]>(() => getQuarantineVaultEntries());
  const [selectedVaultEntry, setSelectedVaultEntry] = useState<QuarantineVaultEntry | null>(null);

  // Safety Evaluator Interactive Test State
  const [guardTestRepo, setGuardTestRepo] = useState('external-org/other-user-repo');
  const [guardTestTarget, setGuardTestTarget] = useState('main');
  const [guardTestType, setGuardTestType] = useState<'branch' | 'file' | 'repo' | 'project'>('repo');
  const [guardEvaluation, setGuardEvaluation] = useState<RepoSafetyGuardEvaluation>(() =>
    evaluateRepoSafetyGuard('external-org/other-user-repo', 'main', 'repo')
  );

  // Tokens state
  const [tokens, setTokens] = useState<SecurityApprovalToken[]>(() => getStoredApprovalTokens());
  const [selectedTokenAction, setSelectedTokenAction] = useState<string>('BRANCH_PRUNE_MERGED');
  const [tokenInputToVerify, setTokenInputToVerify] = useState<string>('');
  const [tokenVerifyResult, setTokenVerifyResult] = useState<{ checked: boolean; valid?: boolean; msg?: string } | null>(null);

  // Snapshots state
  const [snapshots, setSnapshots] = useState<SnapshotBackup[]>(() => {
    const list = getStoredSnapshots();
    if (list.length === 0) {
      // Seed initial baseline snapshot
      const baseline = createSnapshotBackup(projects, 'Automatisk Basissnapshot', 'Systeminitialisering og oppstart', 'CodeSentinel Guardian');
      return [baseline];
    }
    return list;
  });
  const [newSnapshotLabel, setNewSnapshotLabel] = useState('');

  // Branch Rule Interactive Tester
  const [testBranchName, setTestBranchName] = useState('launch-hardening-v1');
  const [testBranchRepo, setTestBranchRepo] = useState('ab-engineering/evidence-flow');
  const [testBranchSha, setTestBranchSha] = useState('75e2561ba0ef08f29818e2fe56c85a970e363735');
  const [testMainSha, setTestMainSha] = useState('2063f241f459a6ffe85b1105a48d50e4c79ba196');
  const [branchEvaluation, setBranchEvaluation] = useState<BranchSafetyEvaluation | null>(null);

  // Schema & Tamper State
  const [schemaResult, setSchemaResult] = useState<SchemaValidationResult>(() => validateRegistrySchema(projects));
  const [tamperResult, setTamperResult] = useState<TamperCheckResult>(() => verifyTamperIntegrity(projects, auditLogs));
  const [isValidatingSchema, setIsValidatingSchema] = useState(false);

  // PowerShell script copy state
  const [copiedScript, setCopiedScript] = useState(false);

  // Rate limit status
  const rateStatus = getRateLimitStatus();

  // Run initial branch evaluation
  useEffect(() => {
    const evalResult = evaluateBranchSafety(testBranchName, testBranchRepo, testBranchSha, testMainSha);
    setBranchEvaluation(evalResult);
  }, []);

  // Handle Token Generation
  const handleGenerateToken = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const actor = `${currentUser.name} (${currentUser.role})`;
    const generated = generateApprovalToken(actor, selectedTokenAction);
    setTokens(getStoredApprovalTokens());
    setTokenInputToVerify(generated.token);

    onAddAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action: 'SECURITY_BLOCKED',
      details: `Godkjenningstoken generert: ${generated.token} for handling '${selectedTokenAction}'. Levetid 5 min.`,
      status: 'success'
    });

    onShowToast('Approval Token Utstedt', `Token ${generated.token} er nå gyldig i 5 minutter.`, 'success');
  };

  // Handle Token Verification
  const handleVerifyToken = () => {
    if (!tokenInputToVerify.trim()) return;
    const res = validateApprovalToken(tokenInputToVerify.trim(), selectedTokenAction);
    setTokenVerifyResult({
      checked: true,
      valid: res.isValid,
      msg: res.isValid ? 'Godkjenningstoken er GYLDIG og klar for utførelse.' : res.reason
    });
  };

  // Handle Create Snapshot
  const handleCreateSnapshot = () => {
    const label = newSnapshotLabel.trim() || `Manuell Sikkerhetskopi (#${snapshots.length + 1})`;
    const actor = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Lead Engineer';
    const snap = createSnapshotBackup(projects, label, 'Manuell opprettelse fra Sikkerhetssenter', actor);
    setSnapshots(getStoredSnapshots());
    setNewSnapshotLabel('');

    onAddAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action: 'REGISTRY_UPDATED',
      details: `Nytt sikkerhets-snapshot opprettet: '${label}' med SHA-256 ${snap.sha256Hash.substring(0, 12)}...`,
      status: 'success'
    });

    onShowToast('Snapshot Opprettet', `Sikkerhetskopi '${label}' er lagret med SHA-256 signatur.`, 'success');
  };

  // Handle Restore Snapshot
  const handleRestoreSnapshot = (snapId: string) => {
    const res = restoreSnapshotBackup(snapId);
    if (!res.success || !res.projects) {
      onShowToast('Gjenoppretting Feilet', res.error || 'Ugyldig snapshot', 'alert');
      return;
    }

    onRestoreProjects(res.projects);
    const snap = snapshots.find(s => s.id === snapId);

    onAddAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Security Auditor',
      action: 'REGISTRY_UPDATED',
      details: `Tilbakerulling utført: Register gjenopprettet fra snapshot '${snap?.label || snapId}'.`,
      status: 'success'
    });

    onShowToast('Tilbakerulling Fullført', `Register gjenopprettet til tilstand '${snap?.label}'.`, 'success');
  };

  // Handle Branch Test
  const handleRunBranchTest = () => {
    const res = evaluateBranchSafety(testBranchName, testBranchRepo, testBranchSha, testMainSha);
    setBranchEvaluation(res);
  };

  // Handle Re-Validate Schema
  const handleRevalidateSchema = () => {
    setIsValidatingSchema(true);
    setTimeout(() => {
      const sRes = validateRegistrySchema(projects);
      const tRes = verifyTamperIntegrity(projects, auditLogs);
      setSchemaResult(sRes);
      setTamperResult(tRes);
      setIsValidatingSchema(false);
      onShowToast(
        sRes.isValid ? 'Skjema & Integritet Godkjent' : 'Skjemaavvik Oppdaget',
        `Validerte ${projects.length} prosjekter. SHA-256 fingerprint intakt.`,
        sRes.isValid ? 'success' : 'alert'
      );
    }, 400);
  };

  // Copy Script
  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatePowerShellSecurityScript());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
    onShowToast('Script Kopiert', 'CodeSentinel-SecurityLayer.ps1 er kopiert til utklippstavlen.', 'success');
  };

  // Handle Restore From Quarantine Vault
  const handleRestoreFromVault = (vaultId: string) => {
    const actor = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Lead Engineer';
    const res = restoreFromQuarantineVault(vaultId, projects, actor);
    if (!res.success) {
      onShowToast('Gjenoppretting Feilet', res.error || 'Feil ved gjenoppretting', 'alert');
      return;
    }

    if (res.updatedProjects) {
      onRestoreProjects(res.updatedProjects);
    }
    setVaultEntries(getQuarantineVaultEntries());

    onAddAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action: 'SECURITY_BLOCKED',
      details: `Gjenopprettet element '${res.restoredEntry?.itemName}' (${res.restoredEntry?.itemType}) fra Sikkerhetslageret/Karantenehvelv.`,
      status: 'success'
    });

    onShowToast('Gjenopprettet fra Sikkerhetslager', `'${res.restoredEntry?.itemName}' er trygt gjenopprettet!`, 'success');
  };

  // Handle Export Recovery Logfile
  const handleExportVaultLog = () => {
    const { filename, jsonContent } = exportVaultRecoveryLogfile();
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onShowToast('Loggfil Lastet Ned', `${filename} er lastet ned for manuell revisjon eller beredskap.`, 'info');
  };

  // Handle Copy Vault Restore Script
  const handleCopyVaultRestoreScript = (entry: QuarantineVaultEntry) => {
    const script = generatePowerShellRestoreScript(entry);
    navigator.clipboard.writeText(script);
    onShowToast('Gjenopprettingsskript Kopiert', `PowerShell-skript for ${entry.itemName} er kopiert til utklippstavlen.`, 'success');
  };

  // Handle Run Guard Evaluation
  const handleRunGuardEvaluation = () => {
    const result = evaluateRepoSafetyGuard(guardTestRepo.trim(), guardTestTarget.trim(), guardTestType);
    setGuardEvaluation(result);
  };

  const isLeadEngineer = currentUser?.role === 'lead_engineer';

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Top Security Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  CodeSentinel Sikkerhetslag v1.2
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                    12/12 SØYLER AKTIVE
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Zero-Trust sannhetsbarriere mellom GitHub, verifikasjonsmotoren og den offentlige portfolioen.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-cyan-400" />
                Skrive-Isolasjon
              </div>
              <div className="text-sm font-bold text-slate-200 mt-1 font-mono">
                {settings.securityMode === 'write_guarded' ? 'Write-Guarded' : 'Verify-Only'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                Standard Modus
              </div>
              <div className="text-sm font-bold text-emerald-400 mt-1 font-mono">
                DryRun = TRUE
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Archive className="w-3 h-3 text-amber-400" />
                Sikkerhetslager
              </div>
              <div className="text-sm font-bold text-amber-300 mt-1 font-mono">
                {vaultEntries.length} i hvelv
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <History className="w-3 h-3 text-indigo-400" />
                Snapshots
              </div>
              <div className="text-sm font-bold text-indigo-300 mt-1 font-mono">
                {snapshots.length} lagret
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Activity className="w-3 h-3 text-cyan-400" />
                API Kvote
              </div>
              <div className="text-sm font-bold text-cyan-300 mt-1 font-mono">
                {rateStatus.remaining}/5000
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveSecTab('pillars')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSecTab === 'pillars'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Layers className="w-4 h-4" />
          12 Sikkerhetssøyler
        </button>

        <button
          onClick={() => setActiveSecTab('vault')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSecTab === 'vault'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Archive className="w-4 h-4 text-amber-400" />
          Sikkerhetslager / Karantene ({vaultEntries.length})
        </button>

        <button
          onClick={() => setActiveSecTab('safety_guard')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSecTab === 'safety_guard'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          Anti-Hack & Scope-Vakt
        </button>

        <button
          onClick={() => setActiveSecTab('tokens')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSecTab === 'tokens'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Approval Tokens
        </button>

        <button
          onClick={() => setActiveSecTab('branch_rules')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSecTab === 'branch_rules'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          8 GitHub Sikkerhetsregler
        </button>

        <button
          onClick={() => setActiveSecTab('snapshots')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSecTab === 'snapshots'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <History className="w-4 h-4" />
          Snapshots & Rollback ({snapshots.length})
        </button>

        <button
          onClick={() => setActiveSecTab('schema')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSecTab === 'schema'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Skjema & Integritet
        </button>

        <button
          onClick={() => setActiveSecTab('script')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSecTab === 'script'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Terminal className="w-4 h-4" />
          PowerShell CLI Script
        </button>
      </div>

      {/* TAB 1: 12 PILLARS OVERVIEW */}
      {activeSecTab === 'pillars' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                De 12 Sikkerhetssøylene i CodeSentinel
              </h2>
              <p className="text-xs text-slate-400">
                Hver søyle representerer et uavhengig beskyttelseslag som forhindrer feil, misbruk og uforutsette situasjoner.
              </p>
            </div>
            <button
              onClick={handleRevalidateSchema}
              disabled={isValidatingSchema}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isValidatingSchema ? 'animate-spin' : 'text-cyan-400'}`} />
              Verifiser Alle Søyler
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY_PILLARS.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-cyan-400 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
                      Søyle #{p.pillarNumber}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {p.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 text-[11px]">
                  <div className="text-slate-400 font-semibold font-mono flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    Teknisk Mekanisme:
                  </div>
                  <div className="text-slate-300 font-mono leading-tight">{p.technicalMechanism}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: QUARANTINE VAULT & RECOVERY LOG */}
      {activeSecTab === 'vault' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Archive className="w-5 h-5 text-amber-400" />
                  Sikkerhetslager & Karantenehvelv (Zero-Data-Loss Architecture)
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Garanterer at ingen handling sletter filer, branches eller prosjekter permanent. Alt som fjernes lagres med kryptografisk SHA-256 integritet og kan umiddelbart rulles tilbake.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportVaultLog}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Last ned Gjenopprettingslogg (.json)</span>
                </button>
              </div>
            </div>

            {/* Quick Vault Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Elementer i Karantene</div>
                <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                  {vaultEntries.filter(v => v.status === 'quarantined').length} aktive
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Gjenopprettede Elementer</div>
                <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
                  {vaultEntries.filter(v => v.status === 'restored').length} gjenopprettet
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Integritets-Beskyttelse</div>
                <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  SHA-256 Signert
                </div>
              </div>
            </div>
          </div>

          {/* Vault Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Element / Type</th>
                    <th className="p-4">Kilde / Repository</th>
                    <th className="p-4">Slettet Dato / Aktør</th>
                    <th className="p-4">SHA-256 Signatur</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Handling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {vaultEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                        Sikkerhetslageret er tomt. Ingen elementer har blitt slettet.
                      </td>
                    </tr>
                  ) : (
                    vaultEntries.map((entry) => {
                      const isQuarantined = entry.status === 'quarantined';
                      return (
                        <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-sans font-bold text-slate-100">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                entry.itemType === 'project_registry' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' :
                                entry.itemType === 'git_branch' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                                'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              }`}>
                                {entry.itemType.replace('_', ' ')}
                              </span>
                              <span>{entry.itemName}</span>
                            </div>
                            <div className="text-[11px] font-sans font-normal text-slate-400 mt-1 line-clamp-1">
                              Årsak: {entry.deletionReason}
                            </div>
                          </td>

                          <td className="p-4 text-cyan-400 font-mono">
                            {entry.sourceRepo || 'ab-engineering/core'}
                          </td>

                          <td className="p-4 font-sans">
                            <div className="text-slate-200 text-[11px]">
                              {new Date(entry.deletedAt).toLocaleString('no-NO')}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Av: {entry.deletedBy}
                            </div>
                          </td>

                          <td className="p-4 font-mono text-[10px] text-slate-400" title={entry.sha256Signature}>
                            {entry.sha256Signature.substring(0, 16)}...
                          </td>

                          <td className="p-4 font-sans">
                            {isQuarantined ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                <Archive className="w-3 h-3" />
                                I Karantenehvelv
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                Gjenopprettet ({new Date(entry.restoredAt || '').toLocaleDateString('no-NO')})
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right font-sans">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedVaultEntry(entry)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700"
                                title="Se detaljert snapshot & recovery script"
                              >
                                Inspiser
                              </button>

                              {isQuarantined && isLeadEngineer && (
                                <button
                                  onClick={() => handleRestoreFromVault(entry.id)}
                                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm"
                                  title="Gjenopprett elementet øyeblikkelig"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Gjenopprett Nå</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal for selected vault entry */}
          {selectedVaultEntry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <Archive className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">
                        Karantene: {selectedVaultEntry.itemName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        ID: {selectedVaultEntry.id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVaultEntry(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 text-xs font-bold"
                  >
                    Lukk
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Type & Sikkerhetsnivå</span>
                      <span className="font-bold text-slate-200 uppercase">{selectedVaultEntry.itemType} ({selectedVaultEntry.metadata.protectionLevel})</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Kilde Repository</span>
                      <span className="font-mono font-bold text-cyan-300">{selectedVaultEntry.sourceRepo}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px] mb-1">Gjenopprettings-kommando (PowerShell / Git)</span>
                    <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-amber-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                      <span>{selectedVaultEntry.metadata.recoveryCommand || 'CodeSentinel.Restore()'}</span>
                      <button
                        onClick={() => handleCopyVaultRestoreScript(selectedVaultEntry)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] rounded border border-slate-700 shrink-0 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3 text-cyan-400" />
                        <span>Kopier CLI-skript</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1 font-semibold">Integritets-Fingerprint (SHA-256)</span>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-400 break-all text-[11px]">
                      {selectedVaultEntry.sha256Signature}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1 font-semibold">Fullstendig Data-Payload</span>
                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 max-h-60 overflow-y-auto leading-relaxed">
                      {JSON.stringify(selectedVaultEntry.originalPayload, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Slettet: {new Date(selectedVaultEntry.deletedAt).toLocaleString('no-NO')} av {selectedVaultEntry.deletedBy}
                  </span>

                  {selectedVaultEntry.status === 'quarantined' && isLeadEngineer && (
                    <button
                      onClick={() => {
                        handleRestoreFromVault(selectedVaultEntry.id);
                        setSelectedVaultEntry(null);
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-950"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Gjenopprett Element Nå</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REPO SCOPE-GUARD & ANTI-HACK SHIELD */}
      {activeSecTab === 'safety_guard' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
                CodeSentinel Anti-Hack & Scope-Grensevakt
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Denne forsvarsmekanismen sikrer at verktøyet aldri kan berøre, slette eller overskrive feil filer, grener eller eksterne repositories (hverken i din egen GitHub eller i andres kontoer).
              </p>
            </div>

            {/* 5-layer Defensive Wall Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <Lock className="w-4 h-4" />
                  1. Whitelist Scope Wall
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Kun godkjente repositories i organisasjonen (<code className="text-cyan-300 font-mono">ab-engineering/*</code>) tillates for skriveoperasjoner. Eksterne brukernavn og tredjeparts-repos blokkeres hardkodet.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <GitBranch className="w-4 h-4" />
                  2. Kjerne- og Grenbeskytter
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Grener som <code className="text-cyan-300 font-mono">main</code>, <code className="text-cyan-300 font-mono">master</code>, og kritiske CI-filer i <code className="text-cyan-300 font-mono">.github/workflows</code> kan aldri slettes under noen omstendigheter.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Archive className="w-4 h-4" />
                  3. Karantenehvelv & Angreknapp
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Selv ved godkjente saneringer tas det alltid et uforanderlig SHA-256 snapshot med fullstendig gjenopprettingslogg før filen eller branchen fjernes.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Live Scope & Anti-Hack Tester */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Interaktiv Simulator: Test Operasjonssikkerhet mot GitHub Repositories
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Prøv å angi ulike repositories, eksterne kontoer eller kritiske grener for å se hvordan CodeSentinel-beskyttelsen reagerer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Mål Repository (GitHub)</label>
                <input
                  type="text"
                  value={guardTestRepo}
                  onChange={(e) => setGuardTestRepo(e.target.value)}
                  placeholder="f.eks. ab-engineering/evidence-flow eller other-user/secret-repo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Handlingstype</label>
                <select
                  value={guardTestType}
                  onChange={(e) => setGuardTestType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="branch">Branch (Gren)</option>
                  <option value="file">Fil (.github, kode osv)</option>
                  <option value="repo">Hele Repositoriet</option>
                  <option value="project">Prosjektregister</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Målnavn / Sti</label>
                <input
                  type="text"
                  value={guardTestTarget}
                  onChange={(e) => setGuardTestTarget(e.target.value)}
                  placeholder="f.eks. main, .github/workflows/ci.yml"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunGuardEvaluation}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Evaluer Sikkerhetsvern Nå</span>
              </button>

              <span className="text-xs text-slate-500 font-mono">
                Sjekker Whitelist • Blacklist • Branch Protection • Dag Ancestry
              </span>
            </div>

            {/* Evaluation Result Display */}
            {guardEvaluation && (
              <div className={`p-5 rounded-xl border text-xs space-y-4 ${
                guardEvaluation.canExecuteDeletion
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    {guardEvaluation.canExecuteDeletion ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-bold text-sm">
                      Sikkerhetsvurdering: {guardEvaluation.canExecuteDeletion ? 'HANDLING TILLATT MED KARANTENE' : 'HANDLING STRENGT BLOKKERT'}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                    guardEvaluation.canExecuteDeletion
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {guardEvaluation.isAllowedTarget ? 'ORGANISASJON WHITELIST' : 'IKKE-GODKJENT TARGET / SCOPE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Skrive-Whitelist:</span>
                    <span className={guardEvaluation.isAllowedTarget ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {guardEvaluation.isAllowedTarget ? 'JA (ab-engineering)' : 'NEI (Blokkert)'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Skrivebeskyttet / Sperret:</span>
                    <span className={guardEvaluation.isReadOnly || guardEvaluation.isBlockedAttribution ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {guardEvaluation.isReadOnly || guardEvaluation.isBlockedAttribution ? 'JA (Låst/Sperret)' : 'NEI (Åpen)'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Kjerne / Beskyttet Mål:</span>
                    <span className={!guardEvaluation.securityPillarChecks.coreBranchLockPassed || !guardEvaluation.securityPillarChecks.criticalFileLockPassed ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {!guardEvaluation.securityPillarChecks.coreBranchLockPassed || !guardEvaluation.securityPillarChecks.criticalFileLockPassed ? 'JA (Fredet)' : 'NEI'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Karantene-Påkrevd:</span>
                    <span className="text-amber-400 font-bold">
                      {guardEvaluation.canExecuteDeletion ? 'JA (Obligatorisk)' : 'IKKE RELEVANT'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-semibold text-[11px]">Detaljert Begrunnelse fra Sikkerhetslaget:</div>
                  <p className="text-slate-200 font-sans text-xs leading-relaxed">
                    {guardEvaluation.blockedReason || 'Målet tilhører autorisert organisasjon, er ikke en beskyttet kjernefil/hovedgren, og vil bli automatisk sikret i Sikkerhetslageret ved utførelse.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: APPROVAL TOKENS & WRITE-ISOLATION */}
      {activeSecTab === 'tokens' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                Pillar 1 & 8: Skrive-Isolasjon & Approval Token Generator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                For å forhindre utilsiktede slettinger eller endringer under automatiserte kjøringer, krever enhver skriveoperasjon (som branch-sanering eller registerendring) et tidsbegrenset engangs-godkjenningstoken.
              </p>
            </div>

            {/* Generator Card */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-300">Velg Målhandling for Token:</div>
                  <div className="text-[11px] text-slate-500">Tokenet blir bundet til denne spesifikke handlingen og utløper etter 5 minutter.</div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTokenAction}
                    onChange={(e) => setSelectedTokenAction(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="BRANCH_PRUNE_MERGED">Git: Slett Merged/Duplikat Brancher</option>
                    <option value="REGISTRY_FORCE_WRITE">Register: Live Overstyring</option>
                    <option value="PORTFOLIO_SYNC_LIVE">Portfolio: Full Automatisk Synkronisering</option>
                    <option value="SECURITY_POLICY_OVERRIDE">Sikkerhet: Midlertidig Unntak</option>
                  </select>

                  <button
                    onClick={handleGenerateToken}
                    className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-cyan-950 flex items-center gap-1.5 shrink-0"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Generer Token
                  </button>
                </div>
              </div>

              {/* Verify Test Area */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Lim inn token for validering (CS-AUTH-...)"
                    value={tokenInputToVerify}
                    onChange={(e) => setTokenInputToVerify(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={handleVerifyToken}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  Valider Token
                </button>

                {tokenVerifyResult?.checked && (
                  <div className={`text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                    tokenVerifyResult.valid
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}>
                    {tokenVerifyResult.valid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {tokenVerifyResult.msg}
                  </div>
                )}
              </div>
            </div>

            {/* Active Tokens List */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300">Nylig Utstedte Tokens ({tokens.length}):</div>
              {tokens.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 text-center text-xs text-slate-500">
                  Ingen aktive approval tokens. Generer et token ovenfor for å aktivere skrivemodus.
                </div>
              ) : (
                <div className="space-y-2">
                  {tokens.slice(0, 5).map((t, idx) => {
                    const isExpired = new Date() > new Date(t.expiresAt);
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold">{t.token}</span>
                          <span className="text-slate-400">({t.action})</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-slate-500">Utstedt av: {t.issuedBy}</span>
                          <span className={`px-2 py-0.5 rounded ${
                            t.isUsed ? 'bg-slate-800 text-slate-400' : isExpired ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {t.isUsed ? 'BRUKT' : isExpired ? 'UTLØPT' : 'GYLDIG (5 MIN)'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 8 GITHUB SAFETY RULES */}
      {activeSecTab === 'branch_rules' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                Pillar 3: De 8 Kritiske GitHub Sikkerhetsreglene for Branch-Sanering
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Før en branch tillates slettet, evaluerer CodeSentinel disse 8 reglene for å garantere at ingen data, PRs eller deployments går tapt.
              </p>
            </div>

            {/* Test Simulation Controls */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="text-xs font-bold text-slate-200">Interaktiv Sikkerhetstester for Brancher:</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Branch Navn</label>
                  <input
                    type="text"
                    value={testBranchName}
                    onChange={(e) => setTestBranchName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Repository</label>
                  <input
                    type="text"
                    value={testBranchRepo}
                    onChange={(e) => setTestBranchRepo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Branch SHA</label>
                  <input
                    type="text"
                    value={testBranchSha}
                    onChange={(e) => setTestBranchSha(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Main Branch SHA</label>
                  <input
                    type="text"
                    value={testMainSha}
                    onChange={(e) => setTestMainSha(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    // Match main sha to simulate safe ancestor
                    setTestBranchSha(testMainSha);
                    setTestBranchName('cleanup/merged-fix');
                  }}
                  className="text-xs text-cyan-400 hover:underline font-mono"
                >
                  [Sett Branch SHA = Main SHA for å simulere godkjent sletting]
                </button>

                <button
                  onClick={handleRunBranchTest}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <PlayIcon className="w-3.5 h-3.5" />
                  Kjør 8-Punkts Sjekk
                </button>
              </div>
            </div>

            {/* Evaluation Results */}
            {branchEvaluation && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  branchEvaluation.isSafeToDelete
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {branchEvaluation.isSafeToDelete ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-400" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {branchEvaluation.isSafeToDelete
                          ? 'GODKJENT FOR SANERING: Alle 8 sikkerhetsregler er bestått.'
                          : 'BLOKKERT FRA SANERING: Sikkerhetsfeil oppdaget.'}
                      </div>
                      <div className="text-xs opacity-80 font-mono mt-0.5">
                        Branch: {branchEvaluation.branchName} • SHA: {branchEvaluation.branchSha.substring(0, 10)}...
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                    branchEvaluation.isSafeToDelete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {branchEvaluation.isSafeToDelete ? 'SAFE_TO_PRUNE' : 'PROTECTED'}
                  </span>
                </div>

                {/* 8 Rules Detailed List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {Object.entries(branchEvaluation.rules).map(([ruleKey, val], idx) => (
                    <div
                      key={ruleKey}
                      className={`p-3.5 rounded-xl border ${
                        val.passed
                          ? 'bg-slate-950/80 border-slate-800'
                          : 'bg-rose-950/20 border-rose-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          {val.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                          )}
                          Regel #{idx + 1}: {getFriendlyRuleName(ruleKey)}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          val.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {val.passed ? 'PASSED' : 'BLOCKED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono leading-relaxed pl-5.5">
                        {val.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SNAPSHOTS & ROLLBACK */}
      {activeSecTab === 'snapshots' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  Pillar 5: Automatisert Snapshot & 1-Klikks Rollback
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Hver endring i registeret eller portfolioen lagres med SHA-256 sjekksum. Du kan når som helst rulle tilbake til en tidligere tilstand.
                </p>
              </div>

              {/* Create Snapshot Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Etikett (valgfritt)..."
                  value={newSnapshotLabel}
                  onChange={(e) => setNewSnapshotLabel(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleCreateSnapshot}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <History className="w-3.5 h-3.5" />
                  Opprett Snapshot
                </button>
              </div>
            </div>

            {/* Snapshots Table */}
            <div className="space-y-3">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-sm">{snap.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {snap.projectCount} prosjekter
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-3">
                      <span>Tidspunkt: {new Date(snap.timestamp).toLocaleString('no-NO')}</span>
                      <span>•</span>
                      <span>Aktør: {snap.actor}</span>
                    </div>
                    <div className="text-cyan-400 font-mono text-[10px] truncate max-w-md">
                      SHA-256: {snap.sha256Hash}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRestoreSnapshot(snap.id)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 font-semibold text-xs border border-slate-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                      Rull Tilbake Til Dette
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCHEMA VALIDATION & INTEGRITY */}
      {activeSecTab === 'schema' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-cyan-400" />
                  Pillar 7 & 10: JSON-Schema Validering & Anti-Tamper Integritet
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Kontrollerer at prosjektregisteret samsvarer med den formelle JSON-strukturen og at ingen filer er modifisert uautorisert.
                </p>
              </div>

              <button
                onClick={handleRevalidateSchema}
                disabled={isValidatingSchema}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-950"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isValidatingSchema ? 'animate-spin' : ''}`} />
                Kjør Skjemavalidering
              </button>
            </div>

            {/* Validation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Schema Status:</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    schemaResult.isValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {schemaResult.isValid ? 'VALID' : 'INVALID'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-mono space-y-1">
                  <div>Validerte objekter: {schemaResult.checkedCount} prosjekter</div>
                  <div>Sist sjekket: {new Date(schemaResult.timestamp).toLocaleTimeString()}</div>
                  <div>Kritiske feil: {schemaResult.errors.filter(e => e.severity === 'critical').length}</div>
                </div>

                {schemaResult.errors.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800 text-[11px] text-rose-300 font-mono space-y-1">
                    {schemaResult.errors.map((err, i) => (
                      <div key={i}>• {err.path}: {err.message}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Tamper-Detection Fingerprint:</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    !tamperResult.isCompromised ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {!tamperResult.isCompromised ? 'UNCOMPROMISED' : 'COMPROMISED'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-mono space-y-1">
                  <div className="truncate">Registry SHA-256: {tamperResult.registryHash}</div>
                  <div className="truncate">Policy SHA-256: {tamperResult.policyHash}</div>
                  <div>Revisjonskjede: {tamperResult.auditChainValid ? 'Intakt & Uforanderlig' : 'Avvik'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: POWERSHELL SCRIPT */}
      {activeSecTab === 'script' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  CodeSentinel-SecurityLayer.ps1 (Produksjonsklar CLI)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Kjør dette scriptet lokalt på Windows PowerShell eller i GitHub Actions for å automatisere sannhetstesting med alle 12 sikkerhetslag.
                </p>
              </div>

              <button
                onClick={handleCopyScript}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copiedScript ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                {copiedScript ? 'Kopiert!' : 'Kopier Script'}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-96">
              {generatePowerShellSecurityScript()}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function getFriendlyRuleName(ruleKey: string): string {
  const map: Record<string, string> = {
    rule1_noOpenPRs: 'Ingen åpne Pull Requests',
    rule2_isAncestorOfMain: 'Commits er forfedre av main (merge-base)',
    rule3_notNewerThanMain: 'Commits ikke nyere enn main',
    rule4_noGitTags: 'Ingen Git-tags tilknyttet',
    rule5_noReleasesAttached: 'Ingen GitHub Releases tilknyttet',
    rule6_noActiveWorkflows: 'Ingen aktive CI/CD workflows',
    rule7_noActiveEnvironments: 'Ingen aktive deployment-miljøer',
    rule8_noRecentDeployHistory: 'Ingen fersk deploy-historikk (<90d)'
  };
  return map[ruleKey] || ruleKey;
}
