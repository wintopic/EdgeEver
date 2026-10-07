import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  createYtDlpManager,
  parseSha256Sums,
  releaseTagFromUrl,
  startYtDlpMaintenance,
  ytDlpAssetName,
  ytDlpExecutableName,
} from "./yt-dlp-tool.mjs";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

describe("yt-dlp release selection", () => {
  test("picks the standalone binary for each desktop target", () => {
    expect(ytDlpAssetName("darwin", "arm64")).toBe("yt-dlp_macos");
    expect(ytDlpAssetName("darwin", "x64")).toBe("yt-dlp_macos");
    expect(ytDlpAssetName("win32", "x64")).toBe("yt-dlp.exe");
    expect(ytDlpAssetName("win32", "arm64")).toBe("yt-dlp_arm64.exe");
    expect(ytDlpAssetName("linux", "x64")).toBe("yt-dlp_linux");
    expect(ytDlpAssetName("linux", "arm64")).toBe("yt-dlp_linux_aarch64");
    expect(ytDlpAssetName("freebsd", "x64")).toBeNull();
    expect(ytDlpExecutableName("win32")).toBe("yt-dlp.exe");
    expect(ytDlpExecutableName("darwin")).toBe("yt-dlp");
  });

  test("reads GNU checksum lines and release tags", () => {
    const sums = parseSha256Sums("abc\n0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef  yt-dlp_macos\n");
    expect(sums.get("yt-dlp_macos")).toBe("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    expect(releaseTagFromUrl("https://github.com/yt-dlp/yt-dlp/releases/tag/2026.08.19")).toBe("2026.08.19");
    expect(releaseTagFromUrl("https://github.com/yt-dlp/yt-dlp/releases/latest")).toBeNull();
  });
});

const response = ({ url, status = 200, body = "", stream = false }) => {
  const payload = Buffer.from(body);
  const result = {
    ok: status >= 200 && status < 300,
    status,
    url,
    text: async () => (typeof body === "string" ? body : payload.toString("utf8")),
    arrayBuffer: async () => Uint8Array.from(payload).buffer,
  };
  if (stream) {
    result.body = new ReadableStream({
      start(controller) {
        const chunk = 32_768;
        for (let offset = 0; offset < payload.byteLength; offset += chunk) {
          controller.enqueue(payload.subarray(offset, offset + chunk));
        }
        controller.close();
      },
    });
  }
  return result;
};

const fakeRelease = ({ tag, asset, body, checksum, stream = false }) => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.endsWith("/releases/latest")) {
      return response({
        url: `https://github.com/yt-dlp/yt-dlp/releases/tag/${tag}`,
        body: `<a href="/releases/tag/${tag}">`,
      });
    }
    if (url.endsWith("/SHA2-256SUMS")) {
      return response({ url, body: `${checksum ?? sha256(body)}  ${asset}\n` });
    }
    if (url.endsWith(`/${asset}`)) return response({ url, body, stream });
    return response({ url, status: 404, body: "" });
  };
  return { calls, fetchImpl };
};

