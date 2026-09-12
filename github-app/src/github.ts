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
  return githubFetch<{ full_name: string; default_branch: string; private: boolean }>(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {}, token);
}

export async function getPullRequest(owner: string, repo: string, number: number, token: string) {
  return githubFetch<{ number: number; title: string; body: string | null; head: { ref: string }; base: { ref: string }; html_url: string }>(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}`, {}, token);
}

export async function addIssueComment(owner: string, repo: string, issueNumber: number, body: string, token: string) {
  return githubFetch(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
    headers: { "Content-Type": "application/json" },
  }, token);
}
