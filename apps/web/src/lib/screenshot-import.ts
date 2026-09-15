import { docToMarkdown, markdownToDoc, type TiptapDoc } from "@edgeever/shared";

export const normalizeScreenshotBytes = (value: unknown): Uint8Array => {
  if (value instanceof Uint8Array) {
    const copy = new Uint8Array(value.byteLength);
    copy.set(value);
    return copy;
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value.slice(0));
  }
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
  }
  if (Array.isArray(value) && value.every((item) => typeof item === "number")) {
    return Uint8Array.from(value);
  }
  if (value && typeof value === "object" && "type" in value && (value as { type?: unknown }).type === "Buffer") {
    return normalizeScreenshotBytes((value as { data?: unknown }).data);
  }
  return new Uint8Array();
};

export const screenshotFileFromImportPayload = (payload: {
  name?: string;
  type?: string;
  bytes: unknown;
}) => {
  const bytes = normalizeScreenshotBytes(payload.bytes);
  const blobPart = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(blobPart).set(bytes);
  return new File([blobPart], payload.name || "screenshot.png", { type: payload.type || "image/png" });
};

const escapeMarkdownImageAlt = (value: string) => value.replaceAll("\\", "\\\\").replaceAll("]", "\\]");

export const screenshotNoteContent = (filename: string, url: string) => {
  const alt = escapeMarkdownImageAlt(filename || "screenshot.png");
  const contentMarkdown = `![${alt}](${url})`;
  const parsed = markdownToDoc(contentMarkdown);
  const nodes = parsed.content ?? [];
  const contentJson: TiptapDoc = {
    type: "doc",
    content: nodes.at(-1)?.type === "paragraph" ? nodes : [...nodes, { type: "paragraph" }],
  };
  return { contentJson, contentMarkdown: docToMarkdown(contentJson) };
};

type ScreenshotMemo = {
  id: string;
  revision: number;
  contentHash: string;
  title: string | null;
  tags: string[];
  contentMarkdown: string;
};

export const createScreenshotMemo = async <TMemo extends ScreenshotMemo>(input: {
  notebookId: string;
  title: string;
  file: File;
  createMemo: (payload: {
    notebookId: string;
    title: string;
    contentMarkdown: string;
    tags: string[];
  }) => Promise<{ memo: TMemo }>;
  uploadResource: (memoId: string, file: File) => Promise<{ url: string; filename?: string | null }>;
  updateMemo: (
    memo: TMemo,
    content: { contentJson: TiptapDoc; contentMarkdown: string },
  ) => Promise<{ memo: TMemo }>;
  deleteMemo?: (memoId: string) => Promise<unknown>;
}) => {
  const created = await input.createMemo({
    notebookId: input.notebookId,
    title: input.title,
    contentMarkdown: "",
    tags: [],
  });
  try {
    const resource = await input.uploadResource(created.memo.id, input.file);
    const content = screenshotNoteContent(resource.filename || input.file.name, resource.url);
    return (await input.updateMemo(created.memo, content)).memo;
  } catch (error) {
    await input.deleteMemo?.(created.memo.id).catch(() => undefined);
    throw error;
  }
};
