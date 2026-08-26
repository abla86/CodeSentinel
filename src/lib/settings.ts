import { AppSettings, AppTheme } from '../types';

export const SETTINGS_STORAGE_KEY = 'codesentinel_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  // Theme & Appearance
  theme: 'midnight',
  density: 'comfortable',
  codeFontBadges: true,
  enableAnimations: true,

  // CodeSentinel Verification Engine
  strictness: 'strict',
  autoSweepInterval: 'off',
  requireReadmeDoc: true,
  requirePackageJsonCheck: true,
  autoSyncDescriptionsFromReadme: false,
  enforceAttributionGuard: true, // CS-09 Locked

  // Git Sanitation & Branch Cleanup Rules
  branchCleanupStrategy: 'merge_base',
  staleBranchDays: 30,
  autoDryRunBranchPrune: true,

  // CodeSentinel Security Layer v1 (12 Pillars)
  securityMode: 'verify_only',
  dryRunEnforced: true, // Safety-first default
  requireApprovalTokensForWrite: true,
  tamperProtectionEnabled: true,
  rateLimitGuardEnabled: true,

  // Notifications & Alerts
  toastNotifications: true,
  attributionBreachAlert: true,
  flaggedDiscrepancyBadges: true,
  soundEffects: false,
  staleRepoAlertDays: 60,

  // GitHub & Live Remote Inspection
  githubPersonalAccessToken: '',
  githubTargetAccount: 'abla86',
  enableLiveUrlInspection: true,
  autonomousSelfWorkerEnabled: false,
  autonomousIntervalSeconds: 60,

  // Localization & Default View
  language: 'no',
  defaultView: 'portfolio',
};

export function getStoredSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    applyThemeToDocument(settings.theme);
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function applyThemeToDocument(theme: AppTheme): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  
  // Remove existing theme classes
  root.classList.remove('theme-midnight', 'theme-obsidian', 'theme-cyberpunk', 'theme-nordic', 'theme-light');
  root.classList.add(`theme-${theme}`);

  if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }
}

// Synthetic gentle audio chime using Web Audio API
export function playChime(type: 'success' | 'alert' | 'click' = 'success'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'alert') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // Audio might be blocked until user interacts, safe to ignore
  }
}
