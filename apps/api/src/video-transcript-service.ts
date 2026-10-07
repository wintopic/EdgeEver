import { parseVideoNoteMarker } from "@edgeever/shared";
import { isDatabaseNotReadyError } from "./auth-state";
import { isoNow } from "./entity-utils";
import type { DatabaseAdapter } from "./storage-contract";

const STALE_MS = 20 * 60 * 1000;

export type VideoTranscriptJob = {
  memoId: string;
  platform: "youtube" | "bilibili";
  videoId: string;
  sourceUrl: string;
  durationSeconds: number;
  placeholderText: string;
  transcriptLabel: string;
  contentHash: string;
  status: string;
  claimedAt: string | null;
};

type VideoTranscriptJobRow = {
  memo_id: string;
  platform: "youtube" | "bilibili";
  video_id: string;
  source_url: string;
  duration_seconds: number;
  placeholder_text: string;
  transcript_label: string;
  content_hash: string;
  status: string;
  claimed_at: string | null;
};

const JOB_COLUMNS = `memo_id, platform, video_id, source_url, duration_seconds,
  placeholder_text, transcript_label, content_hash, status, claimed_at`;

const mapJob = (row: VideoTranscriptJobRow): VideoTranscriptJob => ({
  memoId: row.memo_id,
  platform: row.platform,
  videoId: row.video_id,
  sourceUrl: row.source_url,
  durationSeconds: row.duration_seconds,
  placeholderText: row.placeholder_text,
  transcriptLabel: row.transcript_label,
  contentHash: row.content_hash,
  status: row.status,
  claimedAt: row.claimed_at,
});

const changed = (result: { meta?: { changes?: unknown } }) => Number(result.meta?.changes) === 1;

const staleBefore = (now: string) => new Date(Date.parse(now) - STALE_MS).toISOString();

const claimableSql = `(
  status = 'pending'
  OR (status = 'transcribing' AND claimed_at IS NOT NULL AND claimed_at < ?)
)`;

export type VideoTranscriptExtractResult =
  | { status: "queued" | "running" }
  | { status: "missing" }
  | { status: "unavailable" };

export const extractVideoTranscript = async (
  db: DatabaseAdapter,
  workspaceId: string,
  memoId: string,
  now = isoNow(),
): Promise<VideoTranscriptExtractResult> => {
  if (!memoId) return { status: "missing" };
  const memo = await db.prepare(
    `SELECT c.content_markdown, c.content_hash
     FROM memos m
     JOIN memo_contents c ON c.memo_id = m.id
     WHERE m.workspace_id = ? AND m.id = ? AND m.is_deleted = 0
     LIMIT 1`,
  ).bind(workspaceId, memoId).first<{ content_markdown: string; content_hash: string }>();
  const identity = parseVideoNoteMarker(memo?.content_markdown);
  if (!memo?.content_hash || !identity) return { status: "missing" };
  try {
    const result = await db.prepare(
      `INSERT INTO video_transcript_jobs (
         memo_id, workspace_id, platform, video_id, source_url, duration_seconds,
         placeholder_text, transcript_label, content_hash, status, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
       ON CONFLICT(memo_id) DO UPDATE SET
         platform = excluded.platform,
         video_id = excluded.video_id,
         source_url = excluded.source_url,
         duration_seconds = excluded.duration_seconds,
         placeholder_text = excluded.placeholder_text,
         transcript_label = excluded.transcript_label,
         content_hash = excluded.content_hash,
         status = 'pending',
         claimed_at = NULL,
         error_code = NULL,
         updated_at = excluded.updated_at
       WHERE video_transcript_jobs.workspace_id = excluded.workspace_id
         AND (
           video_transcript_jobs.status IN ('ready', 'failed')
           OR (
             video_transcript_jobs.status = 'transcribing'
             AND video_transcript_jobs.claimed_at IS NOT NULL
             AND video_transcript_jobs.claimed_at < ?
           )
         )`,
    ).bind(
      memoId,
      workspaceId,
      identity.platform,
      identity.videoId,
      identity.sourceUrl,
      identity.durationSeconds,
      identity.placeholderText,
      identity.transcriptLabel,
      memo.content_hash,
      now,
      now,
      staleBefore(now),
    ).run();
    return { status: changed(result) ? "queued" : "running" };
  } catch (error) {
    if (isDatabaseNotReadyError(error)) return { status: "unavailable" };
    throw error;
  }
};

export const listClaimableVideoTranscriptJobs = async (
  db: DatabaseAdapter,
  workspaceId: string,
  now = isoNow(),
) => {
  const rows = await db.prepare(
    `SELECT ${JOB_COLUMNS}
     FROM video_transcript_jobs
     WHERE workspace_id = ? AND ${claimableSql}
     ORDER BY created_at ASC
     LIMIT 5`,
  ).bind(workspaceId, staleBefore(now)).all<VideoTranscriptJobRow>();
  return (rows.results ?? []).map(mapJob);
};

export const claimVideoTranscriptJob = async (
  db: DatabaseAdapter,
  workspaceId: string,
  memoId: string,
  now = isoNow(),
) => {
  const result = await db.prepare(
    `UPDATE video_transcript_jobs
     SET status = 'transcribing', claimed_at = ?, error_code = NULL, updated_at = ?
     WHERE workspace_id = ? AND memo_id = ? AND ${claimableSql}`,
  ).bind(now, now, workspaceId, memoId, staleBefore(now)).run();
  if (!changed(result)) return null;
  const row = await db.prepare(
    `SELECT ${JOB_COLUMNS}
     FROM video_transcript_jobs
     WHERE workspace_id = ? AND memo_id = ? AND status = 'transcribing' AND claimed_at = ?
     LIMIT 1`,
  ).bind(workspaceId, memoId, now).first<VideoTranscriptJobRow>();
  return row ? mapJob(row) : null;
};

export const finishVideoTranscriptJob = async (
  db: DatabaseAdapter,
  workspaceId: string,
  memoId: string,
  input: { status: "ready" | "failed"; errorCode: string | null; claimedAt: string },
  now = isoNow(),
) => {
  const result = await db.prepare(
    `UPDATE video_transcript_jobs
     SET status = ?, error_code = ?, updated_at = ?
     WHERE workspace_id = ? AND memo_id = ? AND status = 'transcribing' AND claimed_at = ?`,
  ).bind(
    input.status,
    input.status === "failed" ? input.errorCode : null,
    now,
    workspaceId,
    memoId,
    input.claimedAt,
  ).run();
  return changed(result);
};
