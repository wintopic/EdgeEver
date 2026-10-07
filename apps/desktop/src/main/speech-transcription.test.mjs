import { expect, test } from "bun:test";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { VIDEO_COOKIE_BROWSERS } from "../../../../packages/shared/src/video-cookie-browser.ts";
import {
  applyTranscript,
  bestAudioArguments,
  buildTranscriptMarkdown,
  COOKIE_BROWSERS,
  DEFAULT_COOKIE_BROWSER,
  readCookieBrowserPreference,
  writeCookieBrowserPreference,
  createSpeechTranscriptionRunner,
  isPublicVideoSourceUrl,
  runSpeechTranscriptionPass,
  startSpeechTranscription,
  transcriptionRequest,
} from "./speech-transcription.mjs";

const session = { baseUrl: "http://127.0.0.1:8787", token: "desktop-session" };
const apiKey = "asr-test-key";
const sourceUrl = "https://www.youtube.com/watch?v=abcdefghijk";
const placeholder = "这一集没有可用字幕";

const waitingJob = {
  memoId: "memo_abc",
  platform: "youtube",
  videoId: "abcdefghijk",
  sourceUrl,
  durationSeconds: 12,
  placeholderText: placeholder,
  transcriptLabel: "字幕实录",
  contentHash: "hash-1",
  status: "pending",
  claimedAt: null,
};

const memo = {
  id: "memo_abc",
  contentMarkdown: `# Title\n\n${placeholder}\n`,
  contentHash: "hash-1",
  revision: 0,
};

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});

const installFetch = (state) => async (url, init = {}) => {
  const path = new URL(url).pathname;
  const body = init.body ? JSON.parse(init.body) : null;
  state.calls.push({
    path,
    method: init.method ?? "GET",
    body,
    authorization: init.headers?.Authorization ?? init.headers?.authorization ?? "",
  });
  if (path === "/api/v1/ai/transcription-settings" && (init.method ?? "GET") === "GET") {
    return jsonResponse({ enabled: state.enabled });
  }
  if (path === "/api/v1/video-transcript-jobs" && (init.method ?? "GET") === "GET") {
    return jsonResponse({ jobs: state.jobs });
  }
  if (path.endsWith("/claim")) {
    if (!state.jobs.length) return jsonResponse({ error: { code: "video_transcript_not_claimed" } }, 409);
    const job = { ...state.jobs[0], status: "transcribing", claimedAt: "2026-10-06T00:00:00.000Z" };
    state.jobs = [];
    return jsonResponse({ job });
  }
  if (path.endsWith("/finish")) {
    state.finished = body;
    return jsonResponse({ ok: true });
  }
  if (path === "/api/v1/ai/transcription-settings/prepare") {
    state.prepared = true;
    return jsonResponse({
      enabled: true,
      provider: state.speechProvider ?? "openai-compatible",
      baseUrl: "https://api.example.test/v1",
      modelId: "whisper-1",
      apiKey,
    });
  }
  if (path === "/api/v1/memos/memo_abc" && (init.method ?? "GET") === "GET") {
    return jsonResponse({ memo: state.memo });
  }
  if (path === "/api/v1/memos/memo_abc" && init.method === "PATCH") {
    state.patched = body;
    return jsonResponse({ memo: { ...state.memo, revision: 1 } }, state.patchStatus ?? 200);
  }
  return jsonResponse({ error: { code: "unexpected" } }, 500);
};

const baseState = (overrides = {}) => ({
  enabled: true,
  jobs: [{ ...waitingJob }],
  memo: { ...memo },
  calls: [],
  finished: null,
  patched: null,
  prepared: false,
  ...overrides,
});

const tempDir = async () => {
  const directory = join(tmpdir(), `edgeever-transcript-${crypto.randomUUID()}`);
  await mkdir(directory, { recursive: true });
  return directory;
};

const readyTool = { state: "ready", path: "/usr/local/bin/yt-dlp" };

