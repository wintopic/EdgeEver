import { serializeVideoNoteMarker } from "@edgeever/shared";
import { afterEach, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { globSync, readFileSync } from "node:fs";
import { Hono } from "hono";
import { mapMemoSummary } from "./memo-list-service.ts";
import { createMemoRecord } from "./memo-service.ts";
import { createSelfHostedStorageAdapter } from "./self-hosted-storage-adapter.ts";
import { registerMemoRoutes } from "./memo-routes.ts";
import { registerVideoTranscriptRoutes } from "./video-transcript-routes.ts";
import { extractVideoTranscript } from "./video-transcript-service.ts";

const opened = [];
afterEach(() => opened.splice(0).forEach((db) => db.close()));

const user = {
  kind: "user",
  actorType: "user",
  actorId: "usr_1",
  username: "member",
  displayName: "Member",
  scopes: [],
  workspaceId: "paw",
  role: "owner",
};

const jobInput = {
  platform: "youtube",
  videoId: "abcdefghijk",
  sourceUrl: "https://www.youtube.com/watch?v=abcdefghijk",
  durationSeconds: 42,
  placeholderText: "这一集没有可用字幕",
  transcriptLabel: "字幕实录",
};

const setup = () => {
  const sqlite = new Database(":memory:");
  opened.push(sqlite);
  for (const file of globSync("migrations/*.sql").sort()) sqlite.exec(readFileSync(file, "utf8"));
  sqlite.exec(`INSERT INTO workspaces(id, name) VALUES ('paw', 'Paw');
    INSERT INTO notebooks(id, workspace_id, name) VALUES ('inbox', 'paw', 'Inbox');`);
  const db = createSelfHostedStorageAdapter(sqlite, "/tmp/video-transcript-unused").db;
  return { sqlite, db };
};

const createApp = (auth = user, { demoMode = false } = {}) => {
  const app = new Hono();
  app.use("/api/v1/*", async (context, next) => {
    context.set("auth", auth);
    await next();
  });
  const unused = async () => {
    throw new Error("unused");
  };
  registerVideoTranscriptRoutes(app, { isDemoMode: () => demoMode });
  registerMemoRoutes(app, {
    clampNumber: (value) => value,
    createImageResource: async () => ({ id: "res_1" }),
    createMemo: (...args) => createMemoRecord(...args),
    createMemoEditSession: unused,
    deleteMemo: async () => {},
    deleteMemos: async () => 0,
    emptyTrash: async () => 0,
    getMemoDetail: async () => null,
    listMemos: async () => ({ memos: [] }),
    listMemoRevisions: async () => [],
    mergeMemos: unused,
    moveMemos: async () => 0,
    restoreMemo: unused,
    restoreMemoRevision: unused,
    updateMemo: unused,
  });
  return app;
};

const environmentFor = (db) => ({
  storage: { db, resources: {} },
});

const postMemo = (app, db, body) => app.request("/api/v1/memos", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ notebookId: "inbox", title: "Video", contentMarkdown: "hello\n", ...body }),
}, environmentFor(db));

const videoMarkdown = () => `这一集没有可用字幕\n\n${serializeVideoNoteMarker(jobInput)}\n`;

const extract = (app, db, memoId) => app.request(
  `/api/v1/video-transcript-jobs/${memoId}/extract`,
  { method: "POST" },
  environmentFor(db),
);

test("a missing transcript table does not pretend extraction started", async () => {
  const db = {
    prepare(sql) {
      return {
        bind() { return this; },
        async first() {
          return String(sql).includes("FROM memos")
            ? { content_markdown: videoMarkdown(), content_hash: "a".repeat(64) }
            : null;
        },
        async run() { throw new Error("no such table: video_transcript_jobs"); },
      };
    },
  };
  await expect(extractVideoTranscript(db, "paw", "memo_1")).resolves.toEqual({ status: "unavailable" });
});

