import { spawn } from "node:child_process";

export interface ProcessResult {
  code: number | null;
  stdout: string;
  stderr: string;
  failure?: "timeout" | "cancelled" | "output_limit" | "spawn_failed";
}
// Fixed executables/argument arrays are chosen by application code, never request input.
// Linux process groups ensure descendants are killed on cancellation and deadlines.
export function runProcess(
  executable: string,
  args: readonly string[],
  options: {
    cwd?: string;
    stdin?: string;
    signal?: AbortSignal;
    timeoutMs?: number;
    maxBytes?: number;
  } = {},
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    if (options.signal?.aborted)
      return resolve({
        code: null,
        stdout: "",
        stderr: "",
        failure: "cancelled",
      });
    let stdout = "",
      stderr = "",
      bytes = 0,
      failure: ProcessResult["failure"];
    const child = spawn(executable, [...args], {
      cwd: options.cwd,
      shell: false,
      detached: process.platform !== "win32",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const stop = (reason: ProcessResult["failure"]) => {
      failure ??= reason;
      try {
        if (child.pid && process.platform !== "win32")
          process.kill(-child.pid, "SIGKILL");
        else child.kill("SIGKILL");
      } catch {}
    };
    const abort = () => stop("cancelled");
    options.signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => stop("timeout"), options.timeoutMs ?? 20000);
    const capture = (channel: "stdout" | "stderr", chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > (options.maxBytes ?? 1024 * 1024)) {
        stop("output_limit");
        return;
      }
      if (channel === "stdout") stdout += chunk.toString();
      else stderr += chunk.toString();
    };
    child.stdout.on("data", (chunk) => capture("stdout", chunk));
    child.stderr.on("data", (chunk) => capture("stderr", chunk));
    child.on("error", () => {
      failure ??= "spawn_failed";
    });
    child.stdin.on("error", () => {});
    child.stdin.end(options.stdin ?? "");
    child.on("close", (code) => {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abort);
      resolve({ code, stdout, stderr, ...(failure ? { failure } : {}) });
    });
  });
}