test("downloads bestaudio with the chosen browser cookies and without extraction or a shell", () => {
  const args = bestAudioArguments(sourceUrl, "/tmp/memo_abc.%(ext)s");
  expect(args).toContain("-f");
  expect(args).toContain("bestaudio");
  expect(args).toContain("--max-filesize");
  expect(args).toContain("--cookies-from-browser");
  expect(args[args.indexOf("--cookies-from-browser") + 1]).toBe("chrome");
  expect(args).toContain("--");
  expect(args.at(-1)).toBe(sourceUrl);
  expect(args).not.toContain("-x");
  expect(args).not.toContain("--audio-format");
  const firefox = bestAudioArguments(sourceUrl, "/tmp/memo_abc.%(ext)s", "Firefox");
  expect(firefox[firefox.indexOf("--cookies-from-browser") + 1]).toBe("firefox");
  const off = bestAudioArguments(sourceUrl, "/tmp/memo_abc.%(ext)s", "none");
  expect(off.join(" ")).not.toContain("cookie");
  const rejected = bestAudioArguments(sourceUrl, "/tmp/memo_abc.%(ext)s", "chrome:Profile --proxy");
  expect(rejected[rejected.indexOf("--cookies-from-browser") + 1]).toBe("chrome");
  expect(COOKIE_BROWSERS).toEqual([...VIDEO_COOKIE_BROWSERS]);
  expect(DEFAULT_COOKIE_BROWSER).toBe("chrome");
  expect(isPublicVideoSourceUrl(sourceUrl)).toBe(true);
  expect(isPublicVideoSourceUrl("https://www.youtube.com/shorts/abcdefghijk")).toBe(true);
  expect(isPublicVideoSourceUrl("https://www.bilibili.com/video/BV1xx411c7xx?p=2")).toBe(true);
  expect(isPublicVideoSourceUrl("http://www.youtube.com/watch?v=abcdefghijk")).toBe(false);
  expect(isPublicVideoSourceUrl("https://user:pw@www.youtube.com/watch?v=abcdefghijk")).toBe(false);
  expect(isPublicVideoSourceUrl("https://evil.youtube.com.example/watch?v=abcdefghijk")).toBe(false);
});

test("stores only an allowed browser name and defaults to chrome", async () => {
  const directory = await tempDir();
  const filePath = join(directory, "video-cookie-browser.json");
  expect(await readCookieBrowserPreference(filePath)).toBe("chrome");
  expect(await writeCookieBrowserPreference(filePath, "Edge")).toEqual({ browser: "edge" });
  expect(await readCookieBrowserPreference(filePath)).toBe("edge");
  expect(await readFile(filePath, "utf8")).toBe('{"browser":"edge"}\n');
  expect(await writeCookieBrowserPreference(filePath, "none")).toEqual({ browser: "none" });
  expect(await readCookieBrowserPreference(filePath)).toBe("none");
  await expect(writeCookieBrowserPreference(filePath, "chrome:Default")).rejects.toThrow("unsupported_browser");
  expect(await readCookieBrowserPreference(filePath)).toBe("none");
  await writeFile(filePath, "{\"browser\":\"not-a-browser\"}\n");
  expect(await readCookieBrowserPreference(filePath)).toBe("chrome");
  await rm(directory, { recursive: true, force: true });
});

test("writes timestamped lines when segments exist and plain text when they do not", () => {
  const timed = buildTranscriptMarkdown({
    label: "字幕实录",
    text: "ignored when cues exist",
    cues: [{ start: 1.2, end: 3, text: "hello & there" }],
    sourceUrl,
    platform: "youtube",
  });
  expect(timed).toContain("<summary>字幕实录</summary>");
  expect(timed).toContain("[00:01](https://www.youtube.com/watch?v=abcdefghijk&t=1s)");
  expect(timed).toContain("hello &amp; there");
  const plain = buildTranscriptMarkdown({
    label: "字幕实录",
    text: "only words",
    cues: [],
    sourceUrl,
    platform: "youtube",
  });
  expect(plain).toContain("only words");
  expect(plain).not.toContain("](http");
  const replaced = applyTranscript(`# Title\n\n${placeholder}\n`, placeholder, timed);
  expect(replaced).not.toContain(placeholder);
  expect(replaced).toContain("<details>");
  const marker = "<!-- edgeever-video-v1:abc -->";
  const kept = applyTranscript(`# Title\n\n${placeholder}\n\n${marker}\n`, placeholder, "字幕");
  expect(kept.trim().endsWith(marker)).toBe(true);
  expect(kept.indexOf("字幕")).toBeLessThan(kept.indexOf(marker));
});

