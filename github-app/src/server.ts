import express from "express";
import crypto from "node:crypto";
import { addIssueComment, createInstallationToken, getPullRequest, getRepository } from "./github.js";
import { runAgentPipeline } from "./agents.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

if (!webhookSecret) console.warn("GITHUB_WEBHOOK_SECRET is not configured; webhook requests will be rejected.");

function verifySignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!webhookSecret || !signature?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const supplied = signature.slice("sha256=".length);
  if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;
  const a = Buffer.from(supplied, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

app.get("/health", (_req, res) => res.json({
  status: "ok",
  service: "codesentinel-github-app",
  timestamp: new Date().toISOString(),
  webhookConfigured: Boolean(webhookSecret),
}));

app.post("/github/webhook", express.raw({ type: "application/json", limit: "2mb" }), async (req, res) => {
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? "");
  if (!verifySignature(raw, req.header("X-Hub-Signature-256"))) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  const event = req.header("X-GitHub-Event") ?? "unknown";
  const delivery = req.header("X-GitHub-Delivery") ?? "unknown";
  let payload: any;
  try { payload = JSON.parse(raw.toString("utf8")); } catch { return res.status(400).json({ error: "Invalid JSON" }); }

  res.status(202).json({ accepted: true, event, delivery });

  try {
    if (!payload.installation?.id || !payload.repository?.owner?.login || !payload.repository?.name) return;
    if (!["issues", "pull_request", "push"].includes(event)) return;

    const owner = payload.repository.owner.login as string;
    const repo = payload.repository.name as string;
    const token = await createInstallationToken(Number(payload.installation.id));
    await getRepository(owner, repo, token);

    const context = {
      owner,
      repo,
      event,
      action: payload.action as string | undefined,
      ref: (payload.pull_request?.head?.sha ?? payload.after ?? payload.ref) as string | undefined,
      pullRequestNumber: payload.pull_request?.number as number | undefined,
    };
    const results = await runAgentPipeline(context, token);

    if (event === "pull_request" && payload.action === "opened" && payload.pull_request?.number) {
      const pr = await getPullRequest(owner, repo, Number(payload.pull_request.number), token);
      const summary = results
        .map((r) => `### ${r.agent}\n**Status:** ${r.status}\n${r.findings.map((f) => `- ${f}`).join("\n")}`)
        .join("\n\n");
      await addIssueComment(owner, repo, Number(payload.pull_request.number), `## CodeSentinel verification report\n\nEvent: \`${event}:${payload.action}\`\n\n${summary}\n\n[Open PR](${pr.html_url})`, token);
    }
  } catch (error) {
    console.error("Webhook processing failed", error);
  }
});

app.listen(port, () => console.log(`CodeSentinel GitHub App listening on :${port}`));
