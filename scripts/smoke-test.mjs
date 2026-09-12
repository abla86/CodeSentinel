import { spawn } from "node:child_process";

const port = 3000;
const baseUrl = `http://127.0.0.1:${port}`;

const server = spawn(process.execPath, ["dist/server.cjs"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    SESSION_SECRET: "codesentinel-smoke-test-secret",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForHealth() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return response;
    } catch {
      // Server is still starting.
    }
    await sleep(200);
  }
  throw new Error(`Server did not become healthy. Output:\n${output}`);
}

try {
  const health = await waitForHealth();
  const healthBody = await health.json();
  if (healthBody.status !== "ok") {
    throw new Error("Health endpoint did not report status=ok");
  }

  const sentinel = await fetch(`${baseUrl}/api/sentinel/health`);
  if (!sentinel.ok) throw new Error("Sentinel health endpoint failed");

  const register = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Test",
      email: "smoke@example.invalid",
      password: "StrongSmokePassword123!",
    }),
  });
  if (register.status !== 201) {
    throw new Error(`Registration smoke test failed with HTTP ${register.status}`);
  }

  const registrationBody = await register.json();
  if (!registrationBody.token) throw new Error("Registration did not issue a session token");

  const me = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { authorization: `Bearer ${registrationBody.token}` },
  });
  if (!me.ok) throw new Error(`Authenticated /me request failed with HTTP ${me.status}`);

  const meBody = await me.json();
  if (meBody.user?.email !== "smoke@example.invalid") {
    throw new Error("Authenticated user identity did not round-trip correctly");
  }

  console.log("CodeSentinel production smoke test passed.");
} finally {
  server.kill("SIGTERM");
  await sleep(100);
}