test("asks the OpenAI-compatible client for segment timestamps and does not retry", () => {
  const audio = new Uint8Array([1, 2, 3]);
  const signal = AbortSignal.timeout(1000);
  expect(transcriptionRequest({
    baseUrl: "https://api.example.test/v1",
    apiKey,
    modelId: "whisper-1",
    audio,
    abortSignal: signal,
  })).toEqual({
    provider: { baseURL: "https://api.example.test/v1", apiKey },
    modelId: "whisper-1",
    audio,
    maxRetries: 0,
    abortSignal: signal,
    providerOptions: { openai: { timestampGranularities: ["segment"] } },
  });
});

test("skips the job when speech recognition is off or yt-dlp is not ready", async () => {
  const disabled = baseState({ enabled: false });
  const disabledResult = await runSpeechTranscriptionPass({
    getSession: () => session,
    ytDlpStatus: () => readyTool,
    fetchImpl: installFetch(disabled),
    audioDirectory: async () => "/tmp/unused",
  });
  expect(disabledResult).toEqual({ outcome: "skipped", reason: "disabled" });
  expect(disabled.calls.map((call) => call.path)).toEqual(["/api/v1/ai/transcription-settings"]);

  const waiting = baseState();
  const toolResult = await runSpeechTranscriptionPass({
    getSession: () => session,
    ytDlpStatus: () => ({ state: "downloading", path: null }),
    fetchImpl: installFetch(waiting),
    audioDirectory: async () => "/tmp/unused",
  });
  expect(toolResult).toEqual({ outcome: "skipped", reason: "yt_dlp" });
  expect(waiting.calls.map((call) => call.path)).toEqual(["/api/v1/ai/transcription-settings"]);
  expect(waiting.prepared).toBe(false);
});

test("does not download when the note changed or the video is too long", async () => {
  const directory = await tempDir();
  const changed = baseState({ memo: { ...memo, contentHash: "edited" } });
  let spawned = 0;
  const changedResult = await runSpeechTranscriptionPass({
    getSession: () => session,
    ytDlpStatus: () => readyTool,
    fetchImpl: installFetch(changed),
    audioDirectory: async () => directory,
    execFileImpl: () => { spawned += 1; },
    transcribe: async () => { throw new Error("should not transcribe"); },
  });
  expect(changedResult.reason).toBe("note_changed");
  expect(spawned).toBe(0);
  expect(changed.prepared).toBe(false);
  expect(changed.finished).toMatchObject({ status: "failed", errorCode: "note_changed" });

  const long = baseState({ jobs: [{ ...waitingJob, durationSeconds: 30 * 60 + 1 }] });
  const longResult = await runSpeechTranscriptionPass({
    getSession: () => session,
    ytDlpStatus: () => readyTool,
    fetchImpl: installFetch(long),
    audioDirectory: async () => directory,
    execFileImpl: () => { spawned += 1; },
  });
  expect(longResult.reason).toBe("duration_limit");
  expect(spawned).toBe(0);
  expect(long.prepared).toBe(false);
  await rm(directory, { recursive: true, force: true });
});

