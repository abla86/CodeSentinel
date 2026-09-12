import { getCommitStatusSummary, getPullRequest, getPullRequestFiles } from "./github.js";

export type AgentName = "planner" | "code-analyst" | "test-analyst" | "security-analyst" | "release-analyst";

export interface AgentContext {
  owner: string;
  repo: string;
  event: string;
  action?: string;
  ref?: string;
  pullRequestNumber?: number;
}

export interface AgentResult {
  agent: AgentName;
  status: "completed" | "skipped" | "failed";
  findings: string[];
}

export async function runAgentPipeline(context: AgentContext, token: string): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  const add = (agent: AgentName, findings: string[], status: AgentResult["status"] = "completed") =>
    results.push({ agent, status, findings });

  add("planner", [
    `Pipeline planned for ${context.owner}/${context.repo}.`,
    `Trigger: ${context.event}${context.action ? `:${context.action}` : ""}.`,
    context.pullRequestNumber ? `Pull request: #${context.pullRequestNumber}.` : "No pull request context supplied.",
  ]);

  if (context.pullRequestNumber) {
    const pr = await getPullRequest(context.owner, context.repo, context.pullRequestNumber, token);
    const files = await getPullRequestFiles(context.owner, context.repo, context.pullRequestNumber, token);
    const totalAdditions = files.reduce((sum, file) => sum + file.additions, 0);
    const totalDeletions = files.reduce((sum, file) => sum + file.deletions, 0);
    const sourceFiles = files.filter((file) => /\.(ts|tsx|js|jsx|cs|py|java|go|rs|rb|php)$/i.test(file.filename)).length;
    add("code-analyst", [
      `PR #${pr.number}: ${pr.title}`,
      `${files.length} changed files; +${totalAdditions}/-${totalDeletions} lines.`,
      `${sourceFiles} changed source-code files detected.`,
      pr.draft ? "Pull request is marked draft." : "Pull request is not marked draft.",
    ]);

    const suspicious = files.filter((file) => /(^|\/)(\.env|\.env\.|.*\.pem$|.*\.key$|id_rsa$)/i.test(file.filename));
    const secretPatterns = /(ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----)/;
    const secretLikePatch = files.some((file) => secretPatterns.test(file.patch ?? ""));
    const securityFindings = [
      suspicious.length ? `Potential sensitive filenames changed: ${suspicious.map((f) => f.filename).join(", ")}.` : "No obvious secret/key filenames found in changed files.",
      secretLikePatch ? "Potential credential/private-key pattern detected in a changed-file patch; manual review required." : "No supported credential pattern detected in available patches.",
      "This is a heuristic pre-check, not a replacement for GitHub secret scanning or CodeQL.",
    ];
    add("security-analyst", securityFindings, secretLikePatch || suspicious.length ? "completed" : "completed");

    const testFindings = [
      files.some((f) => /(^|\/)(test|tests|__tests__)(\/|$)|\.(test|spec)\.[^.]+$/i.test(f.filename))
        ? "Test-related files are included in the change set."
        : "No test files detected in the change set.",
      "Executable test outcomes must come from CI/check runs; this agent does not infer passing tests from source changes.",
    ];
    add("test-analyst", testFindings);

    if (context.ref) {
      const status = await getCommitStatusSummary(context.owner, context.repo, context.ref, token);
      add("release-analyst", [
        `Commit status state: ${status.state}.`,
        `Reported status contexts: ${status.total_count}.`,
        status.state === "success" ? "Current combined commit status is successful." : "Release readiness is not proven by a successful combined commit status.",
      ]);
    } else {
      add("release-analyst", ["No commit SHA/ref supplied; release readiness cannot be established from status checks."]);
    }
  } else {
    add("code-analyst", ["Skipped detailed code analysis: event did not provide pull request context."], "skipped");
    add("test-analyst", ["Skipped CI evidence analysis: event did not provide pull request context."], "skipped");
    add("security-analyst", ["Skipped patch heuristic: event did not provide pull request context."], "skipped");
    add("release-analyst", ["Release analysis requires a commit ref and executable CI evidence."], "skipped");
  }

  return results;
}