test("saving a video note waits for an explicit extract", async () => {
  const { sqlite, db } = setup();
  const app = createApp();
  const created = await postMemo(app, db, { videoTranscript: jobInput, contentMarkdown: videoMarkdown() });
  expect(created.status).toBe(201);
  expect(sqlite.query("SELECT COUNT(*) AS count FROM video_transcript_jobs").get().count).toBe(0);
  const memoId = (await created.json()).memo.id;
  expect(mapMemoSummary({
    id: memoId,
    notebook_id: "inbox",
    title: "Video",
    excerpt: "",
    content_markdown: videoMarkdown(),
    tags_json: "[]",
    is_pinned: 0,
    is_archived: 0,
    is_deleted: 0,
    created_at: "2026-10-07T00:00:00.000Z",
    updated_at: "2026-10-07T00:00:00.000Z",
    deleted_at: null,
    revision: 1,
  }).videoNote).toBe(true);

  const started = await extract(app, db, memoId);
  expect(started.status).toBe(200);
  expect(await started.json()).toEqual({ status: "queued" });
  const row = sqlite.query(
    "SELECT platform, video_id, source_url, duration_seconds, status, content_hash FROM video_transcript_jobs",
  ).get();
  expect(row).toMatchObject({
    platform: "youtube",
    video_id: "abcdefghijk",
    source_url: jobInput.sourceUrl,
    duration_seconds: 42,
    status: "pending",
  });
  expect(row.content_hash).toHaveLength(64);

  const again = await extract(app, db, memoId);
  expect(await again.json()).toEqual({ status: "running" });
  expect(sqlite.query("SELECT COUNT(*) AS count FROM video_transcript_jobs").get().count).toBe(1);

  const plain = await postMemo(app, db, {});
  expect(plain.status).toBe(201);
  expect((await extract(app, db, (await plain.json()).memo.id)).status).toBe(404);

  const rejected = await postMemo(app, db, {
    videoTranscript: { ...jobInput, sourceUrl: "https://user:secret@youtube.com/watch?v=abcdefghijk" },
  });
  expect(rejected.status).toBe(201);
  expect(sqlite.query("SELECT COUNT(*) AS count FROM video_transcript_jobs").get().count).toBe(1);
});

test("a cover upload keeps the video note without starting transcription", async () => {
  const { sqlite, db } = setup();
  const app = createApp();
  const form = new FormData();
  form.append("notebookId", "inbox");
  form.append("title", "Video");
  form.append("contentMarkdown", `![封面](/api/v1/resources/EDGEVERRESOURCEID/blob)\n\n${videoMarkdown()}`);
  form.append("tags", JSON.stringify(["web-clip"]));
  form.append("videoTranscript", JSON.stringify(jobInput));
  form.append("file", new File([Uint8Array.from([1, 2, 3])], "cover.jpg", { type: "image/jpeg" }));
  const created = await app.request("/api/v1/memos/with-image", { method: "POST", body: form }, environmentFor(db));
  expect(created.status).toBe(201);
  expect(sqlite.query("SELECT COUNT(*) AS count FROM video_transcript_jobs").get().count).toBe(0);
  const memoId = (await created.json()).memo.id;
  expect((await extract(app, db, memoId)).status).toBe(200);
  expect(sqlite.query("SELECT COUNT(*) AS count FROM video_transcript_jobs").get().count).toBe(1);
  const markdown = sqlite.query("SELECT content_markdown FROM memo_contents").get().content_markdown;
  expect(markdown).not.toContain("EDGEVERRESOURCEID");
});

test("one desktop claims the job, a second waits, and a stale claim can be taken", async () => {
  const { sqlite, db } = setup();
  const app = createApp();
  const created = await postMemo(app, db, { contentMarkdown: videoMarkdown() });
  expect(created.status).toBe(201);
  const memoId = (await created.json()).memo.id;
  expect((await extract(app, db, memoId)).status).toBe(200);
  const environment = environmentFor(db);
  const claim = () => app.request(`/api/v1/video-transcript-jobs/${memoId}/claim`, { method: "POST" }, environment);
  const first = await claim();
  expect(first.status).toBe(200);
  const claimed = await first.json();
  expect(claimed.job.memoId).toBe(memoId);
  expect(claimed.job.claimedAt).toEqual(expect.any(String));
  expect(JSON.stringify(claimed)).not.toContain("apiKey");

  const second = await claim();
  expect(second.status).toBe(409);
  expect(sqlite.query("SELECT claimed_at FROM video_transcript_jobs").get().claimed_at).toBe(claimed.job.claimedAt);

  const listed = await app.request("/api/v1/video-transcript-jobs", {}, environment);
  expect(await listed.json()).toEqual({ jobs: [] });

  sqlite.query("UPDATE video_transcript_jobs SET claimed_at = ?").run("2020-01-01T00:00:00.000Z");
  const reclaimed = await claim();
  expect(reclaimed.status).toBe(200);
  const next = await reclaimed.json();
  expect(next.job.claimedAt).not.toBe("2020-01-01T00:00:00.000Z");

  const finished = await app.request(`/api/v1/video-transcript-jobs/${memoId}/finish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "ready", claimedAt: next.job.claimedAt }),
  }, environment);
  expect(finished.status).toBe(200);
  expect(sqlite.query("SELECT status, error_code FROM video_transcript_jobs").get()).toEqual({
    status: "ready",
    error_code: null,
  });

  const late = await app.request(`/api/v1/video-transcript-jobs/${memoId}/finish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "failed", errorCode: "download_failed", claimedAt: next.job.claimedAt }),
  }, environment);
  expect(late.status).toBe(409);
});