describe("yt-dlp install and update", () => {
  test("downloads a missing binary, skips the same version, and replaces a newer release", async () => {
    const directory = await mkdtemp(join(tmpdir(), "edgeever-yt-dlp-"));
    const diagnostics = [];
    let tag = "2026.08.19";
    let body = Buffer.alloc(120_000, 7);
    const reported = () => tag;
    const release = () => fakeRelease({ tag, asset: "yt-dlp_macos", body });
    let current = release();
    const manager = createYtDlpManager({
      directory,
      platform: "darwin",
      arch: "arm64",
      fetch: (url, init) => current.fetchImpl(url, init),
      readVersion: async () => reported(),
      onDiagnostic: (event, details) => diagnostics.push({ event, details }),
    });

    expect(manager.status()).toMatchObject({ state: "idle", version: null, errorCode: null });
    await manager.ensure();
    expect(manager.status()).toMatchObject({ state: "ready", version: "2026.08.19", errorCode: null });
    expect(await readFile(join(directory, "yt-dlp"))).toEqual(body);
    expect((await stat(join(directory, "yt-dlp"))).mode & 0o111).toBeGreaterThan(0);
    expect(diagnostics.map((item) => item.event)).toEqual(["yt-dlp.installed"]);

    const callsAfterInstall = current.calls.length;
    current = release();
    await manager.ensure();
    expect(current.calls.some((url) => url.endsWith("/yt-dlp_macos"))).toBe(false);
    expect(current.calls.length).toBeLessThan(callsAfterInstall);

    tag = "2026.09.27";
    body = Buffer.alloc(120_000, 9);
    current = release();
    await manager.ensure();
    expect(manager.status()).toMatchObject({ state: "ready", version: "2026.09.27", errorCode: null });
    expect(await readFile(join(directory, "yt-dlp"))).toEqual(body);
    expect(diagnostics.at(-1)).toEqual({ event: "yt-dlp.updated", details: { version: "2026.09.27" } });
    await rm(directory, { recursive: true, force: true });
  });

  test("keeps the installed binary when a newer download fails its checksum", async () => {
    const directory = await mkdtemp(join(tmpdir(), "edgeever-yt-dlp-"));
    let tag = "2026.08.19";
    let body = Buffer.alloc(120_000, 3);
    let checksum = null;
    const manager = createYtDlpManager({
      directory,
      platform: "darwin",
      arch: "arm64",
      fetch: (url) => fakeRelease({ tag, asset: "yt-dlp_macos", body, checksum }).fetchImpl(url),
      readVersion: async () => tag,
    });
    await manager.ensure();
    const installed = await readFile(join(directory, "yt-dlp"));

    tag = "2026.09.27";
    body = Buffer.alloc(120_000, 4);
    checksum = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    await manager.ensure();
    expect(manager.status()).toMatchObject({
      state: "ready",
      version: "2026.08.19",
      errorCode: "checksum_mismatch",
    });
    expect(await readFile(join(directory, "yt-dlp"))).toEqual(installed);
    await rm(directory, { recursive: true, force: true });
  });

  test("reports a failed first download without leaving a binary", async () => {
    const directory = await mkdtemp(join(tmpdir(), "edgeever-yt-dlp-"));
    const manager = createYtDlpManager({
      directory,
      platform: "darwin",
      arch: "arm64",
      fetch: async () => response({ url: "https://github.com/yt-dlp/yt-dlp/releases/latest", status: 503 }),
      readVersion: async () => "2026.08.19",
    });
    await manager.ensure();
    expect(manager.status()).toMatchObject({ state: "failed", version: null, errorCode: "http", httpStatus: 503 });
    await expect(stat(join(directory, "yt-dlp"))).rejects.toThrow();
    await rm(directory, { recursive: true, force: true });
  });

  test("writes a streamed release body in chunks", async () => {
    const directory = await mkdtemp(join(tmpdir(), "edgeever-yt-dlp-"));
    const body = Buffer.alloc(120_000, 11);
    const manager = createYtDlpManager({
      directory,
      platform: "darwin",
      arch: "arm64",
      fetch: (url) => fakeRelease({ tag: "2026.08.19", asset: "yt-dlp_macos", body, stream: true }).fetchImpl(url),
      readVersion: async () => "2026.08.19",
    });
    await manager.ensure();
    expect(manager.status()).toMatchObject({ state: "ready", version: "2026.08.19", errorCode: null });
    expect(await readFile(join(directory, "yt-dlp"))).toEqual(body);
    await rm(directory, { recursive: true, force: true });
  });

  test("starts the download after the window is open and does not await it", () => {
    const main = readFileSync(new URL("./index.mjs", import.meta.url), "utf8");
    const windowAt = main.indexOf("await createWindow()");
    const confirmAt = main.indexOf("await confirmMacInstallation()");
    const startAt = main.indexOf("startYtDlpMaintenance(");
    expect(windowAt).toBeGreaterThan(0);
    expect(confirmAt).toBeGreaterThan(windowAt);
    expect(startAt).toBeGreaterThan(confirmAt);
    expect(main).toContain("ytDlpMaintenanceTimer = setTimeout");
    expect(main).toContain("clearTimeout(ytDlpMaintenanceTimer)");
    expect(main).not.toContain("await startYtDlpMaintenance");
    expect(main).not.toContain("await ytDlpManager.ensure");
  });

  test("schedules a later check and can stop it", () => {
    const calls = [];
    let scheduled = null;
    const stop = startYtDlpMaintenance({
      ensure: () => {
        calls.push("now");
        return Promise.resolve();
      },
    }, {
      intervalMs: 50,
      schedule: (callback) => {
        scheduled = callback;
        return 7;
      },
      cancel: (timer) => {
        calls.push(timer);
      },
    });
    scheduled();
    stop();
    expect(calls).toEqual(["now", "now", 7]);
  });
});
