import { execFile } from "node:child_process";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export const MAX_AUDIO_BYTES = 24 * 1024 * 1024;
export const MAX_DURATION_SECONDS = 30 * 60;
export const SPEECH_TRANSCRIPTION_INTERVAL_MS = 20_000;
const DOWNLOAD_TIMEOUT_MS = 180_000;
const TRANSCRIBE_TIMEOUT_MS = 180_000;

const PUBLIC_VIDEO_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "bilibili.com",
  "www.bilibili.com",
  "m.bilibili.com",
]);

const FAILURE_CODES = new Set([
  "duration_limit",
  "unsupported_source",
  "audio_too_large",
  "download_failed",
  "transcribe_failed",
  "empty_transcript",
  "note_changed",
  "note_write_failed",
  "credentials_unavailable",
  "disabled",
]);

const fail = (code) => {
  const error = new Error(code);
  error.code = code;
  return error;
};

export const isPublicVideoSourceUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && PUBLIC_VIDEO_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

export const transcriptAudioBaseName = (memoId) => {
  const value = String(memoId ?? "");
  if (!value || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  return value;
};

// Keep this aligned with packages/shared/src/video-cookie-browser.ts.
export const COOKIE_BROWSERS = Object.freeze([
  "chrome",
  "chromium",
  "edge",
  "firefox",
  "safari",
  "brave",
  "opera",
  "vivaldi",
  "whale",
]);
export const DEFAULT_COOKIE_BROWSER = "chrome";

export const normalizeCookieBrowser = (value) => {
  const name = String(value ?? "").trim().toLowerCase();
  if (name === "none") return "none";
  return COOKIE_BROWSERS.includes(name) ? name : DEFAULT_COOKIE_BROWSER;
};

export const readCookieBrowserPreference = async (filePath) => {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8"));
    return normalizeCookieBrowser(parsed?.browser);
  } catch {
    return DEFAULT_COOKIE_BROWSER;
  }
};

