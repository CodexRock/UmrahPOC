import { runProcess, type ProcessResult } from "./process.js";
import { providers } from "./contracts.js";
export type Probe = Pick<
  ProcessResult,
  "code" | "stdout" | "stderr" | "failure"
>;
export function assessCatalog(probe: Probe) {
  if (probe.failure)
    return {
      status: "tested_failed",
      reason: `CLI catalog probe ${probe.failure}. No unattended access established.`,
    };
  // The CLI can exit 0 and return empty arrays even when remote discovery failed.
  if (/451|no_biscuit_no_service/.test(probe.stderr))
    return {
      status: "tested_failed",
      reason:
        "CLI remote catalog returned HTTP 451 (no_biscuit_no_service). Chat plugins do not establish worker access.",
    };
  if (probe.code !== 0 || /failed|error|warning: failed/i.test(probe.stderr))
    return {
      status: "tested_failed",
      reason:
        "CLI remote catalog discovery failed. Check the protected host diagnostic; no automatic retry.",
    };
  try {
    const data = JSON.parse(probe.stdout);
    if (!Array.isArray(data.installed) || !Array.isArray(data.available))
      throw Error();
    return {
      status: "not_discovered",
      reason: data.installed.length
        ? "Installed plugins require exact search-tool allowlisting and unattended invocation evidence before live execution."
        : "No installed CLI plugins. Catalog listing alone does not prove callable tools.",
    };
  } catch {
    return {
      status: "tested_failed",
      reason:
        "CLI returned an unsupported catalog shape; live execution remains disabled.",
    };
  }
}
export async function probeCapabilities(signal?: AbortSignal) {
  const version = await runProcess("codex", ["--version"], { signal });
  const auth = await runProcess("codex", ["login", "status"], { signal });
  const catalog = await runProcess(
    "codex",
    ["plugin", "list", "--available", "--json"],
    { signal },
  );
  const assessment = assessCatalog(catalog);
  return {
    schemaVersion: "1.0",
    observedAt: new Date().toISOString(),
    surface: "codex-cli",
    version:
      version.stdout.trim().match(/^codex-cli [\d.]+$/m)?.[0] ?? "unavailable",
    authentication:
      auth.code === 0 &&
      !auth.failure &&
      /Logged in using ChatGPT/.test(auth.stdout + auth.stderr)
        ? "ChatGPT"
        : /API key/i.test(auth.stdout + auth.stderr)
          ? "API key"
          : "not_verified",
    gate: "blocked" as const,
    reason: assessment.reason,
    catalogStatus: assessment.status,
    providers: providers.map((name) => ({
      name,
      status: "not_discovered",
      reason: assessment.reason,
    })),
    limits: {
      wholeProbeMs: 60000,
      perProcessMs: 20000,
      outputBytes: 1048576,
      hardToolAllowlistVerified: false,
      hardToolCountEnforced: false,
    },
    nextAction:
      "Restore supported CLI catalog access on the intended persistent host, discover exact search/conversion tools, verify enforced tool restrictions and run unattended provider probes. Do not copy chat credentials.",
  };
}
