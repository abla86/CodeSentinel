import { RegistryProject, GitHubRepoFixture, AuditLogEntry } from '../types';

export const INITIAL_REGISTRY_PROJECTS: RegistryProject[] = [
  {
    id: 'proj-complete-evidence-appraisal-tool',
    name: 'Complete Evidence Appraisal Tool',
    shortDescription: 'Research-support prototype for document parsing, study classification, evidence traceability, and structured critical appraisal.',
    tier: 'tier-1',
    githubRepo: 'abla86/complete-evidence-appraisal-tool',
    category: 'Data & Analytics',
    targetAudience: 'Students, researchers, and evidence-review teams',
    claimedTechnologies: ['TypeScript', 'React', 'Express', 'Vite', 'Google GenAI'],
    claimedFeatures: ['Document parsing and candidate evidence extraction', 'Structured appraisal workflows', 'Source and methodology references', 'Human verification required for AI suggestions'],
    status: 'pending_verification',
    flagReasons: ['Seeded repository entry; verify current GitHub source and CI before treating any capability as confirmed.']
  },
  {
    id: 'proj-workforce-competence-management',
    name: 'Workforce & Competence Management',
    shortDescription: 'Portfolio prototype for competence records, shift planning, staffing coverage, and decision support.',
    tier: 'tier-1',
    githubRepo: 'abla86/workforce-competence-management',
    category: 'Healthcare',
    targetAudience: 'Workforce planners and team leads',
    claimedTechnologies: ['React', 'TypeScript', 'ASP.NET Core', 'Entity Framework Core', 'SQL Server', 'Docker'],
    claimedFeatures: ['Competence and shift records', 'Coverage and availability checks', 'Staffing decision support', 'Demo-data boundary and production-readiness limitations'],
    status: 'pending_verification',
    flagReasons: ['Seeded repository entry; verify current GitHub source and CI before treating any capability as confirmed.']
  },
  {
    id: 'proj-azure-kubernetes-showcase',
    name: 'Azure Kubernetes Showcase',
    shortDescription: 'Engineering showcase for container, Kubernetes, infrastructure, CI/CD, and security workflows.',
    tier: 'tier-1',
    githubRepo: 'abla86/azure-kubernetes-showcase',
    category: 'Infrastructure',
    targetAudience: 'Developers, platform engineers, and DevOps teams',
    claimedTechnologies: ['Kubernetes', 'Docker', 'Azure', 'Terraform', 'GitHub Actions'],
    claimedFeatures: ['Infrastructure and deployment examples', 'Build and security workflows', 'Repository governance and validation'],
    status: 'pending_verification',
    flagReasons: ['Seeded repository entry; verify current GitHub source and CI before treating any capability as confirmed.']
  },
  {
    id: 'proj-healthtech-device-api',
    name: 'HealthTech Device API',
    shortDescription: 'Healthcare-technology demonstration API for simulated device monitoring and synthetic DICOM handling.',
    tier: 'tier-1',
    githubRepo: 'abla86/HealthTechDeviceApi',
    category: 'Healthcare',
    targetAudience: 'Healthcare software engineers and API developers',
    claimedTechnologies: ['C#', '.NET', 'ASP.NET Core', 'SQLite', 'xUnit', 'Docker'],
    claimedFeatures: ['Device CRUD and validation', 'Synthetic DICOM inspection', 'Cryptography demonstrations', 'API-key protection outside Development'],
    status: 'pending_verification',
    flagReasons: ['Demonstration only; no clinical validation or production medical-device certification is claimed.']
  },
  {
    id: 'proj-seniorcare-guardian',
    name: 'SeniorCare Guardian',
    shortDescription: 'Healthcare technology UI prototype using simulated care data and demonstration workflows.',
    tier: 'tier-2',
    githubRepo: 'abla86/SeniorCare-Guardian',
    category: 'Healthcare',
    targetAudience: 'Developers exploring care-workflow prototypes',
    claimedTechnologies: ['React', 'TypeScript', 'Vite'],
    claimedFeatures: ['Simulated care and alert screens', 'Demo consent and audit views', 'No verified HelseID, hardware encryption, clinical monitoring, or GDPR compliance'],
    status: 'pending_verification',
    flagReasons: ['UI demonstration only; security and clinical claims must not be inferred from the interface.']
  },
  {
    id: 'proj-codesentinel',
    name: 'CodeSentinel',
    shortDescription: 'GitHub-grounded portfolio registry and verification-oriented project dashboard.',
    tier: 'tier-2',
    githubRepo: 'abla86/CodeSentinel',
    category: 'Security & Operations',
    targetAudience: 'Developers and maintainers reviewing repository evidence',
    claimedTechnologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Vite'],
    claimedFeatures: ['Repository registry and project details', 'Verification and audit-log views', 'Distinguishes source evidence from AI-generated summaries'],
    status: 'pending_verification',
    flagReasons: ['Registry entries are not proof of implementation; verify each repository and check before marking it verified.']
  },
  {
    id: 'proj-book-forge',
    name: 'BookForge',
    shortDescription: 'AI-assisted book and content-generation application prototype.',
    tier: 'tier-2',
    githubRepo: 'abla86/book-forge',
    category: 'Developer Tools',
    targetAudience: 'Writers and developers experimenting with AI-assisted content workflows',
    claimedTechnologies: ['TypeScript', 'React', 'Express', 'Vite', 'Google GenAI'],
    claimedFeatures: ['Content-generation workflows', 'Export and editing features', 'AI-generated claims require source and human review'],
    status: 'pending_verification',
    flagReasons: ['Seeded repository entry; verify current GitHub source and CI before treating any capability as confirmed.']
  },
  {
    id: 'proj-agenttrace',
    name: 'AgentTrace',
    shortDescription: 'AI-agent tracing, provenance, policy evaluation, and bounded simulation toolkit.',
    tier: 'tier-2',
    githubRepo: 'abla86/agenttrace',
    category: 'Security & Operations',
    targetAudience: 'AI-agent developers and security researchers',
    claimedTechnologies: ['Python', 'pytest', 'MCP', 'Google ADK integration example'],
    claimedFeatures: ['Traceable state and provenance labels', 'Policy evaluation', 'Bounded inert simulations', 'Does not provide a universal security guarantee'],
    status: 'pending_verification',
    flagReasons: ['Seeded repository entry; verify current GitHub source and CI before treating any capability as confirmed.']
  },
  {
    id: 'proj-ab-engineering-lab',
    name: 'AB Engineering Lab',
    shortDescription: 'Engineering laboratory and portfolio repository for prototypes, tools, and reference implementations.',
    tier: 'tier-3',
    githubRepo: 'abla86/AB-Engineering-Lab',
    category: 'Developer Tools',
    targetAudience: 'Developers and software architects',
    claimedTechnologies: ['TypeScript', 'Python', 'Rust', 'Docker', 'GitHub Actions'],
    claimedFeatures: ['Engineering experiments', 'Reference implementations', 'CI and security workflows'],
    status: 'pending_verification',
    flagReasons: ['Seeded repository entry; verify current GitHub source and CI before treating any capability as confirmed.']
  },
  {
    id: 'proj-cross-device-sdk',
    name: 'cross-device-sdk',
    shortDescription: 'External third-party fixture retained to test attribution safeguards.',
    tier: 'tier-3',
    githubRepo: 'external-frameworks/cross-device-sdk',
    category: 'Developer Tools',
    targetAudience: 'External third-party project fixture',
    claimedTechnologies: ['C++', 'Java', 'Android SDK', 'Bluetooth LE'],
    claimedFeatures: ['Example third-party capabilities are unverified fixture data'],
    isDisallowedAsOwnWork: true,
    forbiddenReason: 'External/third-party fixture: do not present as own work without verified ownership and attribution.',
    status: 'blocked_disallowed'
  }
];