test("a failed job stays failed and is not offered again", async () => {
  const { sqlite, db } = setup();
  const app = createApp();
  const environment = environmentFor(db);
  const created = await postMemo(app, db, { contentMarkdown: videoMarkdown() });
  expect(created.status).toBe(201);
  const memoId = (await created.json()).memo.id;
  expect((await extract(app, db, memoId)).status).toBe(200);
  const claimed = await (await app.request(
    `/api/v1/video-transcript-jobs/${memoId}/claim`,
    { method: "POST" },
    environment,
  )).json();
  const failed = await app.request(`/api/v1/video-transcript-jobs/${memoId}/finish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      status: "failed",
      errorCode: "download_failed",
      claimedAt: claimed.job.claimedAt,
    }),
  }, environment);
  expect(failed.status).toBe(200);
  expect(await (await app.request("/api/v1/video-transcript-jobs", {}, environment)).json()).toEqual({ jobs: [] });
  expect((await app.request(`/api/v1/video-transcript-jobs/${memoId}/claim`, { method: "POST" }, environment)).status).toBe(409);
});

test("a failed extract can be started again, and a fresh claim cannot", async () => {
  const { sqlite, db } = setup();
  const app = createApp();
  const environment = environmentFor(db);
  const created = await postMemo(app, db, { contentMarkdown: videoMarkdown() });
  const memoId = (await created.json()).memo.id;
  expect(await (await extract(app, db, memoId)).json()).toEqual({ status: "queued" });
  const claimed = await (await app.request(
    `/api/v1/video-transcript-jobs/${memoId}/claim`,
    { method: "POST" },
    environment,
  )).json();
  expect((await app.request(`/api/v1/video-transcript-jobs/${memoId}/finish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      status: "failed",
      errorCode: "download_failed",
      claimedAt: claimed.job.claimedAt,
    }),
  }, environment)).status).toBe(200);
  expect(await (await extract(app, db, memoId)).json()).toEqual({ status: "queued" });
  expect(sqlite.query("SELECT status, error_code, claimed_at FROM video_transcript_jobs").get()).toEqual({
    status: "pending",
    error_code: null,
    claimed_at: null,
  });

  expect((await app.request(`/api/v1/video-transcript-jobs/${memoId}/claim`, { method: "POST" }, environment)).status).toBe(200);
  expect(await (await extract(app, db, memoId)).json()).toEqual({ status: "running" });
  expect(sqlite.query("SELECT status FROM video_transcript_jobs").get().status).toBe("transcribing");
  sqlite.query("UPDATE video_transcript_jobs SET claimed_at = ?").run("2020-01-01T00:00:00.000Z");
  expect(await (await extract(app, db, memoId)).json()).toEqual({ status: "queued" });
  expect(sqlite.query("SELECT status, claimed_at FROM video_transcript_jobs").get()).toEqual({
    status: "pending",
    claimed_at: null,
  });
});

test("clipper tokens cannot start, list, or claim transcription", async () => {
  const { sqlite, db } = setup();
  const clipper = createApp({
    ...user,
    kind: "agent",
    actorType: "agent",
    actorId: "tok_clip",
    scopes: ["write:memos", "read:memos"],
  });
  const created = await postMemo(clipper, db, { contentMarkdown: videoMarkdown(), videoTranscript: jobInput });
  expect(created.status).toBe(201);
  expect(sqlite.query("SELECT COUNT(*) AS count FROM video_transcript_jobs").get().count).toBe(0);
  const environment = environmentFor(db);
  const memoId = (await created.json()).memo.id;
  expect((await extract(clipper, db, memoId)).status).toBe(403);
  expect((await clipper.request("/api/v1/video-transcript-jobs", {}, environment)).status).toBe(403);
  expect((await clipper.request(`/api/v1/video-transcript-jobs/${memoId}/claim`, { method: "POST" }, environment)).status).toBe(403);
  expect(sqlite.query("SELECT COUNT(*) AS count FROM video_transcript_jobs").get().count).toBe(0);

  const demo = createApp(user, { demoMode: true });
  expect((await extract(demo, db, memoId)).status).toBe(403);
  expect((await demo.request("/api/v1/video-transcript-jobs", {}, environment)).status).toBe(403);
});

test("the API does not import the desktop transcription package", () => {
  for (const name of [
    "video-transcript-service.ts",
    "video-transcript-routes.ts",
    "ai-routes.ts",
    "memo-routes.ts",
  ]) {
    const source = readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
    expect(source).not.toContain("@ai-sdk/openai");
    expect(source).not.toContain("transcribe(");
  }
  const service = readFileSync(new URL("./ai-service.ts", import.meta.url), "utf8");
  expect(service).not.toContain("@ai-sdk/openai");
  expect(service).not.toContain(".transcription(");
});
