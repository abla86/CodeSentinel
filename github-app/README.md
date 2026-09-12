# CodeSentinel GitHub App — Agent Orchestrator

A production-oriented GitHub App foundation for repository automation. It receives GitHub App webhooks, validates the signature, creates short-lived installation tokens, and runs a deterministic multi-agent pipeline that can inspect a repository and report findings.

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
Repository API / PR comments
```

The implementation deliberately keeps agent decisions separate from GitHub credentials. The app uses installation tokens for autonomous repository actions, which is the GitHub-recommended model for server-to-server GitHub App automation.

## Safety model

- No personal access token is used.
- Webhooks require `X-Hub-Signature-256` verification.
- GitHub App JWTs are signed with the registered private key.
- Installation tokens are short-lived and scoped by the app installation.
- Repository permissions should remain at the minimum required level.
- The default pipeline is read/analyze/report; destructive repository mutation is not enabled by default.
- AI output is labelled as analysis rather than proof of a successful executable check.

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
npm run github-app:dev
```

The health endpoint is:

```text
GET /health
```

The webhook endpoint is:

```text
POST /github/webhook
```

## GitHub registration

Register the app under the account that owns the repositories. Enable webhooks, set the webhook URL to the deployed `/github/webhook` endpoint, and configure a high-entropy webhook secret. Select only the permissions required by the current pipeline. GitHub documents that app permissions determine both API access and available webhook events.

For the initial read/analyze/report implementation, use the smallest repository permissions needed for metadata, contents, pull requests, issues, and actions only if the implementation actually consumes those resources. Do not grant administration, secrets, or workflow-write access unless a later feature demonstrably requires it.

## Deployment

The service is container-ready and can be hosted on Azure App Service, Azure Container Apps, or another HTTPS-capable service. GitHub requires a reachable webhook URL for deployed webhook operation.

Azure deployments should prefer GitHub Actions OIDC rather than long-lived Azure credentials stored as secrets.

## Status

This directory is the executable GitHub App foundation. The GitHub-side app registration and production secrets are intentionally not committed to the repository.
