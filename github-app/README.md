# CodeSentinel GitHub App — Agent Orchestrator

A production-oriented GitHub App foundation for repository automation. It receives GitHub App webhooks, validates the signature, creates short-lived installation tokens, and runs a deterministic multi-agent verification pipeline against pull requests.

## What is implemented

- HMAC SHA-256 webhook verification.
- GitHub App RS256 JWT creation.
- Short-lived installation access tokens.
- Repository and pull-request metadata retrieval.
- Changed-file analysis with additions/deletions and source-file counts.
- Basic changed-file secret/key heuristics.
- Explicit separation between executable CI evidence and heuristic analysis.
- Combined commit-status inspection when a commit SHA is available.
- Automated PR report comments for newly opened pull requests.
- Health endpoint for deployment probes.
- TypeScript CI validation.
- Docker image build validation.

## Architecture

```text
GitHub
  │
  ├─ push / pull_request / issues
  ▼
Webhook receiver
  │
  ├─ HMAC signature validation
  └─ event normalization
  ▼
Agent orchestrator
  ├─ Planner
  ├─ Code Analyst
  ├─ Test Analyst
  ├─ Security Analyst
  └─ Release Analyst
  │
  ▼
GitHub App installation token
  │
  ▼
Repository / PR API
  │
  ▼
Verification report → PR comment
```

## Safety model

- No personal access token is used.
- Webhooks require `X-Hub-Signature-256` verification.
- GitHub App JWTs are signed with the registered private key.
- Installation tokens are short-lived and scoped by the app installation.
- Repository permissions should remain at the minimum required level.
- The default pipeline is read/analyze/report; destructive repository mutation is not enabled.
- Secret detection is heuristic and must not be presented as equivalent to GitHub secret scanning.
- Test and security claims are based on executable CI evidence only when such evidence is actually retrieved.

## Required environment

Copy `.env.example` to `.env` for local development.

```text
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=
PORT=8787
```

## Local run

```bash
npm install
npm run github-app:check
npm run github-app:dev
```

Health endpoint:

```text
GET /health
```

Webhook endpoint:

```text
POST /github/webhook
```

## GitHub App registration — the remaining manual step

Register the app under the GitHub account that owns the repositories. Configure the webhook URL to the deployed `/github/webhook` endpoint and create a high-entropy webhook secret.

Install the app on the repositories it is allowed to inspect. For the current implementation, configure only the repository permissions actually required for metadata, pull requests, issues/comments, and any other resource that a later agent explicitly consumes. Do not grant administration, secrets, or workflow-write permissions without a demonstrated requirement.

The app registration, private key, webhook secret, installation ID, and production URL are intentionally not committed to this repository.

## Deployment

The service is container-ready and can be hosted on Azure App Service, Azure Container Apps, or another HTTPS-capable service. The deployment must expose a stable HTTPS webhook endpoint.

For Azure deployments, prefer GitHub Actions OIDC over long-lived Azure credentials.

## CI

Two workflows validate this component:

- `GitHub App Check` — TypeScript compilation.
- `GitHub App Docker Build` — container image build and image inspection.

A green workflow run is required before treating the implementation as CI-validated.

## Status

The repository contains the executable GitHub App foundation and automated validation. **GitHub-side registration, installation, production secrets, and public HTTPS deployment remain intentionally manual because they require account-level configuration and credentials.**
