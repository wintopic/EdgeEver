import { describe, expect, test } from "bun:test";
import {
  compactMindMapNodeSize,
  mindMapBranchSides,
  mindMapConnectorPath,
  mindMapEdgeVisual,
  mindMapNodePresentation,
  mindMapNodeRole,
  mindMapNodeVisual,
  mindMapRootRadius,
  MIND_MAP_CONNECTOR_NAME,
  MIND_MAP_VERTICAL_GAP,
} from "./diagram-mindmap-style.ts";

const palette = {
  topicFill: "#16A06E",
  topicText: "#FFFFFF",
  nodeFill: "#F0F8F4",
  nodeText: "#173B2E",
  nodeStroke: "#B8DFD0",
  topicStroke: "#12845B",
  mindMapEdge: "#55B891",
  canvas: "#F8FAF9",
};

describe("mind map presentation", () => {
  test("classifies root, first-level, and nested topics from parent links", () => {
    const nodes = [
      { id: "root" },
      { id: "one", parentId: "root" },
      { id: "one-a", parentId: "one" },
    ];
    expect(mindMapNodeRole(nodes, "root")).toBe("root");
    expect(mindMapNodeRole(nodes, "one")).toBe("primary");
    expect(mindMapNodeRole(nodes, "one-a")).toBe("nested");
  });

  test("keeps compact topic sizes while allowing longer labels to grow within a cap", () => {
    expect(compactMindMapNodeSize("分支主题", false)).toEqual({ width: 96, height: 36 });
    expect(compactMindMapNodeSize("核心主题", true)).toEqual({ width: 124, height: 46 });
    expect(compactMindMapNodeSize("A much longer topic label", false).width).toBeLessThanOrEqual(168);
    expect(mindMapNodePresentation("核心主题", "root").fontSize).toBe(15);
    expect(MIND_MAP_VERTICAL_GAP).toBe(20);
  });

  test("uses a capsule root, rounded first-level topics, and lighter nested topics", () => {
    const root = mindMapNodeVisual("root", palette);
    const primary = mindMapNodeVisual("primary", palette);
    const nested = mindMapNodeVisual("nested", palette);
    expect(root.body.fill).toBe(palette.topicFill);
    expect(root.body.rx).toBe(23);
    expect(primary.body.fill).toBe(palette.nodeFill);
    expect(primary.body.stroke).toBe(palette.topicStroke);
    expect(nested.body.fill).toBe(palette.canvas);
    expect(nested.label.fontWeight).toBe(500);
    expect(mindMapRootRadius(46)).toBe(23);
  });

  test("tapers branches from the parent and anchors them to the nearer side", () => {
    const fromRoot = mindMapEdgeVisual("root", palette);
    const fromNested = mindMapEdgeVisual("nested", palette);
    expect(fromRoot.sourceWidth).toBeGreaterThan(fromRoot.targetWidth);
    expect(fromRoot.sourceWidth).toBeGreaterThan(fromNested.sourceWidth);
    expect(mindMapBranchSides(
      { x: 0, y: 0, width: 120, height: 46 },
      { x: 200, y: 0, width: 96, height: 36 },
    )).toEqual({ source: "right", target: "left" });
    expect(mindMapBranchSides(
      { x: 200, y: 0, width: 120, height: 46 },
      { x: 0, y: 0, width: 96, height: 36 },
    )).toEqual({ source: "left", target: "right" });
    expect(MIND_MAP_CONNECTOR_NAME).toBe("edgeever-mindmap");
  });

  test("builds a closed horizontal cubic ribbon that is thicker at the source", () => {
    const path = mindMapConnectorPath({ x: 0, y: 0 }, { x: 80, y: 0 }, 4, 1);
    expect(path.startsWith("M 0.00 2.00")).toBe(true);
    expect(path.includes("Z")).toBe(true);
    expect(path).toContain("L 0.00 -2.00");
    expect(path).toContain("L 80.00 0.50");
  });
});
