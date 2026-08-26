import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { VerifiedPortfolioView } from './components/VerifiedPortfolioView';
import { CodeSentinelDashboard } from './components/CodeSentinelDashboard';
import { ProjectRegistryView } from './components/ProjectRegistryView';
import { AuditLogView } from './components/AuditLogView';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { BranchSanitationModal } from './components/BranchSanitationModal';
import { SecurityLayerDashboard } from './components/SecurityLayerDashboard';

import { RegistryProject, VerificationResult, SearchFilterOptions, UserAccount, AuditLogEntry, AppSettings } from './types';
import { INITIAL_REGISTRY_PROJECTS, INITIAL_AUDIT_LOGS } from './data/initialRegistry';
import { getCurrentUser, initializeAuthStorage } from './lib/auth';
import { runFullSentinelSweep, runCodeSentinelVerification, runAutonomousSentinelCycle } from './lib/sentinel';
import { getStoredSettings, saveStoredSettings, applyThemeToDocument, playChime } from './lib/settings';
import { CheckCircle2, ShieldAlert, Sparkles, X, Bell, Lock, ShieldCheck, Database, ArrowRight, UserCheck, KeyRound, AlertTriangle } from 'lucide-react';

const REGISTRY_STORAGE_KEY = 'codesentinel_registry_v1';
const AUDIT_LOGS_STORAGE_KEY = 'codesentinel_audit_v1';

