export type ProjectTier = 'tier-1' | 'tier-2' | 'tier-3';

export type VerificationStatus = 'verified' | 'flagged' | 'blocked_disallowed' | 'pending_verification';

export interface GitHubRepoFixture {
  repoName: string;
  owner: string;
  defaultBranch: string;
  lastCommitDate: string;
  stars: number;
  openIssues: number;
  license: string;
  readmeContent: string;
  packageJson?: {
    name: string;
    version: string;
    description: string;
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  detectedTechnologies: string[];
  documentedKeyFeatures: string[];
  deploymentUrl?: string;
  expectedHtmlTitle?: string;
  actualHtmlTitle?: string;
  ciRunId?: string;
  ciCommitSha?: string;
  ciStatus?: 'passed' | 'failed' | 'running';
  isOwnWork: boolean;
  attributionNote?: string;
}

export interface RegistryProject {
  id: string;
  name: string;
  shortDescription: string;
  tier: ProjectTier;
  githubRepo: string; // e.g. "org/evidence-flow"
  isDisallowedAsOwnWork?: boolean; // Explicit guard against presenting as own work
  forbiddenReason?: string;
  category: 'Infrastructure' | 'Healthcare' | 'Data & Analytics' | 'Security & Operations' | 'Developer Tools';
  targetAudience: string;
  claimedTechnologies: string[];
  claimedFeatures: string[];
  deploymentUrl?: string;
  expectedHtmlTitle?: string;
  actualHtmlTitle?: string;
  ciRunId?: string;
  ciCommitSha?: string;
  ciStatus?: 'passed' | 'failed' | 'running';
  lastVerifiedAt?: string;
  status: VerificationStatus;
  flagReasons?: string[];
  metrics?: {
    testCoverage?: string;
    uptime?: string;
    performanceScore?: number;
  };
}

export interface VerificationCheck {
  id: string;
  title: string;
  ruleCode: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'passed' | 'failed' | 'warning';
  details: string;
}

export interface LiveHtmlInspection {
  httpStatus: number;
  latencyMs: number;
  contentType: string;
  actualHtmlTitle: string;
  metaDescription?: string;
  bodyExcerpt?: string;
  detectedLinksCount: number;
  verdict: 'verified_exact' | 'generic_shell_warning' | 'wrong_app_mismatch' | 'unreachable';
  issues: string[];
}

export interface GitHubApiDiagnostic {
  endpoint: string;
  httpStatus?: number;
  latencyMs?: number;
  rateLimitRemaining?: number;
  rateLimitLimit?: number;
  error?: string;
  sha256Fingerprint?: string;
  verifiedAt: string;
  source: 'github_v3_api' | 'proxy_api' | 'offline_unverified';
}

export interface VerificationResult {
  projectId: string;
  timestamp: string;
  overallStatus: VerificationStatus;
  checks: VerificationCheck[];
  extractedTechStack: string[];
  verifiedDescription: string;
  undocumentedClaimsFound: string[];
  disallowedAttributionBlocked: boolean;
  htmlIdentityVerified?: boolean;
  expectedHtmlTitle?: string;
  actualHtmlTitle?: string;
  ciRunId?: string;
  ciCommitSha?: string;
  isLiveVerifiedFromGitHub?: boolean;
  liveHtmlInspection?: LiveHtmlInspection;
  apiDiagnostics?: GitHubApiDiagnostic;
  score: number; // 0-100
}

export interface VerificationArchiveEntry {
  id: string;
  timestamp: string;
  projectId: string;
  projectName: string;
  githubRepo: string;
  overallStatus: VerificationStatus;
  score: number;
  isLiveVerified: boolean;
  httpStatus?: number;
  latencyMs?: number;
  rateLimitRemaining?: number;
  sha256Fingerprint: string;
  checksSummary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
  };
  detectedTechnologies: string[];
  ciStatus?: string;
  actor: string;
  triggerType: 'autonomous_sweep' | 'manual_verification' | 'auto_repair' | 'scheduled_diagnostics';
  errorMessage?: string;
  rawChecks: VerificationCheck[];
}