export const writeCookieBrowserPreference = async (filePath, browser) => {
  const name = String(browser ?? "").trim().toLowerCase();
  if (name !== "none" && !COOKIE_BROWSERS.includes(name)) {
    throw Object.assign(new Error("unsupported_browser"), { code: "unsupported_browser" });
  }
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify({ browser: name })}\n`, { mode: 0o600 });
  return { browser: name };
};

export const bestAudioArguments = (sourceUrl, outputTemplate, browser = DEFAULT_COOKIE_BROWSER) => {
  const selected = normalizeCookieBrowser(browser);
  return [
    "--no-playlist",
    "--no-progress",
    "--no-mtime",
    "--no-cache-dir",
    "--restrict-filenames",
    "-f",
    "bestaudio",
    "--max-filesize",
    "24M",
    ...(selected === "none" ? [] : ["--cookies-from-browser", selected]),
    "-o",
    outputTemplate,
    "--",
    sourceUrl,
  ];
};

export const formatTranscriptTimestamp = (seconds) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remain = total % 60;
  const clock = `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${clock}` : clock;
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

const plain = (value) => escapeHtml(String(value).replace(/\s+/g, " ").trim())
  .replace(/\]\(/g, "] (")
  .replace(/\[/g, "［")
  .replace(/\]/g, "］");

export const videoTimestampUrl = (sourceUrl, platform, seconds) => {
  const time = Math.max(0, Math.floor(Number(seconds) || 0));
  if (platform === "youtube") {
    return sourceUrl.includes("/shorts/")
      ? `${sourceUrl}?t=${time}`
      : `${sourceUrl}&t=${time}s`;
  }
  return sourceUrl.includes("?")
    ? `${sourceUrl}&t=${time}`
    : `${sourceUrl}?t=${time}`;
};

export const cuesFromTranscription = (result) => {
  const segments = Array.isArray(result?.segments) ? result.segments : [];
  return segments.flatMap((segment) => {
    const text = String(segment?.text ?? "").replace(/\s+/g, " ").trim();
    const start = Number(segment?.startSecond);
    const end = Number(segment?.endSecond);
    if (!text || !Number.isFinite(start) || !Number.isFinite(end)) return [];
    return [{ start: Math.max(0, start), end: Math.max(start, end), text }];
  });
};

export const buildTranscriptMarkdown = ({ label, text, cues, sourceUrl, platform }) => {
  const summary = plain(label ?? "");
  if (!summary) return null;
  const lines = (cues ?? []).map((cue) => {
    const body = plain(cue.text);
    if (!body) return "";
    return `- [${formatTranscriptTimestamp(cue.start)}](${videoTimestampUrl(sourceUrl, platform, cue.start)}) ${body}`;
  }).filter(Boolean);
  const inner = lines.length ? lines.join("\n") : plain(text ?? "");
  if (!inner) return null;
  return ["<details>", `<summary>${summary}</summary>`, "", inner, "", "</details>"].join("\n");
};

const VIDEO_NOTE_MARKER = /<!--\s*edgeever-video-v1:[A-Za-z0-9_=-]+\s*-->/g;

export const applyTranscript = (markdown, placeholder, block) => {
  const source = String(markdown ?? "");
  const markers = source.match(VIDEO_NOTE_MARKER) ?? [];
  const body = markers.length ? source.replace(VIDEO_NOTE_MARKER, "") : source;
  const needle = String(placeholder ?? "").trim();
  const addition = String(block ?? "").trim();
  if (!addition) return source;
  let next = body;
  if (needle) {
    const lines = body.split("\n");
    const index = lines.findIndex((line) => line.trim() === needle);
    if (index >= 0) {
      lines.splice(index, 1, addition);
      next = lines.join("\n");
    } else {
      next = `${body.trim()}\n\n${addition}`;
    }
  } else {
    next = `${body.trim()}\n\n${addition}`;
  }
  const cleaned = `${next.replace(/\n{3,}/g, "\n\n").trim()}\n`;
  if (!markers.length) return cleaned;
  return `${cleaned.trim()}\n\n${markers.join("\n")}\n`;
};

export const transcriptionRequest = ({ baseUrl, apiKey, modelId, audio, abortSignal }) => ({
  provider: { baseURL: baseUrl, apiKey },
  modelId,
  audio,
  maxRetries: 0,
  abortSignal,
  providerOptions: { openai: { timestampGranularities: ["segment"] } },
});

export const transcribeLocalAudio = async (input, deps = {}) => {
  const request = transcriptionRequest(input);
  const createProvider = deps.createProvider ?? (await import("@ai-sdk/openai")).createOpenAI;
  const transcribe = deps.transcribe ?? (await import("ai")).transcribe;
  const provider = createProvider(request.provider);
  return transcribe({
    model: provider.transcription(request.modelId),
    audio: request.audio,
    maxRetries: request.maxRetries,
    abortSignal: request.abortSignal,
    providerOptions: request.providerOptions,
  });
};

const instanceUrl = (baseUrl, path) => `${String(baseUrl).replace(/\/+$/, "")}${path}`;

const requestJson = async (fetchImpl, session, path, init = {}) => {
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${session.token}`,
  };
  if (init.body) headers["content-type"] = "application/json";
  const response = await fetchImpl(instanceUrl(session.baseUrl, path), {
    method: init.method ?? "GET",
    headers,
    body: init.body,
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
};

const removeAudioFiles = async (directory, baseName) => {
  if (!directory || !baseName) return;
  const names = await readdir(directory).catch(() => []);
  await Promise.all(names
    .filter((name) => name === baseName || name.startsWith(`${baseName}.`))
    .map((name) => unlink(join(directory, name)).catch(() => undefined)));
};

const downloadBestAudio = async ({ execFileImpl, binaryPath, sourceUrl, directory, baseName, timeoutMs, browser }) => {
  await mkdir(directory, { recursive: true });
  const template = join(directory, `${baseName}.%(ext)s`);
  const selected = typeof browser === "function" ? await browser() : browser;
  await new Promise((resolve, reject) => {
    execFileImpl(binaryPath, bestAudioArguments(sourceUrl, template, selected), {
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 4 * 1024 * 1024,
    }, (error) => {
      if (error) reject(fail("download_failed"));
      else resolve();
    });
  });
  const names = await readdir(directory);
  const audioName = names.find((name) => name.startsWith(`${baseName}.`) && !name.endsWith(".part") && !name.endsWith(".ytdl"));
  if (!audioName) throw fail("download_failed");
  return join(directory, audioName);
};

const failureCode = (error) => FAILURE_CODES.has(error?.code) ? error.code : "transcribe_failed";

const processClaimedJob = async (deps, session, job) => {
  const maxAudioBytes = deps.maxAudioBytes ?? MAX_AUDIO_BYTES;
  const maxDurationSeconds = deps.maxDurationSeconds ?? MAX_DURATION_SECONDS;
  const memoId = job.memoId;
  const baseName = transcriptAudioBaseName(memoId);
  let directory = null;
  let settled = false;
  const finish = (status, errorCode = null) => requestJson(
    deps.fetchImpl,
    session,
    `/api/v1/video-transcript-jobs/${encodeURIComponent(memoId)}/finish`,
    {
      method: "POST",
      body: JSON.stringify({
        status,
        errorCode,
        claimedAt: job.claimedAt,
      }),
    },
  );
  try {
    directory = await deps.audioDirectory();
    const memoResponse = await requestJson(deps.fetchImpl, session, `/api/v1/memos/${encodeURIComponent(memoId)}`);
    const memo = memoResponse.payload?.memo;
    if (!memoResponse.ok || !memo) throw fail("note_write_failed");
    if (memo.contentHash !== job.contentHash) throw fail("note_changed");
    if (Number(job.durationSeconds) > maxDurationSeconds) throw fail("duration_limit");
    if (!isPublicVideoSourceUrl(job.sourceUrl) || !baseName) throw fail("unsupported_source");
    const tool = deps.ytDlpStatus();
    if (tool?.state !== "ready" || !tool.path) throw fail("download_failed");
    const prepared = await requestJson(deps.fetchImpl, session, "/api/v1/ai/transcription-settings/prepare", {
      method: "POST",
      body: "{}",
    });
    const standard = prepared.payload?.provider ?? "openai-compatible";
    if (!prepared.ok || !prepared.payload?.enabled || !prepared.payload.apiKey || !prepared.payload.baseUrl || !prepared.payload.modelId || standard !== "openai-compatible") {
      throw fail(prepared.ok ? "disabled" : "credentials_unavailable");
    }
    const audioPath = await downloadBestAudio({
      execFileImpl: deps.execFileImpl,
      binaryPath: tool.path,
      sourceUrl: job.sourceUrl,
      directory,
      baseName,
      timeoutMs: deps.downloadTimeoutMs ?? DOWNLOAD_TIMEOUT_MS,
      browser: deps.cookieBrowser,
    });
    const audioStat = await stat(audioPath);
    if (audioStat.size > maxAudioBytes) throw fail("audio_too_large");
    if (audioStat.size <= 0) throw fail("download_failed");
    const audio = await readFile(audioPath);
    const result = await transcribeLocalAudio({
      baseUrl: prepared.payload.baseUrl,
      apiKey: prepared.payload.apiKey,
      modelId: prepared.payload.modelId,
      audio,
      abortSignal: AbortSignal.timeout(deps.transcribeTimeoutMs ?? TRANSCRIBE_TIMEOUT_MS),
    }, deps);
    const cues = cuesFromTranscription(result);
    const block = buildTranscriptMarkdown({
      label: job.transcriptLabel,
      text: result?.text,
      cues,
      sourceUrl: job.sourceUrl,
      platform: job.platform,
    });
    if (!block) throw fail("empty_transcript");
    const saved = await requestJson(deps.fetchImpl, session, `/api/v1/memos/${encodeURIComponent(memoId)}`, {
      method: "PATCH",
      body: JSON.stringify({
        contentMarkdown: applyTranscript(memo.contentMarkdown, job.placeholderText, block),
        expectedRevision: memo.revision,
        expectedContentHash: memo.contentHash,
      }),
    });
    if (saved.status === 409) throw fail("note_changed");
    if (!saved.ok) throw fail("note_write_failed");
    const done = await finish("ready");
    if (!done.ok) throw fail("note_write_failed");
    settled = true;
    return { outcome: "ready", memoId };
  } catch (error) {
    if (!settled) await finish("failed", failureCode(error)).catch(() => undefined);
    return { outcome: "failed", reason: failureCode(error), memoId };
  } finally {
    await removeAudioFiles(directory, baseName);
  }
};

export const runSpeechTranscriptionPass = async (deps) => {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const session = deps.getSession() ?? {};
  if (!session.baseUrl || !session.token) return { outcome: "skipped", reason: "signed_out" };
  const bound = { ...deps, fetchImpl, execFileImpl: deps.execFileImpl ?? execFile };
  try {
    const settings = await requestJson(fetchImpl, session, "/api/v1/ai/transcription-settings");
    if (!settings.ok || settings.payload?.enabled !== true) return { outcome: "skipped", reason: "disabled" };
    const tool = bound.ytDlpStatus();
    if (tool?.state !== "ready" || !tool.path) return { outcome: "skipped", reason: "yt_dlp" };
    const listed = await requestJson(fetchImpl, session, "/api/v1/video-transcript-jobs");
    if (!listed.ok) return { outcome: "skipped", reason: "list_failed" };
    const waiting = listed.payload?.jobs?.[0];
    if (!waiting?.memoId) return { outcome: "skipped", reason: "idle" };
    const claimed = await requestJson(
      fetchImpl,
      session,
      `/api/v1/video-transcript-jobs/${encodeURIComponent(waiting.memoId)}/claim`,
      { method: "POST", body: "{}" },
    );
    if (!claimed.ok || !claimed.payload?.job?.claimedAt) return { outcome: "skipped", reason: "claimed" };
    return processClaimedJob(bound, session, claimed.payload.job);
  } catch {
    return { outcome: "failed", reason: "transcribe_failed" };
  }
};

export const createSpeechTranscriptionRunner = (options) => ({
  pass: () => runSpeechTranscriptionPass(options),
});

export const startSpeechTranscription = (
  runner,
  { intervalMs = SPEECH_TRANSCRIPTION_INTERVAL_MS, schedule = setInterval, cancel = clearInterval } = {},
) => {
  let stopped = false;
  let running = false;
  const tick = () => {
    if (stopped || running) return;
    running = true;
    Promise.resolve()
      .then(() => runner.pass())
      .catch(() => undefined)
      .finally(() => {
        running = false;
      });
  };
  const timer = schedule(tick, intervalMs);
  timer?.unref?.();
  tick();
  return () => {
    stopped = true;
    cancel(timer);
  };
};
