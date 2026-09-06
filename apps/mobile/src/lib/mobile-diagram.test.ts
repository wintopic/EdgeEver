import { describe, expect, test } from "bun:test";
import { createDefaultDiagramDocument, diagramFallbackMarkdown, serializeDiagramDocument } from "@edgeever/shared";
import { getMobileVisualDiagramKind, hasMobileVisualDiagram, resolveMobileMemoViewerContent } from "./mobile-diagram";

describe("mobile visual diagram viewer", () => {
  test.each(["mind-map", "flowchart", "architecture"] as const)("projects a %s envelope into a Mermaid node", (kind) => {
    const serialized = serializeDiagramDocument(createDefaultDiagramDocument(kind));
    const marker = serialized.slice(serialized.indexOf("<!-- edgeever-diagram-v1:"));
    const legacyMarkdown = `# legacy\n\n- node list only\n\n${marker}`;
    const doc = resolveMobileMemoViewerContent(
      { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "node list only" }] }] },
      legacyMarkdown,
    );
    expect(doc.content?.some((node) => node.type === "codeBlock" && node.attrs?.language === "mermaid")).toBe(true);
    if (kind === "architecture") {
      const mermaid = doc.content?.find((node) => node.type === "codeBlock")?.content?.[0]?.text;
      expect(mermaid).toContain('subgraph n0["应用系统"]');
      expect(mermaid).toContain("shape: cyl");
    }
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
    expect(viewerContent.content?.some((node) => node.type === "codeBlock" && node.attrs?.language === "mermaid")).toBe(true);
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
      expect(viewerContent.content?.some((node) => node.type === "codeBlock" && node.attrs?.language === "mermaid")).toBe(true);
    } finally {
      globalThis.atob = originalAtob;
      globalThis.btoa = originalBtoa;
      globalThis.TextDecoder = originalTextDecoder;
      globalThis.TextEncoder = originalTextEncoder;
    }
  });
});