export interface UserRole {
  id: 'lead_engineer' | 'security_auditor' | 'guest_reviewer';
  name: string;
  description: string;
  badge?: string;
  color?: string;
  canEditRegistry: boolean;
  canRunSentinel: boolean;
  canAccessSecurityDashboard: boolean;
  canManageGitSanitation: boolean;
  canApproveFlags: boolean;
  accessibleTools?: string[];
}

export interface PreSeededAccount {
  role: 'lead_engineer' | 'security_auditor' | 'guest_reviewer';
  roleName: string;
  email: string;
  testPassword: string;
  description: string;
}

export interface RbacRolesResponse {
  success: boolean;
  databaseSource: string;
  roles: UserRole[];
  preSeededAccounts: PreSeededAccount[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash?: string; // Kept secure on server
  role: 'lead_engineer' | 'security_auditor' | 'guest_reviewer';
  createdAt: string;
  lastLoginAt: string;
  avatarColor: string;
  githubToken?: string;
  sessionToken?: string;
}

export interface SecurityArchitectureSketch {
  title: string;
  overview: string;
  pillars: Array<{
    name: string;
    description: string;
    codeSnippet: string;
  }>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: 'REGISTRY_UPDATED' | 'VERIFICATION_SWEEP' | 'SECURITY_BLOCKED' | 'FLAG_RESOLVED' | 'USER_LOGIN' | 'USER_REGISTERED' | 'SETTINGS_CONFIGURED' | 'BRANCHES_SANITY_PRUNED' | 'AUTO_REPAIR_EXECUTED' | 'AUTONOMOUS_SWEEP' | 'GITHUB_API_VERIFIED' | 'GITHUB_API_ERROR' | 'VERIFICATION_ARCHIVED';
  details: string;
  projectId?: string;
  status: 'success' | 'warning' | 'blocked';
}

export interface SearchFilterOptions {
  query: string;
  tier: 'all' | ProjectTier;
  status: 'all' | VerificationStatus;
  category: 'all' | string;
}

export type AppTheme = 'midnight' | 'obsidian' | 'cyberpunk' | 'nordic' | 'light';
export type VerificationStrictness = 'zero_tolerance' | 'strict' | 'permissive';
export type BranchCleanupStrategy = 'merge_base' | 'exact_sha' | 'duplicate_heads';

// CodeSentinel Security Layer v1 Types (12 Pillars)
export type SecurityExecutionMode = 'read_only' | 'verify_only' | 'write_guarded';

export type SecurityPillarId =
  | 'write_isolation'
  | 'dry_run'
  | 'safety_rules'
  | 'audit_log'
  | 'rollback'
  | 'rate_limit'
  | 'schema_validation'
  | 'permission_layer'
  | 'sandboxing'
  | 'tamper_detection'
  | 'self_protection'
  | 'security_policy';

export interface SecurityPillarStatus {
  id: SecurityPillarId;
  pillarNumber: number;
  name: string;
  shortName: string;
  status: 'active' | 'enforced' | 'warning' | 'disabled';
  description: string;
  technicalMechanism: string;
  details: string;
}

export interface SecurityApprovalToken {
  token: string;
  issuedAt: string;
  expiresAt: string;
  issuedBy: string;
  action: string;
  isUsed: boolean;
}

export interface SnapshotBackup {
  id: string;
  timestamp: string;
  label: string;
  reason: string;
  actor: string;
  sha256Hash: string;
  projectCount: number;
  payloadJson: string;
}

export type QuarantineItemType = 'project_registry' | 'git_branch' | 'repository_file' | 'configuration';

export interface QuarantineVaultEntry {
  id: string;
  itemType: QuarantineItemType;
  itemName: string;
  sourceRepo?: string;
  deletedAt: string;
  deletedBy: string;
  deletionReason: string;
  sha256Signature: string;
  status: 'quarantined' | 'restored' | 'purged';
  restoredAt?: string;
  restoredBy?: string;
  originalPayload: any; // Complete intact object or content
  metadata: {
    branchSha?: string;
    targetPath?: string;
    category?: string;
    recoveryCommand?: string;
    protectionLevel: 'critical' | 'high' | 'standard';
  };
}

export interface RepoSafetyGuardEvaluation {
  targetRepo: string;
  isAllowedTarget: boolean;
  isProtectedOwnerScope: boolean;
  isReadOnly: boolean;
  isBlockedAttribution: boolean;
  canExecuteDeletion: boolean;
  blockedReason?: string;
  securityPillarChecks: {
    scopeWhitelistPassed: boolean;
    foreignRepoBarrierPassed: boolean;
    readOnlyShieldPassed: boolean;
    coreBranchLockPassed: boolean;
    criticalFileLockPassed: boolean;
  };
}

export interface SchemaValidationResult {
  isValid: boolean;
  timestamp: string;
  checkedCount: number;
  errors: Array<{
    path: string;
    message: string;
    severity: 'critical' | 'warning';
  }>;
  warnings: string[];
}

export interface TamperCheckResult {
  isCompromised: boolean;
  timestamp: string;
  registryHash: string;
  expectedRegistryHash: string;
  policyHash: string;
  auditChainValid: boolean;
  tamperedEntries: string[];
}

export interface BranchSafetyEvaluation {
  branchName: string;
  repo: string;
  branchSha: string;
  mainSha: string;
  isSafeToDelete: boolean;
  failedRules: string[];
  passedRules: string[];
  rules: {
    rule1_noOpenPRs: { passed: boolean; details: string };
    rule2_isAncestorOfMain: { passed: boolean; details: string };
    rule3_notNewerThanMain: { passed: boolean; details: string };
    rule4_noGitTags: { passed: boolean; details: string };
    rule5_noReleasesAttached: { passed: boolean; details: string };
    rule6_noActiveWorkflows: { passed: boolean; details: string };
    rule7_noActiveEnvironments: { passed: boolean; details: string };
    rule8_noRecentDeployHistory: { passed: boolean; details: string };
  };
}

export interface SecurityPolicyConfig {
  version: string;
  lastUpdated: string;
  enforceDryRunByDefault: boolean;
  writeAllowedRepos: string[];
  readOnlyRepos: string[];
  blockedAttributionRepos: string[];
  tokenTtlSeconds: number;
  maxDailyPrunes: number;
  circuitBreakerThreshold: number;
}

export interface AppSettings {
  // Theme & Appearance
  theme: AppTheme;
  density: 'compact' | 'comfortable' | 'spacious';
  codeFontBadges: boolean;
  enableAnimations: boolean;

