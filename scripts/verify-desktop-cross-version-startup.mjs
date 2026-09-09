import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, statSync } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const [oldExecutableInput, newExecutableInput] = process.argv.slice(2);
const oldExecutable = resolve(oldExecutableInput || "");
const newExecutable = resolve(newExecutableInput || "");
for (const [label, executable] of [["old", oldExecutable], ["new", newExecutable]]) {
  if (!executable || !existsSync(executable) || !statSync(executable).isFile()) {
    throw new Error(`${label} desktop executable is missing: ${executable || "<not provided>"}`);
  }
}

const testDirectory = mkdtempSync(join(tmpdir(), "edgeever-cross-version-"));
const userDataDirectory = join(testDirectory, "profile");
const logPath = join(userDataDirectory, "logs", "desktop.log");
const wait = (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

const readEntries = () => {
  if (!existsSync(logPath)) return [];
  return readFileSync(logPath, "utf8").split(/\r?\n/).flatMap((line) => {
    try { return [JSON.parse(line)]; } catch { return []; }
  });
};

const stopProcess = async (child) => {
  if (child.exitCode !== null || !child.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  } else {
    child.kill("SIGTERM");
  }
  await Promise.race([
    new Promise((resolveClosed) => child.once("close", resolveClosed)),
    wait(5_000),
  ]);
};

const launchAndWait = async ({ executable, expectedUrlPrefix, requiredEvents }) => {
  const output = [];
  let processError = null;
  const child = spawn(executable, [`--user-data-dir=${userDataDirectory}`], {
    env: { ...process.env, EDGE_EVER_DISABLE_AUTO_UPDATE: "1" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  child.on("error", (error) => { processError = error; });
  child.stdout.on("data", (chunk) => output.push(chunk.toString()));
  child.stderr.on("data", (chunk) => output.push(chunk.toString()));

  const timeoutMs = Number(process.env.EDGE_EVER_DESKTOP_STARTUP_TIMEOUT_MS) || 45_000;
  const deadline = Date.now() + timeoutMs;
  try {
    while (Date.now() < deadline) {
      const entries = readEntries();
      const events = new Set(entries.map((entry) => entry.event));
      const loaded = entries.find((entry) =>
        entry.event === "renderer.loaded" && String(entry.url || "").startsWith(expectedUrlPrefix));
      if (loaded && requiredEvents.every((event) => events.has(event))) {
        return { events: [...events], rendererUrl: loaded.url };
      }
      if (processError || child.exitCode !== null) break;
      await wait(100);
    }
    throw new Error([
      `Desktop transition startup failed for ${executable} (exit=${child.exitCode ?? "running"}).`,
      `Expected renderer URL prefix: ${expectedUrlPrefix}`,
      processError && `Process error: ${processError.message}`,
      existsSync(logPath) && `Diagnostic log:\n${readFileSync(logPath, "utf8")}`,
      output.length > 0 && `Process output:\n${output.join("")}`,
    ].filter(Boolean).join("\n\n"));
  } finally {
    await stopProcess(child);
  }
};

try {
  await mkdir(userDataDirectory, { recursive: true });
  const oldResult = await launchAndWait({
    executable: oldExecutable,
    expectedUrlPrefix: "file://",
    requiredEvents: ["sidecar.ready", "renderer.bootstrap-ready"],
  });
  await rename(logPath, join(userDataDirectory, "logs", "desktop-old-version.log"));

  const newResult = await launchAndWait({
    executable: newExecutable,
    expectedUrlPrefix: "edgeever-app://app/",
    requiredEvents: ["renderer.origin-ready", "sidecar.ready", "renderer.bootstrap-ready"],
  });
  const markerPath = join(userDataDirectory, "renderer-origin-v1-migrated");
  if (!existsSync(markerPath)) throw new Error("The upgraded desktop did not persist its renderer origin migration marker");
  console.log(JSON.stringify({ ok: true, oldResult, newResult }));
} finally {
  await rm(testDirectory, { recursive: true, force: true });
}
