import { describe, expect, test } from "bun:test";
import { createDefaultDiagramDocument, diagramFallbackMarkdown, serializeDiagramDocument } from "@edgeever/shared";
import { getMobileVisualDiagramKind, hasMobileVisualDiagram, resolveMobileMemoViewerContent } from "./mobile-diagram";

const hasMermaidCodeBlock = (doc: { content?: Array<{ type?: string; attrs?: { language?: string } }> }) =>
  Boolean(doc.content?.some((node) => node.type === "codeBlock" && node.attrs?.language === "mermaid"));

describe("mobile visual diagram viewer", () => {
  test.each(["mind-map", "flowchart", "architecture"] as const)("does not project a valid %s envelope into hidden Mermaid", (kind) => {
    const serialized = serializeDiagramDocument(createDefaultDiagramDocument(kind));
    const marker = serialized.slice(serialized.indexOf("<!-- edgeever-diagram-v1:"));
    const legacyMarkdown = `# legacy\n\n- node list only\n\n${marker}`;
    const doc = resolveMobileMemoViewerContent(
      { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "node list only" }] }] },
      legacyMarkdown,
    );
    expect(getMobileVisualDiagramKind(legacyMarkdown)).toBe(kind);
    expect(hasMermaidCodeBlock(doc)).toBe(false);
    expect(JSON.stringify(doc)).not.toContain("edgeever-diagram-v1");
    expect(JSON.stringify(doc)).not.toContain("node list only");
  });

  test("keeps visual diagram envelopes out of the regular native editor", () => {
    const architecture = serializeDiagramDocument(createDefaultDiagramDocument("architecture"));
    expect(getMobileVisualDiagramKind(architecture)).toBe("architecture");
    expect(getMobileVisualDiagramKind("# Ordinary note")).toBeNull();
  });

  test("hides an invalid envelope and still protects the note from native editing", () => {
    const markdown = `${diagramFallbackMarkdown(createDefaultDiagramDocument("mind-map"))}\n\n<!-- edgeever-diagram-v1:not-json -->`;
    expect(getMobileVisualDiagramKind(markdown)).toBeNull();
    expect(hasMobileVisualDiagram(markdown)).toBe(true);
    const viewerContent = resolveMobileMemoViewerContent(null, markdown);
    expect(JSON.stringify(viewerContent)).not.toContain("edgeever-diagram-v1");
    expect(hasMermaidCodeBlock(viewerContent)).toBe(true);
  });

  test("does not leak diagram metadata when browser codec globals are unavailable", () => {
    const serialized = serializeDiagramDocument(createDefaultDiagramDocument("mind-map"));
    const originalAtob = globalThis.atob;
    const originalBtoa = globalThis.btoa;
    const originalTextDecoder = globalThis.TextDecoder;
    const originalTextEncoder = globalThis.TextEncoder;
    try {
      globalThis.atob = undefined;
      globalThis.btoa = undefined;
      globalThis.TextDecoder = undefined;
      globalThis.TextEncoder = undefined;
      expect(getMobileVisualDiagramKind(serialized)).toBe("mind-map");
      const viewerContent = resolveMobileMemoViewerContent(null, serialized);
      expect(JSON.stringify(viewerContent)).not.toContain("edgeever-diagram-v1");
      expect(hasMermaidCodeBlock(viewerContent)).toBe(false);
    } finally {
      globalThis.atob = originalAtob;
      globalThis.btoa = originalBtoa;
      globalThis.TextDecoder = originalTextDecoder;
      globalThis.TextEncoder = originalTextEncoder;
    }
  });
});
