import { test } from "node:test";
import assert from "node:assert/strict";
import { assessCatalog } from "../src/capabilities.js";
import { runProcess } from "../src/process.js";
test("exit-zero catalog warnings are failures; catalog installation never implies unattended success", () => {
  assert.equal(
    assessCatalog({
      code: 0,
      stdout: '{"installed":[],"available":[]}',
      stderr: "HTTP 451 no_biscuit_no_service",
    }).status,
    "tested_failed",
  );
  assert.equal(
    assessCatalog({
      code: 0,
      stdout: '{"installed":["provider"],"available":[]}',
      stderr: "",
    }).status,
    "not_discovered",
  );
  assert.equal(
    assessCatalog({ code: 0, stdout: "{}", stderr: "" }).status,
    "tested_failed",
  );
  assert.equal(
    assessCatalog({
      code: 0,
      stdout: "",
      stderr: "Warning: failed remote catalog",
    }).status,
    "tested_failed",
  );
});
test("process runner uses stdin/arguments without shell evaluation", async () => {
  const value = "$(touch /tmp/umrah-should-never-exist); `id`";
  const r = await runProcess(
    process.execPath,
    ["-e", "process.stdin.pipe(process.stdout)"],
    { stdin: value },
  );
  assert.equal(r.stdout, value);
  assert.equal(r.code, 0);
});
test("process deadlines, output cap, cancellation and spawn failure are bounded", async () => {
  assert.equal(
    (
      await runProcess(process.execPath, ["-e", "setInterval(()=>{},1000)"], {
        timeoutMs: 80,
      })
    ).failure,
    "timeout",
  );
  assert.equal(
    (
      await runProcess(
        process.execPath,
        ["-e", 'process.stdout.write("x".repeat(20000))'],
        { maxBytes: 100 },
      )
    ).failure,
    "output_limit",
  );
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 80);
  assert.equal(
    (
      await runProcess(process.execPath, ["-e", "setInterval(()=>{},1000)"], {
        signal: controller.signal,
      })
    ).failure,
    "cancelled",
  );
  assert.equal(
    (await runProcess("/nonexistent/umrah-command", [])).failure,
    "spawn_failed",
  );
});
test("deadline terminates descendant processes on Linux", async () => {
  const r = await runProcess(
    process.execPath,
    [
      "-e",
      `const {spawn}=require('node:child_process');const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'});console.log(child.pid);setInterval(()=>{},1000);`,
    ],
    { timeoutMs: 300 },
  );
  assert.equal(r.failure, "timeout");
  const pid = Number(r.stdout.trim());
  assert.ok(pid > 0);
  await new Promise((resolve) => setTimeout(resolve, 50));
  try {
    const { readFileSync } = await import("node:fs");
    const state = readFileSync("/proc/" + pid + "/stat", "utf8")
      .split(") ")[1]!
      .split(" ")[0];
    assert.ok(["Z", "X"].includes(state));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
});
