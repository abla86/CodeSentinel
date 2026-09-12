import crypto from "node:crypto";

const API = "https://api.github.com";
const API_VERSION = "2026-03-10";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function privateKey(): string {
  return required("GITHUB_PRIVATE_KEY_PEM").replace(/\\n/g, "\n");
}

export function createAppJwt(): string {
  const appId = required("GITHUB_APP_ID");
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ iat: now - 30, exp: now + 540, iss: appId })).toString("base64url");
  const data = `${header}.${payload}`;
  const signature = crypto.createSign("RSA-SHA256").update(data).sign(privateKey(), "base64url");
  return `${data}.${signature}`;
}

async function githubFetch<T>(url: string, init: RequestInit = {}, token: string): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": API_VERSION,
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 1000)}`);
  }
  return response.json() as Promise<T>;
}

export async function createInstallationToken(installationId: number): Promise<string> {
  const jwt = createAppJwt();
  const response = await fetch(`${API}/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": API_VERSION,
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (!response.ok) throw new Error(`Installation token request failed: ${response.status}`);
  const body = await response.json() as { token: string };
  return body.token;
}

export async function getRepository(owner: string, repo: string, token: string) {
  return githubFetch<{ full_name: string; default_branch: string; private: boolean; html_url: string }>(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {}, token);
}

export async function getPullRequest(owner: string, repo: string, number: number, token: string) {
  return githubFetch<{ number: number; title: string; body: string | null; head: { ref: string; sha: string }; base: { ref: string }; html_url: string; draft: boolean; mergeable: boolean | null }>(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}`, {}, token);
}

export interface PullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export async function getPullRequestFiles(owner: string, repo: string, number: number, token: string): Promise<PullRequestFile[]> {
  const files: PullRequestFile[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const batch = await githubFetch<PullRequestFile[]>(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}/files?per_page=100&page=${page}`, {}, token);
    files.push(...batch);
    if (batch.length < 100) return files;
  }
  throw new Error("Pull request contains more than 2000 changed files; refusing to truncate analysis.");
}

export async function getCommitStatusSummary(owner: string, repo: string, ref: string, token: string) {
  return githubFetch<{ state: string; total_count: number }>(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(ref)}/status`, {}, token);
}

export interface CheckRunSummary {
  total_count: number;
  check_runs: Array<{
    name: string;
    status: string;
    conclusion: string | null;
    html_url: string | null;
  }>;
}

export async function getCheckRunSummary(owner: string, repo: string, ref: string, token: string): Promise<CheckRunSummary> {
  const all: CheckRunSummary["check_runs"] = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await githubFetch<CheckRunSummary>(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(ref)}/check-runs?per_page=100&page=${page}`, {}, token);
    all.push(...batch.check_runs);
    if (batch.check_runs.length < 100) return { total_count: all.length, check_runs: all };
  }
  return { total_count: all.length, check_runs: all };
}

export async function addIssueComment(owner: string, repo: string, issueNumber: number, body: string, token: string) {
  return githubFetch(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
    headers: { "Content-Type": "application/json" },
  }, token);
}
