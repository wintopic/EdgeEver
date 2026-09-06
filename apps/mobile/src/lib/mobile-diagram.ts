import {
  diagramFallbackMarkdown,
  hasDiagramDocumentMarker,
  markdownToDoc,
  parseDiagramDocument,
  resolveMemoContentDoc,
  stripDiagramDocumentMarker,
  type TiptapDoc,
  type DiagramKind,
} from "@edgeever/shared";

export const getMobileVisualDiagramKind = (contentMarkdown: string): DiagramKind | null =>
  parseDiagramDocument(contentMarkdown)?.kind ?? null;

export const hasMobileVisualDiagram = (contentMarkdown: string) =>
  hasDiagramDocumentMarker(contentMarkdown);

/** Render visual-note envelopes through the native Mermaid viewer without discarding their IR. */
export const resolveMobileMemoViewerContent = (
  contentJson: TiptapDoc | null | undefined,
  contentMarkdown: string,
) => {
  const diagram = parseDiagramDocument(contentMarkdown);
  if (diagram) return markdownToDoc(diagramFallbackMarkdown(diagram));
  if (hasDiagramDocumentMarker(contentMarkdown)) {
    return markdownToDoc(stripDiagramDocumentMarker(contentMarkdown));
  }
  return resolveMemoContentDoc(contentJson, contentMarkdown);
};