export default function App() {
  // Settings & Preferences State
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'rbac' | 'architecture'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Active View Tab (Defaults from settings)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'sentinel' | 'registry' | 'audit' | 'security'>(() => {
    return settings.defaultView || 'portfolio';
  });

  // Toast Notification Message
  const [toastMessage, setToastMessage] = useState<{ id: string; title: string; text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  // Registry & Audit Data
  const [projects, setProjects] = useState<RegistryProject[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTRY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_REGISTRY_PROJECTS;
    } catch {
      return INITIAL_REGISTRY_PROJECTS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // Verification Results
  const [verificationResults, setVerificationResults] = useState<Record<string, VerificationResult>>({});
  const [isSweeping, setIsSweeping] = useState(false);

  // Detail Modal
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<RegistryProject | null>(null);

  // Search & Filters
  const [filters, setFilters] = useState<SearchFilterOptions>({
    query: '',
    tier: 'all',
    status: 'all',
    category: 'all',
  });

  // Apply theme & initial setup on mount
  useEffect(() => {
    applyThemeToDocument(settings.theme);

    initializeAuthStorage().then(() => {
      const user = getCurrentUser();
      setCurrentUser(user);
    });

    // Run initial sweep with settings
    const sweep = runFullSentinelSweep(projects, settings);
    setVerificationResults(sweep.results);
  }, []);

  // Update theme when settings change
  const handleSaveSettings = (updated: AppSettings) => {
    setSettings(updated);
    saveStoredSettings(updated);
    applyThemeToDocument(updated.theme);

    // Re-evaluate verification with new strictness/rules
    const sweep = runFullSentinelSweep(projects, updated);
    setVerificationResults(sweep.results);

    // Add Audit Log
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Systemadministrator',
      action: 'SETTINGS_CONFIGURED',
      details: `Innstillinger oppdatert: Tema=${updated.theme}, Strenghet=${updated.strictness}, Git-strategi=${updated.branchCleanupStrategy}.`,
      status: 'success',
    };
    const newLogs = [newLog, ...auditLogs];
    setAuditLogs(newLogs);
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(newLogs));

    if (updated.toastNotifications) {
      showToast('Innstillinger lagret', 'Preferanser og valideringsregler er oppdatert.', 'success');
    }
  };

  // Toast Helper
  const showToast = (title: string, text: string, type: 'success' | 'alert' | 'info' = 'success') => {
    if (!settings.toastNotifications && type !== 'alert') return;
    const id = `toast-${Date.now()}`;
    setToastMessage({ id, title, text, type });
    if (settings.soundEffects) {
      playChime(type === 'alert' ? 'alert' : 'success');
    }
    setTimeout(() => {
      setToastMessage((cur) => (cur?.id === id ? null : cur));
    }, 4500);
  };

  // Auto-sweep Interval Engine
  useEffect(() => {
    if (settings.autoSweepInterval === 'off') return;

    const intervalMap: Record<string, number> = {
      '30s': 30 * 1000,
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
    };

    const ms = intervalMap[settings.autoSweepInterval] || 60000;
    const interval = setInterval(() => {
      const sweep = runFullSentinelSweep(projects, settings);
      setVerificationResults(sweep.results);
    }, ms);

    return () => clearInterval(interval);
  }, [settings.autoSweepInterval, projects, settings]);

  // Save projects to localStorage whenever changed
  const handleSaveProjects = (updated: RegistryProject[]) => {
    setProjects(updated);
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(updated));

    // Re-run verification sweep with active settings
    const sweep = runFullSentinelSweep(updated, settings);
    setVerificationResults(sweep.results);

    // Add Audit Log
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Systembruker',
      action: 'REGISTRY_UPDATED',
      details: `Prosjektregisteret ble oppdatert. Totalt ${updated.length} prosjekter i registeret.`,
      status: 'success',
    };
    const newLogs = [newLog, ...auditLogs];
    setAuditLogs(newLogs);
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(newLogs));

    showToast('Register Oppdatert', `${updated.length} prosjekter synkronisert mot GitHub.`, 'success');
  };

  // Handle single project update from Auto-Repair or details
  const handleSingleProjectUpdate = (updatedProject: RegistryProject) => {
    const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    handleSaveProjects(updatedProjects);
    setSelectedProjectForDetail(updatedProject);
    showToast('Auto-Reparasjon Fullført', `Prosjekt "${updatedProject.name}" er reparert og verifisert.`, 'success');
  };

  // Run Sentinel Sweep with visual feedback
  const handleRunSweep = () => {
    setIsSweeping(true);
    setTimeout(() => {
      const sweep = runFullSentinelSweep(projects, settings);
      setVerificationResults(sweep.results);
      setIsSweeping(false);

      const newLog: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'CodeSentinel Automated Runner',
        action: 'VERIFICATION_SWEEP',
        details: `Sannhetstest fullført: ${sweep.totalVerified} verifisert, ${sweep.totalFlagged} flagget, ${sweep.totalBlocked} sperret (Attribusjonsvern). Gjennomsnittlig sannhetsscore: ${sweep.avgScore}%.`,
        status: 'success',
      };
      const newLogs = [newLog, ...auditLogs];
      setAuditLogs(newLogs);
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(newLogs));

      showToast(
        'Sannhetstest Fullført',
        `${sweep.totalVerified} prosjekter verifisert. Gjennomsnittlig score: ${sweep.avgScore}%.`,
        'success'
      );
    }, 600);
  };

  // Run Autonomous Sentinel Cycle (Sweep -> Diagnose -> Auto-repair -> Re-verify)
  const handleRunAutonomousCycle = async () => {
    setIsSweeping(true);
    showToast('Autonom Agent Startet', 'Analyserer GitHub-kilder og sanntids HTML-identitet...', 'info');

    try {
      const cycleResult = await runAutonomousSentinelCycle(
        projects,
        settings,
        settings.githubPersonalAccessToken
      );

      setProjects(cycleResult.updatedProjects);
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(cycleResult.updatedProjects));
      setVerificationResults(cycleResult.results);

      const newLogs = [...cycleResult.auditEntries, ...auditLogs];
      setAuditLogs(newLogs);
      localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(newLogs));

      showToast(
        'Autonom Syklus Fullført',
        cycleResult.summaryMessage,
        cycleResult.repairedCount > 0 ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast('Autonom Feil', err?.message || 'Kunne ikke fullføre autonom syklus', 'alert');
    } finally {
      setIsSweeping(false);
    }
  };

  // Branch Prune Action Callback
  const handleBranchPrune = (pruned: string[]) => {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'CodeSentinel Git Inspector',
      action: 'BRANCHES_SANITY_PRUNED',
      details: `Sanert ${pruned.length} duplikate brancher med strategi '${settings.branchCleanupStrategy}'.`,
      status: 'success',
    };
    const newLogs = [newLog, ...auditLogs];
    setAuditLogs(newLogs);
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(newLogs));

    showToast('Branch-Sanering Fullført', `${pruned.length} overflødige duplikatbrancher ble trygt ryddet.`, 'success');
  };

  // High-Speed Multi-field Fuzzy Search
  const filteredProjects = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    return projects.filter((p) => {
      // Tier filter
      if (filters.tier !== 'all' && p.tier !== filters.tier) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const res = verificationResults[p.id];
        const currentStatus = res?.overallStatus || p.status;
        if (currentStatus !== filters.status) return false;
      }

      // Category filter
      if (filters.category !== 'all' && p.category !== filters.category) {
        return false;
      }

      // Query filter across all key fields
      if (q) {
        const nameMatch = p.name.toLowerCase().includes(q);
        const descMatch = p.shortDescription.toLowerCase().includes(q);
        const repoMatch = p.githubRepo.toLowerCase().includes(q);
        const techMatch = p.claimedTechnologies.some(t => t.toLowerCase().includes(q));
        const featMatch = p.claimedFeatures.some(f => f.toLowerCase().includes(q));
        const audienceMatch = p.targetAudience.toLowerCase().includes(q);
        const categoryMatch = p.category.toLowerCase().includes(q);

        return nameMatch || descMatch || repoMatch || techMatch || featMatch || audienceMatch || categoryMatch;
      }

      return true;
    });
  }, [projects, filters, verificationResults]);

  const verifiedCount = Object.values(verificationResults).filter(r => r.overallStatus === 'verified').length;

  // Server-Authoritative RBAC Permissions
  const isSecurityAuthorized = currentUser?.role === 'lead_engineer' || currentUser?.role === 'security_auditor';
  const canEditRegistry = currentUser?.role === 'lead_engineer';
  const canRunSentinel = currentUser?.role === 'lead_engineer' || currentUser?.role === 'security_auditor';
  const canManageGitSanitation = currentUser?.role === 'lead_engineer';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-300">
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenBranchSanitation={() => setBranchModalOpen(true)}
        verifiedCount={verifiedCount}
        totalCount={projects.length}
        onTriggerSweep={handleRunSweep}
        isSweeping={isSweeping}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Universal Fast Search Bar (Always accessible) */}
        <div className="mb-8">
          <SearchBar
            filters={filters}
            onChange={setFilters}
            totalResults={filteredProjects.length}
            totalProjects={projects.length}
          />
        </div>

        {/* View Routing */}
        {activeTab === 'portfolio' && (
          <VerifiedPortfolioView
            projects={filteredProjects}
            verificationResults={verificationResults}
            onSelectProject={(proj) => setSelectedProjectForDetail(proj)}
            onOpenSentinel={() => setActiveTab('sentinel')}
          />
        )}

        {activeTab === 'sentinel' && (
          <CodeSentinelDashboard
            projects={filteredProjects}
            verificationResults={verificationResults}
            onRunSweep={handleRunSweep}
            onRunAutonomousCycle={handleRunAutonomousCycle}
            isSweeping={isSweeping}
            onSelectProject={(proj) => setSelectedProjectForDetail(proj)}
            canRunSentinel={canRunSentinel}
            onOpenAuth={() => {
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
            onAutoRepairProject={handleSingleProjectUpdate}
            settings={settings}
          />
        )}

        {activeTab === 'registry' && (
          <ProjectRegistryView
            projects={projects}
            onSaveProjects={handleSaveProjects}
            canEditRegistry={canEditRegistry}
            onOpenAuth={() => {
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogView logs={auditLogs} />
        )}

        {activeTab === 'security' && (
          isSecurityAuthorized ? (
            <SecurityLayerDashboard
              projects={projects}
              auditLogs={auditLogs}
              currentUser={currentUser}
              settings={settings}
              onUpdateSettings={handleSaveSettings}
              onRestoreProjects={handleSaveProjects}
              onAddAuditLog={(newLog) => {
                const newLogs = [newLog, ...auditLogs];
                setAuditLogs(newLogs);
                localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(newLogs));
              }}
              onShowToast={showToast}
              onOpenAuth={() => {
                setAuthMode('login');
                setAuthModalOpen(true);
              }}
            />
          ) : (
            <div id="security-rbac-access-gate" className="max-w-3xl mx-auto my-6 p-8 bg-slate-900/90 border border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Background ambient glow */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      RBAC TILGANGSSPERRE
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Kilde: Sikker Backend Database
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-100 mt-2 tracking-tight">
                    Sikkerhetslag Dashboard (12/12) Krever Autorisert Rolle
                  </h2>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Dette dashboardet inneholder sanntidskontroll over alle 12 kritiske integritetslag, minneintegritet, bypass-beskyttelse, append-only revisjonslogger og telemetri.
                  </p>

                  {/* Status Box */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Din Nåværende Sesjon:</span>
                      <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                        {currentUser ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>{currentUser.name}</span>
                            <span className="text-amber-400 font-mono text-[10px]">({currentUser.role})</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            <span className="text-slate-400">Ikke innlogget (Anonym Gjest)</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Påkrevd Autorisasjon:</span>
                      <div className="font-semibold text-cyan-300 mt-0.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Lead Engineer</span>
                        <span className="text-slate-400">eller</span>
                        <span className="text-amber-300">Auditor</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      id="rbac-login-cta-btn"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition-all"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Logg inn som Lead Engineer eller Revisor</span>
                    </button>

                    <button
                      id="rbac-matrix-cta-btn"
                      onClick={() => {
                        setAuthMode('rbac');
                        setAuthModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
                    >
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span>Se RBAC Matrise & Rolletildeling</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>CodeSentinel v2.4 Truth Engine</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('security')}
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Sikkerhetslag (12/12)
            </button>
            <span>•</span>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Innstillinger ({settings.theme})
            </button>
            <span>•</span>
            <button
              onClick={() => setBranchModalOpen(true)}
              className="text-slate-400 hover:text-cyan-300"
            >
              Git-Sanering
            </button>
          </div>
          <div>
            Sperre aktiv: <span className="text-rose-400 font-bold">cross-device-sdk</span> (#CS-09)
          </div>
        </div>
      </footer>

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 max-w-sm">
          <div className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md ${
            toastMessage.type === 'alert'
              ? 'bg-rose-950/90 border-rose-600 text-rose-100 shadow-rose-950/50'
              : 'bg-slate-900/95 border-cyan-500/50 text-slate-100 shadow-cyan-950/50'
          }`}>
            {toastMessage.type === 'alert' ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-bold text-slate-100">{toastMessage.title}</div>
              <div className="text-slate-300 text-[11px] mt-0.5">{toastMessage.text}</div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onRunImmediateSweep={handleRunSweep}
      />

      {/* Branch Sanitation Modal */}
      <BranchSanitationModal
        isOpen={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        strategy={settings.branchCleanupStrategy}
        onRunPrune={handleBranchPrune}
        canManageGitSanitation={canManageGitSanitation}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          // Add login audit log
          const newLog: AuditLogEntry = {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: user.name,
            action: 'USER_LOGIN',
            details: `Bruker ${user.name} logget inn med rollen ${user.role}.`,
            status: 'success',
          };
          const newLogs = [newLog, ...auditLogs];
          setAuditLogs(newLogs);
          localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(newLogs));
          showToast('Innlogging Vellykket', `Velkommen tilbake, ${user.name}!`, 'success');
        }}
      />

      {currentUser && (
        <UserProfileModal
          isOpen={profileModalOpen}
          user={currentUser}
          onClose={() => setProfileModalOpen(false)}
          onUserUpdated={(updated) => {
            setCurrentUser(updated);
            showToast('Profil Oppdatert', 'Endringene dine er lagret.', 'success');
          }}
          onLogout={() => {
            setCurrentUser(null);
            showToast('Logget Ut', 'Du er nå logget ut.', 'info');
          }}
        />
      )}

      <ProjectDetailModal
        project={selectedProjectForDetail}
        onClose={() => setSelectedProjectForDetail(null)}
        onUpdateProject={handleSingleProjectUpdate}
      />
    </div>
  );
}

