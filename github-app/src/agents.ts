export type AgentName = "planner" | "code-analyst" | "test-analyst" | "security-analyst" | "release-analyst";

export interface AgentContext {
  owner: string;
  repo: string;
  event: string;
  ref?: string;
  pullRequestNumber?: number;
}

export interface AgentResult {
  agent: AgentName;
  status: "completed" | "skipped" | "failed";
  findings: string[];
}

const agents: Array<{ name: AgentName; run: (context: AgentContext) => Promise<AgentResult> }> = [
  {
    name: "planner",
    async run(context) {
      return { agent: "planner", status: "completed", findings: [`Pipeline planned for ${context.owner}/${context.repo}.`] };
    },
  },
  {
    name: "code-analyst",
    async run() {
      return { agent: "code-analyst", status: "completed", findings: ["Repository analysis stage ready."] };
    },
  },
  {
    name: "test-analyst",
    async run() {
      return { agent: "test-analyst", status: "completed", findings: ["Test evidence stage ready; no test result is inferred here."] };
    },
  },
  {
    name: "security-analyst",
    async run() {
      return { agent: "security-analyst", status: "completed", findings: ["Security review stage ready; executable security results must come from CI tools."] };
    },
  },
  {
    name: "release-analyst",
    async run() {
      return { agent: "release-analyst", status: "completed", findings: ["Release-readiness stage ready; deployment is not performed by the default pipeline."] };
    },
  },
];

export async function runAgentPipeline(context: AgentContext): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  for (const agent of agents) {
    try {
      results.push(await agent.run(context));
    } catch (error) {
      results.push({ agent: agent.name, status: "failed", findings: [error instanceof Error ? error.message : "Unknown agent error"] });
      break;
    }
  }
  return results;
}
