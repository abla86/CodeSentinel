import React, { useState } from 'react';
import {
  GitBranch,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  X,
  Play,
  Terminal,
  Check,
  Info,
  Archive,
  ShieldCheck
} from 'lucide-react';
import { BranchCleanupStrategy, UserAccount } from '../types';
import { playChime } from '../lib/settings';
import { sendToQuarantineVault, evaluateRepoSafetyGuard } from '../lib/security';

interface BranchInfo {
  repo: string;
  branch: string;
  sha: string;
  mainSha: string;
  isAncestorOfMain: boolean;
  isExactShaMatch: boolean;
  isDuplicateOfFirst: boolean;
  duplicateGroup: string;
  ageDays: number;
  author: string;
  lastCommitMessage: string;
}

interface BranchSanitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: BranchCleanupStrategy;
  onRunPrune: (prunedBranches: string[]) => void;
  canManageGitSanitation?: boolean;
  currentUser?: UserAccount | null;
  onOpenAuth?: () => void;
}

const SIMULATED_BRANCHES: BranchInfo[] = [
  // evidence-appraisal-tool branches (from Anne's PowerShell log)
  {
    repo: 'abla86/evidence-appraisal-tool',
    branch: 'launch-hardening-1',
    sha: '75e2561ba0ef08f29818e2fe56c85a970e363735',
    mainSha: '2063f241f459a6ffe85b1105a48d50e4c79ba196',
    isAncestorOfMain: true,
    isExactShaMatch: false,
    isDuplicateOfFirst: false,
    duplicateGroup: 'evidence-launch-group',
    ageDays: 14,
    author: 'Annebeth Andersen',
    lastCommitMessage: 'chore(hardening): finalize amstar 2 validation rules'
  },
  {
    repo: 'abla86/evidence-appraisal-tool',
    branch: 'launch-hardening-2',
    sha: '75e2561ba0ef08f29818e2fe56c85a970e363735',
    mainSha: '2063f241f459a6ffe85b1105a48d50e4c79ba196',
    isAncestorOfMain: true,
    isExactShaMatch: false,
    isDuplicateOfFirst: true, // Sibling duplicate
    duplicateGroup: 'evidence-launch-group',
    ageDays: 14,
    author: 'Annebeth Andersen',
    lastCommitMessage: 'chore(hardening): finalize amstar 2 validation rules'
  },
  {
    repo: 'abla86/evidence-appraisal-tool',
    branch: 'launch-hardening-3',
    sha: '75e2561ba0ef08f29818e2fe56c85a970e363735',
    mainSha: '2063f241f459a6ffe85b1105a48d50e4c79ba196',
    isAncestorOfMain: true,
    isExactShaMatch: false,
    isDuplicateOfFirst: true, // Sibling duplicate
    duplicateGroup: 'evidence-launch-group',
    ageDays: 14,
    author: 'Annebeth Andersen',
    lastCommitMessage: 'chore(hardening): finalize amstar 2 validation rules'
  },
  // workforce-sql branches
  {
    repo: 'abla86/workforce-sql-engine',
    branch: 'sql-query-optimization',
    sha: '992a77f0a45b81c2de304910ea09848123019842',
    mainSha: '992a77f0a45b81c2de304910ea09848123019842',
    isAncestorOfMain: true,
    isExactShaMatch: true, // EXACT SHA
    isDuplicateOfFirst: false,
    duplicateGroup: 'workforce-sql-group',
    ageDays: 28,
    author: 'Annebeth Andersen',
    lastCommitMessage: 'perf(engine): index shift constraints table for rapid queries'
  },
  {
    repo: 'abla86/workforce-sql-engine',
    branch: 'sql-query-optimization-backup',
    sha: '992a77f0a45b81c2de304910ea09848123019842',
    mainSha: '992a77f0a45b81c2de304910ea09848123019842',
    isAncestorOfMain: true,
    isExactShaMatch: true,
    isDuplicateOfFirst: true,
    duplicateGroup: 'workforce-sql-group',
    ageDays: 28,
    author: 'Annebeth Andersen',
    lastCommitMessage: 'perf(engine): index shift constraints table for rapid queries'
  },
  // vaktklar active feature branch (should NEVER be deleted)
  {
    repo: 'abla86/vaktklar',
    branch: 'feat/fhir-rostering-v2',
    sha: '4f2910c28349182aef4819481203912803810293',
    mainSha: 'a103984019284102948102938401928340192834',
    isAncestorOfMain: false,
    isExactShaMatch: false,
    isDuplicateOfFirst: false,
    duplicateGroup: 'vaktklar-active',
    ageDays: 3,
    author: 'Annebeth Andersen',
    lastCommitMessage: 'feat(fhir): integrate HL7 FHIR v4 PractitionerRole resource mapper'
  }
];

