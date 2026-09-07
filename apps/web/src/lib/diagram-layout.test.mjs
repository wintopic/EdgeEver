import { describe, expect, test } from "bun:test";
import { createDefaultDiagramDocument } from "@edgeever/shared";
import {
  compileDiagramIr,
  compactArchitectureNodeSize,
  compactFlowchartNodeSize,
  compactMindMapNodeSize,
  computeDiagramLayout,
  computeDiagramLayoutResult,
  getDiagramLayoutViewport,
} from "./diagram-layout.ts";

describe("diagram auto layout", () => {
  test("places mind-map children to the right of their root", () => {
    const document = createDefaultDiagramDocument("mind-map");
    const positions = computeDiagramLayout(document);
    expect(positions["topic-root"].x).toBeLessThan(positions["topic-1"].x);
    expect(new Set(document.nodes.map((node) => positions[node.id].y)).size).toBeGreaterThan(1);
  });

  test("uses compact topic sizes while allowing longer labels to grow within a cap", () => {
    expect(compactMindMapNodeSize("分支主题", false)).toEqual({ width: 92, height: 36 });
    expect(compactMindMapNodeSize("核心主题", true)).toEqual({ width: 112, height: 42 });
    expect(compactMindMapNodeSize("A much longer topic label", false).width).toBeLessThanOrEqual(156);
  });

  test("inserts a sibling after the selected branch and pushes following subtrees down", () => {
    const document = createDefaultDiagramDocument("mind-map");
    document.nodes.push(
      { id: "topic-1-child", parentId: "topic-1", label: "Child 1", x: 400, y: 60, width: 92, height: 36, shape: "topic" },
      { id: "topic-1-child-2", parentId: "topic-1", label: "Child 2", x: 400, y: 112, width: 92, height: 36, shape: "topic" },
      { id: "topic-new", parentId: "topic-root", label: "New", x: 256, y: 89, width: 92, height: 36, shape: "topic" },
    );
    document.edges.push(
      { id: "branch-child", source: "topic-1", target: "topic-1-child" },
      { id: "branch-child-2", source: "topic-1", target: "topic-1-child-2" },
      { id: "branch-new", source: "topic-root", target: "topic-new" },
    );

    const positions = computeDiagramLayout(document, {
      insertedNodeId: "topic-new",
      insertAfterNodeId: "topic-1",
    });
    const orderedSiblings = ["topic-1", "topic-new", "topic-2", "topic-3"];
    for (let index = 1; index < orderedSiblings.length; index += 1) {
      const previous = document.nodes.find((node) => node.id === orderedSiblings[index - 1]);
      expect(positions[orderedSiblings[index]].y).toBeGreaterThanOrEqual(
        positions[orderedSiblings[index - 1]].y + previous.height + 16,
      );
    }
    expect(positions["topic-1-child"].x).toBeGreaterThan(positions["topic-1"].x);
    const selectedSubtreeBottom = Math.max(
      positions["topic-1"].y + 36,
      positions["topic-1-child"].y + 36,
      positions["topic-1-child-2"].y + 36,
    );
    expect(positions["topic-new"].y).toBeGreaterThanOrEqual(selectedSubtreeBottom + 16);
  });

  test("orders a connected flow from top to bottom and places detached nodes afterwards", () => {
    const document = createDefaultDiagramDocument("flowchart");
    document.nodes.push({ id: "detached", label: "Detached", x: 0, y: 0, width: 140, height: 52, shape: "process" });
    const positions = computeDiagramLayout(document);
    expect(positions["flow-start"].y).toBeLessThan(positions["flow-process"].y);
    expect(positions["flow-process"].y).toBeLessThan(positions["flow-end"].y);
    expect(Number.isFinite(positions.detached.x)).toBeTrue();
    expect(Number.isFinite(positions.detached.y)).toBeTrue();
    expect(positions.detached.y).toBeGreaterThan(positions["flow-end"].y + 44);
  });

  test("keeps an explicit horizontal flowchart direction", () => {
    const document = createDefaultDiagramDocument("flowchart");
    const positions = computeDiagramLayout(document, { direction: "left-to-right" });
    expect(positions["flow-start"].x).toBeLessThan(positions["flow-process"].x);
    expect(positions["flow-process"].x).toBeLessThan(positions["flow-end"].x);
  });

  test("uses compact flowchart nodes with aligned process and terminator centers", () => {
    expect(compactFlowchartNodeSize("process")).toEqual({ width: 124, height: 44 });
    expect(compactFlowchartNodeSize("terminator")).toEqual({ width: 116, height: 44 });
    expect(compactFlowchartNodeSize("decision")).toEqual({ width: 116, height: 72 });
  });

  test("balances a large mind map across both sides while keeping descendants with their branch", () => {
    const document = createDefaultDiagramDocument("mind-map");
    document.nodes.push(
      { id: "topic-4", parentId: "topic-root", label: "Branch 4", x: 256, y: 220, width: 92, height: 36, shape: "topic" },
      { id: "topic-5", parentId: "topic-root", label: "Branch 5", x: 256, y: 272, width: 92, height: 36, shape: "topic" },
      { id: "topic-6", parentId: "topic-root", label: "Branch 6", x: 256, y: 324, width: 92, height: 36, shape: "topic" },
      { id: "topic-6-child", parentId: "topic-6", label: "Nested", x: 420, y: 324, width: 92, height: 36, shape: "topic" },
    );
    const positions = computeDiagramLayout(document);
    const root = document.nodes.find((node) => node.id === "topic-root");
    const directChildren = document.nodes.filter((node) => node.parentId === root.id);
    expect(directChildren.some((node) => positions[node.id].x < root.x)).toBeTrue();
    expect(directChildren.some((node) => positions[node.id].x > root.x + root.width)).toBeTrue();
    const branchDirection = positions["topic-6"].x < root.x ? -1 : 1;
    expect(Math.sign(positions["topic-6-child"].x - positions["topic-6"].x)).toBe(branchDirection);
  });

  test("lays out architecture components while preserving authored boundary geometry", () => {
    const document = createDefaultDiagramDocument("architecture");
    const positions = computeDiagramLayout(document);
    expect(positions.client.x).toBeLessThan(positions.api.x);
    expect(positions.api.x).toBeLessThan(positions.database.x);
    expect(positions.system).toEqual({ x: 220, y: 64 });
    expect(compactArchitectureNodeSize("database")).toEqual({ width: 150, height: 72 });
    expect(compactArchitectureNodeSize("boundary", { width: 640, height: 360 })).toEqual({ width: 640, height: 360 });
  });

  test("separates generated architecture boundaries and keeps their children inside", () => {
    const document = compileDiagramIr({
      kind: "architecture",
      nodes: [
        { id: "one", label: "One", type: "boundary" },
        { id: "one-api", label: "API one", type: "service", parentId: "one" },
        { id: "two", label: "Two", type: "boundary" },
        { id: "two-api", label: "API two", type: "service", parentId: "two" },
      ],
    });
    const one = document.nodes.find((node) => node.id === "one");
    const oneApi = document.nodes.find((node) => node.id === "one-api");
    const two = document.nodes.find((node) => node.id === "two");
    const twoApi = document.nodes.find((node) => node.id === "two-api");
    expect(one.y + one.height + 40).toBeLessThanOrEqual(two.y);
    for (const [boundary, child] of [[one, oneApi], [two, twoApi]]) {
      expect(child.x).toBeGreaterThan(boundary.x);
      expect(child.y).toBeGreaterThan(boundary.y);
      expect(child.x + child.width).toBeLessThan(boundary.x + boundary.width);
      expect(child.y + child.height).toBeLessThan(boundary.y + boundary.height);
    }
  });

  test("wraps a long architecture pipeline by boundary instead of shrinking it into one row", () => {
    const nodes = [];
    const edges = [];
    let previousId;
    for (let groupIndex = 0; groupIndex < 4; groupIndex += 1) {
      const boundaryId = `stage-${groupIndex}`;
      nodes.push({ id: boundaryId, label: `Stage ${groupIndex}`, type: "boundary" });
      for (let nodeIndex = 0; nodeIndex < 3; nodeIndex += 1) {
        const id = `${boundaryId}-node-${nodeIndex}`;
        nodes.push({ id, label: id, type: "service", parentId: boundaryId });
        if (previousId) edges.push({ source: previousId, target: id });
        previousId = id;
      }
    }
    const document = compileDiagramIr({ kind: "architecture", nodes, edges });
    const boundaries = document.nodes.filter((node) => node.shape === "boundary");
    const contentWidth = Math.max(...boundaries.map((node) => node.x + node.width))
      - Math.min(...boundaries.map((node) => node.x));
    expect(contentWidth).toBeLessThanOrEqual(1480);
    expect(new Set(boundaries.map((node) => node.y)).size).toBeGreaterThan(1);
  });

  test("returns a complete strategy result for every diagram kind", () => {
    for (const kind of ["mind-map", "flowchart", "architecture"]) {
      const document = createDefaultDiagramDocument(kind);
      const result = computeDiagramLayoutResult(document);
      expect(Object.keys(result.nodes).sort()).toEqual(document.nodes.map((node) => node.id).sort());
      expect([...result.nodeOrder].sort()).toEqual(document.nodes.map((node) => node.id).sort());
      for (const geometry of Object.values(result.nodes)) {
        expect(Number.isFinite(geometry.x)).toBeTrue();
        expect(Number.isFinite(geometry.y)).toBeTrue();
        expect(geometry.width).toBeGreaterThan(0);
        expect(geometry.height).toBeGreaterThan(0);
      }
      expect(result.viewport).toEqual(getDiagramLayoutViewport(kind));
    }
  });

  test("finalizes architecture boundary geometry inside the shared layout engine", () => {
    const document = createDefaultDiagramDocument("architecture");
    const result = computeDiagramLayoutResult(document);
    const boundary = result.nodes.system;
    expect(result.nodeOrder.indexOf("system")).toBeLessThan(result.nodeOrder.indexOf("api"));
    for (const childId of ["api", "database"]) {
      const child = result.nodes[childId];
      expect(child.x).toBeGreaterThan(boundary.x);
      expect(child.y).toBeGreaterThan(boundary.y);
      expect(child.x + child.width).toBeLessThan(boundary.x + boundary.width);
      expect(child.y + child.height).toBeLessThan(boundary.y + boundary.height);
    }
    expect(result.viewport.minScale).toBe(0.64);
  });
});