test("does not call the OpenAI transcriber for another compatibility standard", async () => {
  const state = baseState({ speechProvider: "future-vendor" });
  let spawned = 0;
  let transcribed = false;
  const result = await runSpeechTranscriptionPass({
    getSession: () => session,
    ytDlpStatus: () => readyTool,
    fetchImpl: installFetch(state),
    audioDirectory: async () => "/tmp/unused",
    execFileImpl: () => { spawned += 1; },
    transcribe: async () => { transcribed = true; },
  });
  expect(result.reason).toBe("disabled");
  expect(spawned).toBe(0);
  expect(transcribed).toBe(false);
  expect(state.prepared).toBe(true);
  expect(state.finished).toMatchObject({ status: "failed", errorCode: "disabled" });
});

test("transcribes the local file and writes the same note", async () => {
  const directory = await tempDir();
  const state = baseState();
  let seenAudio = null;
  const providerCalls = [];
  const result = await runSpeechTranscriptionPass({
    getSession: () => session,
    ytDlpStatus: () => readyTool,
    cookieBrowser: async () => "safari",
    fetchImpl: installFetch(state),
    audioDirectory: async () => directory,
    maxAudioBytes: 32,
    execFileImpl: (_binary, args, options, callback) => {
      expect(options.shell).toBeUndefined();
      expect(args).toContain("bestaudio");
      expect(args).not.toContain("-x");
      expect(args[args.indexOf("--cookies-from-browser") + 1]).toBe("safari");
      return writeFile(join(directory, "memo_abc.m4a"), Uint8Array.from([9, 8, 7, 6])).then(() => callback(null));
    },
    createProvider: (settings) => {
      providerCalls.push(settings);
      return { transcription: (modelId) => ({ modelId }) };
    },
    transcribe: async ({ model, audio, maxRetries, providerOptions }) => {
      seenAudio = audio;
      expect(model).toEqual({ modelId: "whisper-1" });
      expect(maxRetries).toBe(0);
      expect(providerOptions).toEqual({ openai: { timestampGranularities: ["segment"] } });
      return {
        text: "hello there",
        segments: [{ text: " hello there", startSecond: 1.4, endSecond: 2 }],
      };
    },
  });
  expect(result).toEqual({ outcome: "ready", memoId: "memo_abc" });
  expect(providerCalls).toEqual([{ baseURL: "https://api.example.test/v1", apiKey }]);
  expect(Array.from(seenAudio)).toEqual([9, 8, 7, 6]);
  expect(state.patched.contentMarkdown).toContain("[00:01](https://www.youtube.com/watch?v=abcdefghijk&t=1s)");
  expect(state.patched.contentMarkdown).not.toContain(placeholder);
  expect(state.patched.expectedRevision).toBe(0);
  expect(state.patched.expectedContentHash).toBe("hash-1");
  expect(state.finished).toEqual({
    status: "ready",
    errorCode: null,
    claimedAt: "2026-10-06T00:00:00.000Z",
  });
  expect(JSON.stringify(state.finished)).not.toContain(apiKey);
  expect(state.calls.every((call) => call.authorization === "Bearer desktop-session")).toBe(true);
  expect(state.calls.some((call) => call.path.includes("audio/transcriptions"))).toBe(false);
  const names = await readFile(join(directory, "memo_abc.m4a")).then(() => ["left"], () => []);
  expect(names).toEqual([]);
  await rm(directory, { recursive: true, force: true });
});

test("leaves the note in place when recognition fails and does not store the token", async () => {
  const directory = await tempDir();
  const state = baseState();
  const result = await runSpeechTranscriptionPass({
    getSession: () => session,
    ytDlpStatus: () => readyTool,
    fetchImpl: installFetch(state),
    audioDirectory: async () => directory,
    execFileImpl: (_binary, _args, _options, callback) => (
      writeFile(join(directory, "memo_abc.webm"), Uint8Array.from([1])).then(() => callback(null))
    ),
    createProvider: () => ({ transcription: () => ({}) }),
    transcribe: async () => {
      throw new Error(`provider rejected ${apiKey}`);
    },
  });
  expect(result.reason).toBe("transcribe_failed");
  expect(state.patched).toBeNull();
  expect(state.finished).toMatchObject({ status: "failed", errorCode: "transcribe_failed" });
  expect(JSON.stringify(state.finished)).not.toContain(apiKey);
  await expect(readFile(join(directory, "memo_abc.webm"))).rejects.toThrow();
  await rm(directory, { recursive: true, force: true });
});

