import { z } from "zod";
import { createPosterDocument, POSTER_FORMATS, POSTER_TEMPLATES, PosterDocumentSchema, PosterGradientSchema, type PosterDocument } from "@edgeever/shared";
import { AppError } from "./app-error";

const creation = z.object({
  notebookId: z.string().min(1),
  title: z.string().min(1).max(160),
  heading: z.string().trim().min(1).max(80),
  subtitle: z.string().max(240).default(""),
  template: z.enum(POSTER_TEMPLATES).default("editorial"),
  format: z.enum(["portrait", "square", "wechat", "video", "story"]).default("portrait"),
  tags: z.array(z.string()).max(100).optional(),
}).strict();

// Agents supply copy, not the encoded document or hand-written canvas geometry.
export function compilePosterMemo(input: unknown) {
  const parsed = creation.safeParse(input);
  if (!parsed.success) throw new AppError("invalid_params", "Invalid poster input. Supply notebookId, title and a short heading; use create_poster_memo, never encoded Markdown.", 400);
  const args = parsed.data;
  const format = POSTER_FORMATS.find(format => format.id === args.format)!;
  const document = createPosterDocument(args.heading, args.subtitle, args.template, format.width, format.height);
  document.templateId = args.template;
  document.copy = { title: args.heading, subtitle: args.subtitle, badge: "" };
  for (const element of document.elements) {
    if (element.type !== "text") continue;
    element.role = element.id === "heading" ? "title" : "subtitle";
    element.sourceText = element.text;
    // Reserve separate title/body regions and fit conservative CJK line widths.
    // Explicit newlines count too, so long copy does not overlap the other block.
    const height = document.height * (element.role === "title" ? 0.38 : 0.22);
    const lines = () => element.text.split("\n").reduce((count, line) => count + Math.max(1, Math.ceil(Array.from(line).length * element.fontSize / element.width)), 0);
    while (element.fontSize > 16 && lines() * element.fontSize * 1.4 > height) element.fontSize--;
    if (lines() * element.fontSize * 1.4 > height) throw new AppError("invalid_params", "Poster copy does not fit. Shorten the text or remove extra line breaks.", 400);
    element.height = height;
    element.lineHeight = 1.4;
  }
  return { args, document: PosterDocumentSchema.parse(document) };
}

const patch = z.object({
  text: z.string().max(8000).optional(),
  fill: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  fontSize: z.number().finite().min(4).max(8192).optional(),
  fontWeight: z.enum(["normal", "bold"]).optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  x: z.number().finite().min(-8192).max(8192).optional(),
  y: z.number().finite().min(-8192).max(8192).optional(),
  width: z.number().finite().min(1).max(8192).optional(),
  height: z.number().finite().min(1).max(8192).optional(),
  rotation: z.number().finite().min(-360).max(360).optional(),
  opacity: z.number().finite().min(0).max(1).optional(),
}).strict().refine(value => Object.keys(value).length > 0);
const request = z.object({
  memoId: z.string().min(1),
  expectedRevision: z.number().int().nonnegative(),
  dryRun: z.boolean().optional(),
  background: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  backgroundGradient: PosterGradientSchema.nullable().optional(),
  edits: z.array(z.object({ id: z.string().min(1), patch }).strict()).max(100).optional(),
}).strict().refine(value => Boolean(value.edits?.length || value.background || value.backgroundGradient !== undefined));

export function applyPosterEdits(input: unknown, current: PosterDocument) {
  const parsed = request.safeParse(input);
  if (!parsed.success) throw new AppError("invalid_params", "Invalid poster edits", 400);
  const args = parsed.data;
  const edits = args.edits ?? [];
  if (new Set(edits.map(edit => edit.id)).size !== edits.length) throw new AppError("invalid_params", "Duplicate poster element IDs", 400);
  for (const edit of edits) {
    const element = current.elements.find(element => element.id === edit.id);
    if (!element || element.locked) throw new AppError("invalid_params", "Poster element is missing or locked", 400);
    if (element.type !== "text" && ["text", "fontSize", "fontWeight", "textAlign"].some(key => key in edit.patch)) {
      throw new AppError("invalid_params", "Typography edits require a text element", 400);
    }
    if (element.type === "image" && edit.patch.fill !== undefined) throw new AppError("invalid_params", "Image elements do not have a fill", 400);
  }
  const next = PosterDocumentSchema.safeParse({
    ...current,
    ...(args.background !== undefined ? { background: args.background } : {}),
    ...(args.backgroundGradient !== undefined ? { backgroundGradient: args.backgroundGradient ?? undefined } : {}),
    elements: current.elements.map(element => {
      const edit = edits.find(edit => edit.id === element.id);
      if (!edit) return element;
      return { ...element, ...edit.patch, ...(edit.patch.text !== undefined ? { sourceText: edit.patch.text } : {}) };
    }),
  });
  if (!next.success) throw new AppError("invalid_params", "Poster edits exceed document limits", 400);
  const document = next.data;
  if (edits.some(edit => edit.patch.text !== undefined)) {
    document.copy = {
      title: current.copy?.title ?? "", subtitle: current.copy?.subtitle ?? "", badge: current.copy?.badge ?? "",
    };
    for (const role of ["title", "subtitle", "badge"] as const) {
      if (!edits.some(edit => edit.patch.text !== undefined && current.elements.some(element => element.id === edit.id && element.role === role))) continue;
      document.copy[role] = [...new Set(document.elements.filter(element => element.type === "text" && element.role === role)
        .map(element => element.type === "text" ? element.sourceText ?? element.text : ""))].join("\n");
    }
  }
  const changed = JSON.stringify(document) !== JSON.stringify(PosterDocumentSchema.parse(current));
  if (changed) document.previewResourceId = undefined;
  return { document, changed };
}
