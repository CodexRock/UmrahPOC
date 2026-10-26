import { mkdirSync, writeFileSync } from "node:fs";
import { probeCapabilities } from "../src/capabilities.js";
const report = await probeCapabilities();
mkdirSync("runtime", { recursive: true, mode: 0o700 });
writeFileSync("runtime/capabilities.json", JSON.stringify(report, null, 2), {
  mode: 0o600,
});
console.log(JSON.stringify(report, null, 2));
if (report.gate === "blocked") process.exitCode = 2;
