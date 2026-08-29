# CodeSentinel

CodeSentinel is a GitHub-grounded portfolio registry and verification application. It combines a React/Vite frontend with a Node/Express server and verification-oriented project, security, audit-log, and portfolio views.

## Current stack

- React 19
- TypeScript 5.8
- Vite 6
- Node.js / Express 4
- esbuild
- Tailwind CSS 4
- Google GenAI integration

The exact dependency versions and scripts are defined in `package.json`. This README does not replace the lockfile or dependency manifest.

## Main capabilities

- Portfolio/project registry
- GitHub-grounded project information
- Verification and audit-log views
- Security-layer dashboard
- Project detail and search views
- Authentication-related UI
- Server-side API integration
- Environment configuration through `.env.example`

## Development

Install dependencies using the repository's package manager and lockfile, then run:

```text
npm run dev
```

Production build:

```text
npm run build
npm start
```

TypeScript check:

```text
npm run lint
```

## Evidence and verification principle

CodeSentinel should distinguish clearly between:

1. information retrieved from GitHub;
2. information verified by an executable check;
3. information supplied by a project registry;
4. information generated or summarized by AI.

An AI-generated statement must not be presented as independently verified evidence.

## Security

See [SECURITY.md](SECURITY.md).

Security and repository-governance configuration is also documented in [docs/REPOSITORY-GOVERNANCE.md](docs/REPOSITORY-GOVERNANCE.md).

## Repository integrity

Existing functionality, historical components, and legacy material are retained unless there is a demonstrated technical reason to change or remove them. Changes should be additive or narrowly scoped whenever possible.

## Status

This repository is an active development project. Build, test, security, and verification claims should be based on the current repository state and CI results rather than inferred from documentation alone.