  // CodeSentinel Verification Engine
  strictness: VerificationStrictness;
  autoSweepInterval: 'off' | '30s' | '1m' | '5m' | '15m';
  requireReadmeDoc: boolean;
  requirePackageJsonCheck: boolean;
  autoSyncDescriptionsFromReadme: boolean;
  enforceAttributionGuard: boolean; // CS-09

  // Git Sanitation & Branch Cleanup Rules
  branchCleanupStrategy: BranchCleanupStrategy;
  staleBranchDays: number;
  autoDryRunBranchPrune: boolean;

  // CodeSentinel Security Layer v1
  securityMode: SecurityExecutionMode;
  dryRunEnforced: boolean;
  requireApprovalTokensForWrite: boolean;
  tamperProtectionEnabled: boolean;
  rateLimitGuardEnabled: boolean;

  // Notifications & Alerts
  toastNotifications: boolean;
  attributionBreachAlert: boolean;
  flaggedDiscrepancyBadges: boolean;
  soundEffects: boolean;
  staleRepoAlertDays: number;

  // GitHub & Live Remote Inspection
  githubPersonalAccessToken?: string;
  githubTargetAccount?: string; // Default "abla86"
  enableLiveUrlInspection: boolean;
  autonomousSelfWorkerEnabled: boolean;
  enableAutonomousSelfWorker?: boolean;
  autonomousIntervalSeconds: number; // e.g. 60

  // Localization & Default View
  language: 'no' | 'en';
  defaultView: 'portfolio' | 'sentinel' | 'registry' | 'audit' | 'security';
}
