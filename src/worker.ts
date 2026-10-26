import { Store, dbPath } from "./store.js";
import { blockedResult, RequestSchema } from "./contracts.js";
import { probeCapabilities } from "./capabilities.js";
const store = new Store(dbPath);
let stopping = false,
  active: AbortController | undefined;
const shutdown = () => {
  stopping = true;
  active?.abort();
};
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, shutdown);
while (!stopping) {
  store.purge();
  const job = store.claim();
  if (!job) {
    await new Promise((r) => setTimeout(r, 250));
    continue;
  }
  const id = String(job.id),
    controller = new AbortController();
  active = controller;
  const watch = setInterval(() => {
    if (store.get(id, String(job.owner))?.state !== "running")
      controller.abort();
  }, 100);
  try {
    const parsed = RequestSchema.safeParse(JSON.parse(String(job.input)));
    if (!parsed.success) {
      store.finish(id, {
        status: "failed",
        reason: "Stored request no longer passes validation.",
      });
      continue;
    }
    const capability = await probeCapabilities(controller.signal);
    const result = blockedResult(id, parsed.data);
    result.providers = capability.providers;
    result.warnings = [
      capability.reason,
      "No supplier search was executed by this worker. Chat probes are separate evidence.",
      "Inventory and religious/entry eligibility unverified.",
    ];
    store.finish(id, { ...result, capability });
  } catch {
    store.finish(id, {
      status: "failed",
      reason:
        "Worker validation or capability probe failed; no provider search verified.",
    });
  } finally {
    clearInterval(watch);
    active = undefined;
  }
}
store.db.close();
