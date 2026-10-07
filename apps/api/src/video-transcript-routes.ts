import { VideoTranscriptFinishSchema } from "@edgeever/shared";
import { zValidator } from "@hono/zod-validator";
import type { Hono } from "hono";
import type { AppContext, AppEnv, Bindings } from "./api-context";
import { apiError, databaseNotReady, forbidden, notFound } from "./http-errors";
import { getWorkspaceId, requireUser } from "./request-auth";
import {
  claimVideoTranscriptJob,
  extractVideoTranscript,
  finishVideoTranscriptJob,
  listClaimableVideoTranscriptJobs,
} from "./video-transcript-service";

const requireInteractiveUser = (context: AppContext, isDemoMode: (env: Bindings) => boolean) => {
  const denied = requireUser(context);
  if (denied) return denied;
  if (isDemoMode(context.env)) {
    return forbidden(context, "Speech transcription is unavailable in demo mode.");
  }
  return null;
};

export const registerVideoTranscriptRoutes = (
  app: Hono<AppEnv>,
  dependencies: { isDemoMode: (env: Bindings) => boolean },
) => {
  app.get("/api/v1/video-transcript-jobs", async (context) => {
    const denied = requireInteractiveUser(context, dependencies.isDemoMode);
    if (denied) return denied;
    const jobs = await listClaimableVideoTranscriptJobs(context.env.storage.db, getWorkspaceId(context));
    return context.json({ jobs });
  });

  app.post("/api/v1/video-transcript-jobs/:memoId/extract", async (context) => {
    const denied = requireInteractiveUser(context, dependencies.isDemoMode);
    if (denied) return denied;
    const result = await extractVideoTranscript(
      context.env.storage.db,
      getWorkspaceId(context),
      context.req.param("memoId"),
    );
    if (result.status === "missing") {
      return notFound(context, "This note is not a video note.");
    }
    if (result.status === "unavailable") return databaseNotReady(context);
    return context.json({ status: result.status });
  });

  app.post("/api/v1/video-transcript-jobs/:memoId/claim", async (context) => {
    const denied = requireInteractiveUser(context, dependencies.isDemoMode);
    if (denied) return denied;
    const job = await claimVideoTranscriptJob(
      context.env.storage.db,
      getWorkspaceId(context),
      context.req.param("memoId"),
    );
    if (!job) {
      return apiError(context, "video_transcript_not_claimed", "This transcript job is not waiting.", 409);
    }
    return context.json({ job });
  });

  app.post(
    "/api/v1/video-transcript-jobs/:memoId/finish",
    zValidator("json", VideoTranscriptFinishSchema),
    async (context) => {
      const denied = requireInteractiveUser(context, dependencies.isDemoMode);
      if (denied) return denied;
      const input = context.req.valid("json");
      const finished = await finishVideoTranscriptJob(
        context.env.storage.db,
        getWorkspaceId(context),
        context.req.param("memoId"),
        { status: input.status, errorCode: input.errorCode ?? null, claimedAt: input.claimedAt },
      );
      if (!finished) {
        return apiError(context, "video_transcript_not_claimed", "This transcript job is not claimed.", 409);
      }
      return context.json({ ok: true });
    },
  );
};
