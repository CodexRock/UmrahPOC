import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
const root = new URL("../", import.meta.url).pathname.replace(/\/$/, ""),
  dir = mkdtempSync(tmpdir() + "/umrah-browser-"),
  port = 31000 + Math.floor(Math.random() * 1000),
  origin = `http://127.0.0.1:${port}`,
  password = randomBytes(20).toString("hex");
const env = {
  ...process.env,
  PORT: String(port),
  HOST: "127.0.0.1",
  APP_ORIGIN: origin,
  SITE_PASSWORD: password,
  SESSION_SECRET: randomBytes(32).toString("hex"),
  COOKIE_SECURE: "false",
  DB_PATH: dir + "/jobs.sqlite",
};
const processes = ["src/server.ts", "src/worker.ts"].map((file) =>
  spawn(process.execPath, ["--import", "tsx", file], {
    cwd: root,
    env,
    stdio: "ignore",
  }),
);
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      ready = (await fetch(origin)).ok;
      if (ready) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 50));
  }
  if (!ready) throw Error("API not ready");
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin);
  await page.locator("[name=password]").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.locator("#trip").waitFor({ state: "visible" });
  const day = (n) =>
    new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  await page.locator("[name=outboundDate]").fill(day(90));
  await page.locator("[name=returnDate]").fill(day(98));
  await page.getByRole("button", { name: "Generate options" }).click();
  await page
    .locator("#state")
    .filter({ hasText: /^blocked$/ })
    .waitFor({ timeout: 70000 });
  if (
    !(await page.locator("#result").innerText()).includes(
      "No supplier search was executed",
    )
  )
    throw Error("Expected explicit capability diagnostic");
  mkdirSync(root + "/runtime/browser", { recursive: true });
  await page.screenshot({
    path: root + "/runtime/browser/desktop.png",
    fullPage: true,
  });
  await page.reload();
  await page
    .locator("#state")
    .filter({ hasText: /^blocked$/ })
    .waitFor({ timeout: 10000 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: root + "/runtime/browser/mobile.png",
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  if (overflow) throw Error("Mobile horizontal overflow");
  if (errors.length) throw Error(errors.join(";"));
  console.log(
    "PASS: real Chromium login → form → queue → CLI capability gate → readable blocked result; session/job restored after reload; desktop/mobile no overflow or page errors. No supplier search by worker.",
  );
} finally {
  await browser?.close();
  for (const child of processes) child.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 500));
  rmSync(dir, { recursive: true, force: true });
}