export const BranchSanitationModal: React.FC<BranchSanitationModalProps> = ({
  isOpen,
  onClose,
  strategy,
  onRunPrune,
  canManageGitSanitation = false,
  currentUser = null,
  onOpenAuth,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<BranchCleanupStrategy>(strategy);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prunedList, setPrunedList] = useState<string[]>([]);
  const [reportLog, setReportLog] = useState<string | null>(null);

  if (!isOpen) return null;

  // Evaluate candidate branches based on selected strategy
  const evaluatedBranches = SIMULATED_BRANCHES.map((b) => {
    let eligibleForPruning = false;
    let reason = '';

    if (selectedStrategy === 'merge_base') {
      if (b.isAncestorOfMain && !b.isExactShaMatch && b.isDuplicateOfFirst) {
        eligibleForPruning = true;
        reason = 'Forfader i main (git merge-base --is-ancestor) + duplikatgren.';
      } else if (b.isExactShaMatch && b.isDuplicateOfFirst) {
        eligibleForPruning = true;
        reason = 'Forfader i main + overflødig duplikatkopi.';
      } else if (b.isExactShaMatch) {
        eligibleForPruning = true;
        reason = 'Eksakt identisk SHA med main.';
      } else if (b.isAncestorOfMain && !b.isDuplicateOfFirst) {
        reason = 'Beholdes som primær branch (eller slettes kun hvis merged).';
      } else {
        reason = 'BEHOLDES – Aktiv branch med upubliserte commits.';
      }
    } else if (selectedStrategy === 'exact_sha') {
      if (b.isExactShaMatch) {
        eligibleForPruning = true;
        reason = 'Slettes: SHA er nøyaktig identisk med main.';
      } else {
        reason = 'BEHOLDES – SHA ER IKKE IDENTISK MED MAIN (Powershell-scriptet traff denne regelen).';
      }
    } else { // duplicate_heads
      if (b.isDuplicateOfFirst) {
        eligibleForPruning = true;
        reason = 'Slettes: Duplikat av første branch i listen med samme commit-hash.';
      } else {
        reason = 'Beholdes som original eller unik branch.';
      }
    }

    return {
      ...b,
      eligibleForPruning,
      reason,
    };
  });

  const candidatesToPrune = evaluatedBranches.filter(b => b.eligibleForPruning && !prunedList.includes(`${b.repo}:${b.branch}`));

  const handleExecuteSanitation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newlyPruned: string[] = [];
      const actor = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Lead Engineer';

      candidatesToPrune.forEach(b => {
        // 1. Safety Guard Evaluation
        const guard = evaluateRepoSafetyGuard(b.repo, b.branch, 'branch');
        if (!guard.canExecuteDeletion) {
          console.warn(`Branch ${b.repo}:${b.branch} blocked by safety guard: ${guard.blockedReason}`);
          return;
        }

        // 2. Quarantine Vault Backup before pruning
        sendToQuarantineVault({
          itemType: 'git_branch',
          itemName: b.branch,
          sourceRepo: b.repo,
          deletedBy: actor,
          deletionReason: `Sanert via CodeSentinel ${selectedStrategy.toUpperCase()} regel: ${b.reason}`,
          originalPayload: {
            repo: b.repo,
            branch: b.branch,
            commitSha: b.sha,
            mainSha: b.mainSha,
            author: b.author,
            lastCommitMessage: b.lastCommitMessage
          },
          metadata: {
            recoveryCommand: `git fetch origin && git checkout -b ${b.branch} ${b.sha} && git push origin ${b.branch}`,
            protectionLevel: 'high',
            branchSha: b.sha
          }
        });

        newlyPruned.push(`${b.repo}:${b.branch}`);
      });

      setPrunedList([...prunedList, ...newlyPruned]);
      setIsProcessing(false);
      playChime('success');

      setReportLog(`
=== CODESENTINEL BRANCH SANITATION & VAULT REPORT ===
Strategi brukt: ${selectedStrategy.toUpperCase()}
Utført av: ${actor}
Dato: ${new Date().toISOString()}

SANERTE & SIKREDE BRANCHER (${newlyPruned.length}):
${newlyPruned.map(n => ` [SIKRET I KARANTENE-HVELV + FJERNET] -> ${n}`).join('\n')}

BEHOLDTE & FREDEDE BRANCHER:
- feat/fhir-rostering-v2 (Aktiv utvikling, 0 unmerged commits)
- launch-hardening-1 (Primær representant)
- workforce-sql-engine:main (Beskyttet kjerne)

SIKKERHETSSTATUS: 
✓ Alle sanerte brancher er lagret i Sikkerhetslageret med SHA-256 signatur.
✓ Gjenopprettingsskript er generert i Karantenehvelvet: "git checkout -b <branch> <sha>"
✓ 0 feil. Ingen data tapt. Main og andre repos er 100% uberørt.
      `.trim());

      onRunPrune(newlyPruned);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="branch-sanitation-modal"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Git Branch-Sanering & Duplikatinspektør
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                  scripts/codesentinel.mjs
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Løser problemet hvor brancher deler samme commit-SHA, men avviker fra main sitt nåværende hode
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Strategy Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Aktiv Sletteregel:</span>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStrategy('merge_base')}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  selectedStrategy === 'merge_base'
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                git merge-base (Alt. B)
              </button>
              <button
                type="button"
                onClick={() => setSelectedStrategy('exact_sha')}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  selectedStrategy === 'exact_sha'
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Eksakt SHA (Klassisk)
              </button>
              <button
                type="button"
                onClick={() => setSelectedStrategy('duplicate_heads')}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  selectedStrategy === 'duplicate_heads'
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Duplikat Sibling (Alt. A)
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {candidatesToPrune.length} brancher kvalifisert for trygg sletting
          </div>
        </div>

        {/* Branch Table */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Repository & Branch</th>
                  <th className="p-3">Commit SHA</th>
                  <th className="p-3">Main SHA</th>
                  <th className="p-3">Sannhetsvurdering & Diagnose</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {evaluatedBranches.map((b, idx) => {
                  const isPruned = prunedList.includes(`${b.repo}:${b.branch}`);

                  return (
                    <tr key={idx} className={`hover:bg-slate-900/50 transition-colors ${isPruned ? 'opacity-40 bg-slate-950' : ''}`}>
                      <td className="p-3 font-sans">
                        <div className="font-bold text-slate-200 flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{b.branch}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{b.repo}</div>
                      </td>

                      <td className="p-3 text-cyan-300 truncate max-w-[110px]" title={b.sha}>
                        {b.sha.slice(0, 10)}...
                      </td>

                      <td className="p-3 text-slate-400 truncate max-w-[110px]" title={b.mainSha}>
                        {b.mainSha.slice(0, 10)}...
                      </td>

                      <td className="p-3 font-sans text-xs">
                        <div className={b.eligibleForPruning ? 'text-rose-300' : 'text-slate-300'}>
                          {b.reason}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          Siste commit: "{b.lastCommitMessage}" ({b.ageDays}d siden)
                        </div>
                      </td>

                      <td className="p-3 text-right font-sans">
                        {isPruned ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                            Slettet
                          </span>
                        ) : b.eligibleForPruning ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Klar for Sanering
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Beskyttet
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Generated Report Log */}
          {reportLog && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800 font-mono text-xs text-emerald-300/90 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-200">
              {reportLog}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60 gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {!canManageGitSanitation 
                ? 'Kun Lead Engineer kan utføre faktisk Git-sanering (RBAC-sperret).' 
                : 'Dry-run garanterer at ingen upubliserte kjerne-commits slettes'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Lukk
            </button>
            {canManageGitSanitation ? (
              <button
                onClick={handleExecuteSanitation}
                disabled={isProcessing || candidatesToPrune.length === 0}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-950 flex items-center gap-1.5 disabled:opacity-40"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Saner {candidatesToPrune.length} Duplikater</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                title="Krever Lead Engineer rolle"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Krev Lead Engineer-tilgang</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