test("refuses an oversized download before calling the recognizer", async () => {
  const directory = await tempDir();
  const state = baseState();
  let transcribed = false;
  const result = await runSpeechTranscriptionPass({
    getSession: () => session,
    ytDlpStatus: () => readyTool,
    fetchImpl: installFetch(state),
    audioDirectory: async () => directory,
    maxAudioBytes: 3,
    execFileImpl: (_binary, _args, _options, callback) => (
      writeFile(join(directory, "memo_abc.m4a"), Uint8Array.from([1, 2, 3, 4])).then(() => callback(null))
    ),
    transcribe: async () => { transcribed = true; },
  });
  expect(result.reason).toBe("audio_too_large");
  expect(transcribed).toBe(false);
  expect(state.patched).toBeNull();
  await rm(directory, { recursive: true, force: true });
});

test("saves text without timestamps when the recognizer returns no segments", async () => {
  const directory = await tempDir();
  const state = baseState();
  await runSpeechTranscriptionPass({
    getSession: () => session,
    ytDlpStatus: () => readyTool,
    fetchImpl: installFetch(state),
    audioDirectory: async () => directory,
    execFileImpl: (_binary, _args, _options, callback) => (
      writeFile(join(directory, "memo_abc.m4a"), Uint8Array.from([1])).then(() => callback(null))
    ),
    createProvider: () => ({ transcription: () => ({}) }),
    transcribe: async () => ({ text: "plain words", segments: [] }),
  });
  expect(state.patched.contentMarkdown).toContain("plain words");
  expect(state.patched.contentMarkdown).not.toContain("](http");
  expect(state.finished.status).toBe("ready");
  await rm(directory, { recursive: true, force: true });
});

test("does not start a second pass while one is still running, and the app does not await it", async () => {
  let release = () => {};
  const gate = new Promise((resolve) => { release = resolve; });
  let calls = 0;
  let scheduled = null;
  const stop = startSpeechTranscription({
    pass: () => {
      calls += 1;
      return gate;
    },
  }, {
    intervalMs: 20,
    schedule: (callback) => {
      scheduled = callback;
      return 4;
    },
    cancel: () => { scheduled = null; },
  });
  await Promise.resolve();
  expect(calls).toBe(1);
  scheduled();
  await Promise.resolve();
  expect(calls).toBe(1);
  release();
  await gate;
  await Promise.resolve();
  await Promise.resolve();
  scheduled();
  await Promise.resolve();
  expect(calls).toBe(2);
  stop();
  expect(scheduled).toBeNull();

  const main = await readFile(new URL("./index.mjs", import.meta.url), "utf8");
  const windowAt = main.indexOf("await createWindow()");
  const startAt = main.indexOf("startSpeechTranscription(");
  expect(startAt).toBeGreaterThan(windowAt);
  expect(main).not.toContain("await startSpeechTranscription");
  expect(main).not.toContain("await runSpeechTranscriptionPass");
  expect(main).toContain("stopSpeechTranscription?.()");
});

test("the installed provider can build a transcription model without a network call", async () => {
  const { createOpenAI } = await import("@ai-sdk/openai");
  const provider = createOpenAI({ baseURL: "https://example.test/v1", apiKey: "not-a-real-token" });
  expect(typeof provider.transcription).toBe("function");
  expect(provider.transcription("whisper-1")).toBeTruthy();
});

test("the runner factory passes the session through", async () => {
  const runner = createSpeechTranscriptionRunner({
    getSession: () => ({}),
    ytDlpStatus: () => readyTool,
    audioDirectory: async () => "/tmp/unused",
  });
  await expect(runner.pass()).resolves.toEqual({ outcome: "skipped", reason: "signed_out" });
});