// Reusable template generator for both abla86 and legacy ab-engineering keys
function makeRepoFixtures() {
  const base: Record<string, GitHubRepoFixture> = {
    'evidence-flow': {
      repoName: 'evidence-flow',
      owner: 'abla86',
      defaultBranch: 'main',
      lastCommitDate: '2026-08-25T18:42:00Z',
      stars: 142,
      openIssues: 3,
      license: 'MIT (Proprietary Core)',
      readmeContent: `# EvidenceFlow 🛡️\n\n**EvidenceFlow** er en produksjonsklar bevis- og revisjonskjedeplattform designet for kliniske og rettsmedisinske miljøer.\n\n## Kjerneegenskaper\n- Uforanderlig revisjonslogg med Merkle Tree hashing og kryptografisk bevis\n- Rollebasert tilgangskontroll (RBAC) tilpasset Normen og GDPR art. 9\n- Sanntids HL7/FHIR hendelseslytting og transformasjon\n- WebCrypto signering av bevispakker med sertifikatverifisering\n\n## Teknologistakk\n- **Runtime**: Node.js v22 LTS, TypeScript\n- **Database**: PostgreSQL 16 med Row-Level Security\n- **Krypto**: WebCrypto API & SHA-256 Merkle Verification Engine\n- **API**: GraphQL & REST endpoint proxy\n\n## Testdekning\n100% enhetstestet med vitest & Playwright E2E. Total dekning: 98.4%.`,
      packageJson: {
        name: 'evidence-flow',
        version: '2.4.0',
        description: 'Cryptographic audit and clinical evidence chain engine',
        dependencies: {
          'typescript': '^5.8.0',
          'graphql': '^16.8.1',
          'pg': '^8.11.3',
          'zod': '^3.23.0',
          'merkle-tree-gen': '^1.2.0'
        }
      },
      detectedTechnologies: ['TypeScript', 'Node.js', 'PostgreSQL', 'WebCrypto', 'Docker', 'GraphQL'],
      documentedKeyFeatures: [
        'Uforanderlig revisjonslogg med Merkle Tree hashing',
        'Rollebasert tilgangskontroll iht. Normen og GDPR',
        'HL7/FHIR hendelseslytter og datatransformasjon',
        'Kryptografisk signering av bevispakker'
      ],
      deploymentUrl: 'https://evidenceflow.ab-engineering.internal',
      expectedHtmlTitle: 'EvidenceFlow – Sikker Klinisk Beviskjede & Revisjonslogg',
      actualHtmlTitle: 'EvidenceFlow – Sikker Klinisk Beviskjede & Revisjonslogg',
      ciStatus: 'passed',
      ciRunId: '33018256411',
      ciCommitSha: 'bb67f18268e09bea741570763cdb92e6275490ee',
      isOwnWork: true
    },
    'vaktklar-core': {
      repoName: 'vaktklar-core',
      owner: 'abla86',
      defaultBranch: 'main',
      lastCommitDate: '2026-08-26T09:15:00Z',
      stars: 98,
      openIssues: 1,
      license: 'Apache-2.0',
      readmeContent: `# Vaktklar 🚨\n\nBeredskaps- og vaktplanlegging for akuttavdelinger og kritiske operasjonsteam.\n\n## Egenskaper\n- Automatisert vakteskalering ved ubesvarte alarmer\n- Sanntids interaktivt tilgjengelighetskart (WebSockets + Redis PubSub)\n- Integrert vaktbyttebørs og ledergodkjenning\n- Multi-kanal varsling (SMS, Push, E-post)\n\n## Teknologistakk\n- Frontend: React 19, TypeScript, Tailwind CSS, Motion\n- Backend: Go 1.23, Redis 7, WebSockets\n- Sikkerhet: OIDC / BankID / HelseID autentisering`,
      packageJson: {
        name: 'vaktklar-core',
        version: '3.1.2',
        description: 'Incident readiness & emergency roster dispatch',
        dependencies: {
          'react': '^19.0.0',
          'typescript': '^5.8.0',
          'tailwindcss': '^4.0.0',
          'lucide-react': '^0.540.0',
          'ws': '^8.18.0'
        }
      },
      detectedTechnologies: ['React', 'TypeScript', 'Go', 'Redis', 'WebSockets', 'Tailwind CSS'],
      documentedKeyFeatures: [
        'Automatisert vakteskalering ved akutte hendelser',
        'Sanntids statuskart for tilgjengelig personell',
        'SMS- og Push-varsling med bekreftelseskvittering',
        'Integrert vaktbyttebørs med ledergodkjenning'
      ],
      deploymentUrl: 'https://vaktklar.ab-engineering.internal',
      expectedHtmlTitle: 'Vaktklar – Beredskapsplanlegging & Vaktstyring',
      actualHtmlTitle: 'Vaktklar – Beredskapsplanlegging & Vaktstyring',
      ciStatus: 'passed',
      ciRunId: '33019842190',
      ciCommitSha: '4f81c9a1024e12e1f4095627ab7519eec81203ca',
      isOwnWork: true
    },
    'cloudforge-engine': {
      repoName: 'cloudforge-engine',
      owner: 'abla86',
      defaultBranch: 'main',
      lastCommitDate: '2026-08-24T14:30:00Z',
      stars: 185,
      openIssues: 5,
      license: 'MIT',
      readmeContent: `# CloudForge ⚡\n\nSikker IaC generator og orkestreringsmotor for helse- og finanssky.\n\n## Nøkkelfunksjoner\n- Automatisk overholdelse av CIS Benchmarks og ISO 27001\n- Provisjonering av herdede Kubernetes-clustre på < 4 minutter\n- Zero-trust nettverkspolicyer med eBPF og Cilium\n- Selvreparerende infrastruktur med automatisk drift-remediation\n\n## Stakk\n- TypeScript, Terraform HCL, Kubernetes, Python 3.12, AWS CDK, GitHub Actions`,
      packageJson: {
        name: 'cloudforge-engine',
        version: '1.9.0',
        description: 'Automated compliant infrastructure generator',
        dependencies: {
          '@aws-cdk/core': '^2.150.0',
          'typescript': '^5.8.0',
          'zod': '^3.23.0'
        }
      },
      detectedTechnologies: ['TypeScript', 'Terraform', 'Kubernetes', 'Python', 'AWS CDK', 'GitHub Actions'],
      documentedKeyFeatures: [
        'Automatisk overholdelse av CIS Benchmarks og ISO 27001',
        'Multi-cluster Kubernetes provisjonering på under 4 minutter',
        'Zero-trust nettverkssegmentering for mikrotjenester',
        'Drift-deteksjon og selvreparerende ressursgrafer'
      ],
      deploymentUrl: 'https://cloudforge.dev',
      expectedHtmlTitle: 'CloudForge – Compliant Cloud Infrastructure Generator',
      actualHtmlTitle: 'CloudForge – Compliant Cloud Infrastructure Generator',
      ciStatus: 'passed',
      ciRunId: '33017641201',
      ciCommitSha: '9a8d7123bc01ef8712956214ab8492048591efcb',
      isOwnWork: true
    },
    'healthtech-device-api': {
      repoName: 'healthtech-device-api',
      owner: 'abla86',
      defaultBranch: 'main',
      lastCommitDate: '2026-08-22T11:00:00Z',
      stars: 76,
      openIssues: 0,
      license: 'Proprietary / Medical Compliance',
      readmeContent: `# HealthTech Device API 🩺\n\nISO 13485 telemetri-gateway og sensormottaker bygget i Rust for maksimal pålitelighet og null minnefeil.\n\n## Egenskaper\n- Bluetooth Low Energy og Wi-Fi telemetristrømming\n- Maskinvareakselerert mTLS med enhetsnøkler i TPM/Secure Element\n- Ultralav latenstid (<5ms) ved hjelp av Protocol Buffers og gRPC\n- Lokal sirkulær ringbuffer for offline datafangst\n\n## Stakk: Rust 1.80, Tokio, gRPC, TimescaleDB, MQTT`,
      detectedTechnologies: ['Rust', 'MQTT', 'gRPC', 'Protocol Buffers', 'TimescaleDB', 'Docker'],
      documentedKeyFeatures: [
        'Støtte for Bluetooth LE og Wi-Fi telemetristrømmer',
        'Maskinvareakselerert TLS 1.3 med mTLS sertifikater',
        'Kompakt binær serialisering med ultralav latenstid (<5ms)',
        'Automatisk fallback til offline-buffer ved nettverksbrudd'
      ],
      deploymentUrl: 'https://api.healthtech.internal/v1',
      expectedHtmlTitle: 'HealthTech Telemetry Gateway API Specification',
      actualHtmlTitle: 'HealthTech Telemetry Gateway API Specification',
      ciStatus: 'passed',
      ciRunId: '33014190823',
      ciCommitSha: '7f91048bcae10492817495810294719284102948',
      isOwnWork: true
    },
    'healthtech-monitor': {
      repoName: 'healthtech-monitor',
      owner: 'abla86',
      defaultBranch: 'main',
      lastCommitDate: '2026-08-25T16:10:00Z',
      stars: 112,
      openIssues: 2,
      license: 'MIT',
      readmeContent: `# HealthTech Monitor 📊\nPasientoppfølging i sanntid med 60fps bølgeformgrafikk og anomalideteksjon.\n\n## Egenskaper\n- Visualisering av EKG, SpO2 og invasivt blodtrykk ved 60 fps i D3.js/Canvas\n- Statistisk avviksdeteksjon for tidlig varsel om forverring (MEWS score)\n- Konfigurerbare alarmterskler med auditering av stilling\n- Mørkemodus optimalisert for nattarbeid på intensivstuer`,
      detectedTechnologies: ['React', 'TypeScript', 'D3.js', 'WebSockets', 'Python', 'FastAPI'],
      documentedKeyFeatures: [
        'Visualisering av EKG, SpO2 og invasivt blodtrykk ved 60 fps',
        'Statistisk avviksdeteksjon for tidlig varsel om forverring',
        'Konfigurerbare alarmterskler med auditering av stilling',
        'Mørkemodus optimalisert for nattarbeid på intensivstuer'
      ],
      deploymentUrl: 'https://monitor.healthtech.internal',
      expectedHtmlTitle: 'HealthTech Monitor – 60fps Real-Time Patient Analytics',
      actualHtmlTitle: 'HealthTech Monitor – 60fps Real-Time Patient Analytics',
      ciStatus: 'passed',
      ciRunId: '33015590123',
      ciCommitSha: '8910427164910283749102847192038471029384',
      isOwnWork: true
    },
    'healthdata-quality-lab': {
      repoName: 'healthdata-quality-lab',
      owner: 'abla86',
      defaultBranch: 'main',
      lastCommitDate: '2026-08-20T10:00:00Z',
      stars: 84,
      openIssues: 1,
      license: 'Apache-2.0',
      readmeContent: `# HealthData Quality Lab 🧪\nAutomatisert valideringsmotor for helsedatasett, syntetiske kohorter og FHIR-konformitet.\n\n## Egenskaper\n- Validering av 150+ kliniske regler og syntakskontroller\n- Syntetisk pasientdata-generator med bevart korrelasjon\n- Automatisk generering av datakvalitetsrapporter i PDF/HTML\n- Avviksdeteksjon i longitudinelle pasientforløp`,
      detectedTechnologies: ['Python', 'Pandas', 'PySpark', 'Parquet', 'FastAPI', 'DuckDB'],
      documentedKeyFeatures: [
        'Validering av 150+ kliniske regler og syntakskontroller',
        'Syntetisk pasientdata-generator med bevart korrelasjon',
        'Automatisk generering av datakvalitetsrapporter i PDF/HTML',
        'Avviksdeteksjon i longitudinelle pasientforløp'
      ],
      deploymentUrl: 'https://quality.healthdata.internal',
      expectedHtmlTitle: 'HealthData Quality Lab – FHIR Validation Benchmark',
      actualHtmlTitle: 'HealthData Quality Lab – FHIR Validation Benchmark',
      ciStatus: 'passed',
      ciRunId: '33011294819',
      ciCommitSha: '1092837491029384710293847102938471029384',
      isOwnWork: true
    },
    'workforce-sql-engine': {
      repoName: 'workforce-sql-engine',
      owner: 'abla86',
      defaultBranch: 'main',
      lastCommitDate: '2026-08-23T15:20:00Z',
      stars: 67,
      openIssues: 0,
      license: 'MIT',
      readmeContent: `# Workforce SQL Engine ⚡\nVektorisert distribuert spørremotor for turnusdata og AML-etterlevelse.\n\n## Egenskaper\n- Vektorisert SQL-utførelse over millioner av vaktregistreringer\n- Innebygde vindusfunksjoner for hviletid- og overtidskontroll\n- Kompilert til WebAssembly for lynraske nettleseranalyser\n- Eksport til Parquet, Arrow IPC og Excel`,
      detectedTechnologies: ['Rust', 'Apache Arrow', 'SQL', 'PostgreSQL', 'DuckDB', 'WebAssembly'],
      documentedKeyFeatures: [
        'Vektorisert SQL-utførelse over millioner av vaktregistreringer',
        'Innebygde vindusfunksjoner for hviletid- og overtidskontroll',
        'Kompilert til WebAssembly for lynraske nettleseranalyser',
        'Eksport til Parquet, Arrow IPC og Excel'
      ],
      deploymentUrl: 'https://workforce-engine.ab-engineering.internal',
      expectedHtmlTitle: 'Workforce SQL Engine – High Throughput Roster Queries',
      actualHtmlTitle: 'Workforce SQL Engine – High Throughput Roster Queries',
      ciStatus: 'passed',
      ciRunId: '33009948123',
      ciCommitSha: '2093847102938471029384710293847102938471',
      isOwnWork: true
    },
    'shiftplan-optimizer': {
      repoName: 'shiftplan-optimizer',
      owner: 'abla86',
      defaultBranch: 'main',
      lastCommitDate: '2026-08-19T08:45:00Z',
      stars: 52,
      openIssues: 4,
      license: 'MIT',
      readmeContent: `# ShiftPlan Optimizer 📅\nBetingelsesbasert turnusløser med matematisk optimalisering og AML-validering.\n\n## Egenskaper\n- Betingelsesbasert turnusløser med matematisk optimalisering\n- Støtte for AML-krav (hviletid, helgefrekvens, arbeidsbelastning)\n- Ønskemodul for ansattes preferanser og ferieplaner\n- Visuell interaktiv Gantt-tidslinje for turnusredigering`,
      detectedTechnologies: ['TypeScript', 'React', 'Z3 Solver', 'Node.js', 'Tailwind CSS'],
      documentedKeyFeatures: [
        'Betingelsesbasert turnusløser med matematisk optimalisering',
        'Støtte for AML-krav (hviletid, helgefrekvens, arbeidsbelastning)',
        'Ønskemodul for ansattes preferanser og ferieplaner',
        'Visuell interaktiv Gantt-tidslinje for turnusredigering'
      ],
      deploymentUrl: 'https://shiftplan.ab-engineering.internal',
      expectedHtmlTitle: 'ShiftPlan – Intelligent AML Schedule Optimizer',
      actualHtmlTitle: 'ShiftPlan – Intelligent AML Schedule Optimizer',
      ciStatus: 'passed',
      ciRunId: '33008129481',
      ciCommitSha: '3094857192837491029384710293847102938471',
      isOwnWork: true
    },
    'lab-benchmarks': {
      repoName: 'lab-benchmarks',
      owner: 'abla86',
      defaultBranch: 'main',
      lastCommitDate: '2026-08-26T11:30:00Z',
      stars: 41,
      openIssues: 0,
      license: 'MIT',
      readmeContent: `# AB Engineering Lab 🔬\nEksperimentelle ytelsesmålinger, WASM-moduler og CodeSentinel skript.\n\n## Egenskaper\n- Micro-benchmarking av JSON vs Protobuf vs FlatBuffers\n- Eksperimentelle web-workers for CPU-intensive helseberegninger\n- CI/CD maler og CodeSentinel valideringsskript\n- Interaktive arkitekturdiagrammer og referanseimplementasjoner`,
      detectedTechnologies: ['TypeScript', 'Rust', 'WebAssembly', 'Bun', 'Vite', 'Docker'],
      documentedKeyFeatures: [
        'Micro-benchmarking av JSON vs Protobuf vs FlatBuffers',
        'Eksperimentelle web-workers for CPU-intensive helseberegninger',
        'CI/CD maler og CodeSentinel valideringsskript',
        'Interaktive arkitekturdiagrammer og referanseimplementasjoner'
      ],
      deploymentUrl: 'https://lab.ab-engineering.internal',
      expectedHtmlTitle: 'AB Engineering Lab – Architecture & WASM Benchmarks',
      actualHtmlTitle: 'AB Engineering Lab – Architecture & WASM Benchmarks',
      ciStatus: 'passed',
      ciRunId: '33006491823',
      ciCommitSha: '4095867192837491029384710293847102938471',
      isOwnWork: true
    },
    'external-frameworks/cross-device-sdk': {
      repoName: 'cross-device-sdk',
      owner: 'external-frameworks',
      defaultBranch: 'main',
      lastCommitDate: '2025-11-12T00:00:00Z',
      stars: 12400,
      openIssues: 180,
      license: 'Apache-2.0 (External upstream library)',
      readmeContent: `# Cross-Device SDK (External Library)\n\nOfficial cross-device connectivity framework provided by external vendor.\n\n⚠️ NOT authored by Annebeth / abla86. Any portfolio attribution claiming original authorship is strictly in violation of CodeSentinel truth policies.`,
      detectedTechnologies: ['C++', 'Java', 'Android SDK', 'Bluetooth LE'],
      documentedKeyFeatures: [
        'Kryssenhets protokollsynkronisering',
        'Peer-to-peer overføring av strømmer'
      ],
      isOwnWork: false,
      attributionNote: 'External open source SDK - Must never be presented as own work.'
    }
  };

  const fullMap: Record<string, GitHubRepoFixture> = {};
  for (const [k, v] of Object.entries(base)) {
    if (k.includes('/')) {
      fullMap[k] = v;
    } else {
      fullMap[`abla86/${k}`] = { ...v, owner: 'abla86' };
      fullMap[`ab-engineering/${k}`] = { ...v, owner: 'ab-engineering' };
    }
  }
  return fullMap;
}

export const SIMULATED_GITHUB_REPOSITORIES: Record<string, GitHubRepoFixture> = makeRepoFixtures();

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2026-08-26T12:00:00Z',
    actor: 'CodeSentinel Automated Runner',
    action: 'AUTONOMOUS_SWEEP',
    details: 'Full verification sweep completed for all 9 registered projects against abla86 GitHub truth source.',
    status: 'success'
  },
  {
    id: 'audit-002',
    timestamp: '2026-08-26T12:00:05Z',
    actor: 'CodeSentinel Rule #CS-09',
    action: 'SECURITY_BLOCKED',
    projectId: 'proj-cross-device-sdk',
    details: 'ATTRIBUTION GUARD TRIGGERED: Blocked external repository external-frameworks/cross-device-sdk from being claimed as personal engineering work.',
    status: 'blocked'
  },
  {
    id: 'audit-003',
    timestamp: '2026-08-26T12:01:00Z',
    actor: 'System Admin (Annebeth)',
    action: 'REGISTRY_UPDATED',
    details: 'Registry integrity check passed. Grounding lock enabled: Portfolio content strictly synchronized with GitHub abla86 kilder.',
    status: 'success'
  }
];
