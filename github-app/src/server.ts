import express from "express";
import crypto from "node:crypto";
import { addIssueComment, createInstallationToken, getPullRequest, getRepository } from "./github.js";
import { runAgentPipeline } from "./agents.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
const processedDeliveries = new Set<string>();
const MAX_PROCESSED_DELIVERIES = 1000;

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

function shouldProcess(event: string, action?: string): boolean {
  if (event === "push") return true;
  if (event === "pull_request") return ["opened", "reopened", "synchronize", "ready_for_review"].includes(action ?? "");
  return false;
}

function rememberDelivery(delivery: string): boolean {
  if (processedDeliveries.has(delivery)) return false;
  processedDeliveries.add(delivery);
  if (processedDeliveries.size > MAX_PROCESSED_DELIVERIES) {
    const oldest = processedDeliveries.values().next().value;
    if (oldest) processedDeliveries.delete(oldest);
  }
  return true;
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

  if (!shouldProcess(event, payload.action)) {
    return res.status(202).json({ accepted: true, processed: false, event, action: payload.action ?? null, delivery });
  }
  if (!rememberDelivery(delivery)) {
    return res.status(202).json({ accepted: true, duplicate: true, event, delivery });
  }

  res.status(202).json({ accepted: true, processed: true, event, delivery });

  try {
    if (!payload.installation?.id || !payload.repository?.owner?.login || !payload.repository?.name) return;

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

    if (event === "pull_request" && ["opened", "reopened", "synchronize", "ready_for_review"].includes(payload.action) && payload.pull_request?.number) {
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
