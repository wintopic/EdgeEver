import { createHash, timingSafeEqual } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { chmod, mkdir, open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { restrictDirectory, restrictFile } from "./file-permissions.mjs";

const RELEASES_LATEST_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest";
const USER_AGENT = "EdgeEverDesktop yt-dlp-fetch";
const MIN_BINARY_BYTES = 100_000;
const MAX_BINARY_BYTES = 80 * 1024 * 1024;
const MAX_SUMS_BYTES = 1024 * 1024;

const toolError = (code, httpStatus = null) => {
  const error = new Error(code);
  error.code = code;
  error.httpStatus = httpStatus;
  return error;
};

// Official standalone builds. The 2.9 MB `yt-dlp` zipapp still needs a system Python.
export const ytDlpAssetName = (platform, arch) => {
  if (platform === "darwin") return "yt-dlp_macos";
  if (platform === "win32" && arch === "arm64") return "yt-dlp_arm64.exe";
  if (platform === "win32") return "yt-dlp.exe";
  if (platform === "linux" && arch === "arm64") return "yt-dlp_linux_aarch64";
  if (platform === "linux" && arch === "x64") return "yt-dlp_linux";
  return null;
};

export const ytDlpExecutableName = (platform) => (platform === "win32" ? "yt-dlp.exe" : "yt-dlp");

export const parseSha256Sums = (text) => {
  const sums = new Map();
  for (const line of String(text).split(/\r?\n/)) {
    const match = /^([a-fA-F0-9]{64})\s+\*?(\S+)\s*$/.exec(line.trim());
    if (match) sums.set(match[2], match[1].toLowerCase());
  }
  return sums;
};

export const releaseTagFromUrl = (url) => {
  const match = /\/releases\/(?:tag|download)\/([^/?#]+)/.exec(String(url));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

const hashesMatch = (actual, expected) => {
  const left = Buffer.from(actual, "hex");
  const right = Buffer.from(expected, "hex");
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
};

const readInstalledVersion = async (binaryPath) => {
  const stdout = await new Promise((resolve, reject) => {
    execFile(binaryPath, ["--version"], { timeout: 15_000, windowsHide: true }, (error, output) => {
      if (error) reject(error);
      else resolve(output);
    });
  });
  return String(stdout).trim().split(/\s+/)[0] ?? "";
};

const fetchResponse = async (fetchImpl, url, timeoutMs) => {
  let response;
  try {
    response = await fetchImpl(url, {
      redirect: "follow",
      headers: { "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw toolError(error?.name === "TimeoutError" ? "timeout" : "network");
  }
  if (!response.ok) throw toolError("http", response.status);
  return response;
};

const fetchBytes = async (fetchImpl, url, { maxBytes, timeoutMs }) => {
  const response = await fetchResponse(fetchImpl, url, timeoutMs);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > maxBytes) throw toolError("unexpected_size");
  return bytes;
};

// Stream to disk and hash one chunk at a time. Buffering the whole binary and
// hashing it in one call stalls the Electron main process and freezes the window.
const downloadHashed = async (fetchImpl, url, destination, { maxBytes, minBytes, timeoutMs }) => {
  const response = await fetchResponse(fetchImpl, url, timeoutMs);
  const hash = createHash("sha256");
  let size = 0;
  const consume = (chunk) => {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.byteLength;
    if (size > maxBytes) throw toolError("unexpected_size");
    hash.update(bytes);
    return bytes;
  };
  const writeAll = async (handle, bytes) => {
    let offset = 0;
    while (offset < bytes.byteLength) {
      const { bytesWritten } = await handle.write(bytes, offset, bytes.byteLength - offset);
      if (!bytesWritten) throw toolError("storage");
      offset += bytesWritten;
    }
  };
  const webBody = response.body;
  if (webBody && typeof webBody.getReader === "function") {
    const handle = await open(destination, "w", 0o600);
    try {
      for await (const chunk of Readable.fromWeb(webBody)) {
        await writeAll(handle, consume(chunk));
      }
    } finally {
      await handle.close();
    }
  } else {
    await writeFile(destination, consume(Buffer.from(await response.arrayBuffer())));
  }
  if (size < minBytes) throw toolError("unexpected_size");
  return hash.digest("hex");
};

const latestReleaseTag = async (fetchImpl) => {
  const response = await fetchResponse(fetchImpl, RELEASES_LATEST_URL, 20_000);
  const page = await response.text();
  if (page.length > MAX_SUMS_BYTES) throw toolError("unexpected_size");
  const fromUrl = releaseTagFromUrl(response.url || "");
  const fromPage = /\/releases\/tag\/(\d{4}\.\d{2}\.\d{2}(?:\.\d+)?)/.exec(page)?.[1] ?? null;
  const tag = fromUrl && /^\d{4}\.\d{2}\.\d{2}/.test(fromUrl) ? fromUrl : fromPage;
  if (!tag || !/^\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$/.test(tag)) throw toolError("unrecognized_release");
  return tag;
};

export const createYtDlpManager = ({
  directory,
  platform,
  arch,
  fetch: fetchImpl = globalThis.fetch,
  readVersion = readInstalledVersion,
  onDiagnostic = () => {},
}) => {
  const asset = ytDlpAssetName(platform, arch);
  const binaryPath = join(directory, ytDlpExecutableName(platform));
  const partialPath = `${binaryPath}.partial`;
  const statePath = join(directory, "yt-dlp.json");
  let current = {
    state: asset ? "idle" : "failed",
    version: null,
    path: binaryPath,
    errorCode: asset ? null : "unsupported_platform",
    httpStatus: null,
  };
  let pending = null;

  const publish = (next) => {
    current = next;
  };

  const readState = async () => {
    if (!existsSync(binaryPath)) return null;
    try {
      const parsed = JSON.parse(await readFile(statePath, "utf8"));
      const version = typeof parsed?.version === "string" ? parsed.version : "";
      return version ? { version } : null;
    } catch {
      return null;
    }
  };

  const install = async (tag) => {
    const releaseBase = `https://github.com/yt-dlp/yt-dlp/releases/download/${encodeURIComponent(tag)}`;
    const sums = await fetchBytes(fetchImpl, `${releaseBase}/SHA2-256SUMS`, {
      maxBytes: MAX_SUMS_BYTES,
      timeoutMs: 20_000,
    });
    const expected = parseSha256Sums(sums.toString("utf8")).get(asset);
    if (!expected) throw toolError("checksum_missing");
    await mkdir(directory, { recursive: true });
    await restrictDirectory(directory);
    const actual = await downloadHashed(fetchImpl, `${releaseBase}/${asset}`, partialPath, {
      maxBytes: MAX_BINARY_BYTES,
      minBytes: MIN_BINARY_BYTES,
      timeoutMs: 120_000,
    });
    if (!hashesMatch(actual, expected)) throw toolError("checksum_mismatch");
    await chmod(partialPath, platform === "win32" ? 0o644 : 0o755);
    let reported = "";
    try {
      reported = await readVersion(partialPath);
    } catch {
      throw toolError("not_executable");
    }
    if (reported !== tag) throw toolError("version_mismatch");
    try {
      await rename(partialPath, binaryPath);
    } catch {
      await unlink(binaryPath).catch(() => {});
      await rename(partialPath, binaryPath);
    }
    await writeFile(statePath, `${JSON.stringify({
      version: tag,
      sha256: actual,
      asset,
      installedAt: new Date().toISOString(),
    })}\n`);
    await restrictFile(statePath);
  };

  const run = async () => {
    if (!asset) return current;
    const installed = await readState();
    publish({
      state: installed ? "ready" : "downloading",
      version: installed?.version ?? null,
      path: binaryPath,
      errorCode: null,
      httpStatus: null,
    });
    try {
      const tag = await latestReleaseTag(fetchImpl);
      if (installed?.version === tag) return current;
      publish({
        state: "downloading",
        version: installed?.version ?? null,
        path: binaryPath,
        errorCode: null,
        httpStatus: null,
      });
      await install(tag);
      publish({
        state: "ready",
        version: tag,
        path: binaryPath,
        errorCode: null,
        httpStatus: null,
      });
      onDiagnostic(installed ? "yt-dlp.updated" : "yt-dlp.installed", { version: tag });
    } catch (error) {
      const known = new Set([
        "checksum_mismatch",
        "checksum_missing",
        "version_mismatch",
        "not_executable",
        "timeout",
        "network",
        "http",
        "unexpected_size",
        "unrecognized_release",
        "storage",
      ]);
      const errorCode = known.has(error?.code)
        ? error.code
        : ["ENOENT", "EACCES", "EPERM", "ENOSPC", "EROFS"].includes(error?.code)
          ? "storage"
          : "network";
      const httpStatus = Number.isInteger(error?.httpStatus) ? error.httpStatus : null;
      publish({
        state: installed ? "ready" : "failed",
        version: installed?.version ?? null,
        path: binaryPath,
        errorCode,
        httpStatus,
      });
      onDiagnostic("yt-dlp.failed", { version: installed?.version ?? null, errorCode, httpStatus });
    } finally {
      await unlink(partialPath).catch(() => {});
    }
    return current;
  };

  return {
    status: () => ({ ...current }),
    ensure: () => {
      if (pending) return pending;
      pending = run().finally(() => {
        pending = null;
      });
      return pending;
    },
  };
};

export const startYtDlpMaintenance = (manager, { intervalMs, schedule = setInterval, cancel = clearInterval } = {}) => {
  void manager.ensure();
  if (!intervalMs) return () => {};
  const timer = schedule(() => {
    void manager.ensure();
  }, intervalMs);
  timer.unref?.();
  return () => cancel(timer);
};
