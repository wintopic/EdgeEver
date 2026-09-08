import { visualTextUnits } from "./diagram-node-presentation";

export type MindMapRole = "root" | "primary" | "nested";

export type MindMapPalette = {
  topicFill: string;
  topicText: string;
  nodeFill: string;
  nodeText: string;
  nodeStroke: string;
  topicStroke: string;
  mindMapEdge: string;
  canvas: string;
};

export type MindMapPoint = { x: number; y: number };
export type MindMapBox = { x: number; y: number; width: number; height: number };

export const MIND_MAP_CONNECTOR_NAME = "edgeever-mindmap";
export const MIND_MAP_HORIZONTAL_GAP = 72;
export const MIND_MAP_VERTICAL_GAP = 20;
export const MIND_MAP_LABEL_FONT =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

type MindMapSizedNode = { id: string; parentId?: string };

const wrapVisualText = (label: string, capacity: number) => label.split("\n").flatMap((paragraph) => {
  const lines: string[] = [];
  let line = "";
  for (const character of Array.from(paragraph)) {
    if (line && visualTextUnits(line + character) > capacity) {
      lines.push(line);
      line = "";
    }
    line += character;
  }
  lines.push(line);
  return lines;
});

export const mindMapNodeRole = (
  nodes: MindMapSizedNode[],
  nodeId: string,
): MindMapRole => {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const node = byId.get(nodeId);
  if (!node?.parentId) return "root";
  const parent = byId.get(node.parentId);
  if (!parent?.parentId) return "primary";
  return "nested";
};

export const mindMapNodeSize = (label: string, role: MindMapRole = "primary") => {
  const isRoot = role === "root";
  return {
    width: Math.round(Math.min(
      isRoot ? 180 : 168,
      Math.max(isRoot ? 124 : 96, visualTextUnits(label) * 13 + (isRoot ? 36 : 28)),
    )),
    height: isRoot ? 46 : 36,
  };
};

export const compactMindMapNodeSize = (label: string, isRoot: boolean) => (
  mindMapNodeSize(label, isRoot ? "root" : "primary")
);

export const mindMapNodePresentation = (label: string, role: MindMapRole) => {
  const size = mindMapNodeSize(label, role);
  const lineHeight = role === "root" ? 20 : 18;
  const padX = role === "root" ? 36 : 28;
  const lines = wrapVisualText(label, Math.max(4, (size.width - padX) / 13));
  return {
    ...size,
    height: Math.max(size.height, lines.length * lineHeight + (role === "root" ? 18 : 14)),
    text: lines.join("\n"),
    fontSize: role === "root" ? 15 : role === "primary" ? 14 : 13,
  };
};

export const mindMapRootRadius = (height: number) => Math.round(Math.max(1, height / 2));

export const mindMapNodeVisual = (role: MindMapRole, palette: MindMapPalette) => {
  if (role === "root") {
    return {
      body: {
        fill: palette.topicFill,
        stroke: palette.topicStroke,
        strokeWidth: 1.5,
        rx: 23,
        ry: 23,
      },
      label: {
        fill: palette.topicText,
        fontSize: 15,
        fontWeight: 650,
        fontFamily: MIND_MAP_LABEL_FONT,
      },
    };
  }
  if (role === "primary") {
    return {
      body: {
        fill: palette.nodeFill,
        stroke: palette.topicStroke,
        strokeWidth: 1.5,
        rx: 10,
        ry: 10,
      },
      label: {
        fill: palette.nodeText,
        fontSize: 14,
        fontWeight: 650,
        fontFamily: MIND_MAP_LABEL_FONT,
      },
    };
  }
  return {
    body: {
      fill: palette.canvas,
      stroke: palette.nodeStroke,
      strokeWidth: 1,
      rx: 8,
      ry: 8,
    },
    label: {
      fill: palette.nodeText,
      fontSize: 13,
      fontWeight: 500,
      fontFamily: MIND_MAP_LABEL_FONT,
    },
  };
};

export const mindMapEdgeVisual = (sourceRole: MindMapRole, palette: MindMapPalette) => (
  sourceRole === "root"
    ? { stroke: palette.mindMapEdge, sourceWidth: 3.1, targetWidth: 1.55 }
    : sourceRole === "primary"
      ? { stroke: palette.mindMapEdge, sourceWidth: 1.85, targetWidth: 1.15 }
      : { stroke: palette.mindMapEdge, sourceWidth: 1.25, targetWidth: 0.9 }
);

export const mindMapBranchSides = (source: MindMapBox, target: MindMapBox) => {
  const sourceCenter = source.x + source.width / 2;
  const targetCenter = target.x + target.width / 2;
  return targetCenter >= sourceCenter
    ? { source: "right" as const, target: "left" as const }
    : { source: "left" as const, target: "right" as const };
};

const formatPoint = (value: number) => (Math.round(value * 100) / 100).toFixed(2);

const cubicPoint = (p0: MindMapPoint, p1: MindMapPoint, p2: MindMapPoint, p3: MindMapPoint, t: number) => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

const cubicTangent = (p0: MindMapPoint, p1: MindMapPoint, p2: MindMapPoint, p3: MindMapPoint, t: number) => {
  const u = 1 - t;
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
};

export const mindMapConnectorPath = (
  sourcePoint: MindMapPoint,
  targetPoint: MindMapPoint,
  sourceWidth = 2.4,
  targetWidth = 1.15,
) => {
  const dx = targetPoint.x - sourcePoint.x;
  const dy = targetPoint.y - sourcePoint.y;
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
    return `M ${formatPoint(sourcePoint.x)} ${formatPoint(sourcePoint.y)} L ${formatPoint(targetPoint.x)} ${formatPoint(targetPoint.y)}`;
  }
  const controlX = (sourcePoint.x + targetPoint.x) / 2;
  const p0 = sourcePoint;
  const p1 = { x: controlX, y: sourcePoint.y };
  const p2 = { x: controlX, y: targetPoint.y };
  const p3 = targetPoint;
  const samples = 20;
  const left: MindMapPoint[] = [];
  const right: MindMapPoint[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    const point = cubicPoint(p0, p1, p2, p3, t);
    const tangent = cubicTangent(p0, p1, p2, p3, t);
    const length = Math.hypot(tangent.x, tangent.y) || 1;
    const half = ((1 - t) * sourceWidth + t * targetWidth) / 2;
    const nx = -tangent.y / length;
    const ny = tangent.x / length;
    left.push({ x: point.x + nx * half, y: point.y + ny * half });
    right.push({ x: point.x - nx * half, y: point.y - ny * half });
  }
  const start = left[0];
  const commands = [`M ${formatPoint(start.x)} ${formatPoint(start.y)}`];
  for (let index = 1; index < left.length; index += 1) {
    commands.push(`L ${formatPoint(left[index].x)} ${formatPoint(left[index].y)}`);
  }
  for (let index = right.length - 1; index >= 0; index -= 1) {
    commands.push(`L ${formatPoint(right[index].x)} ${formatPoint(right[index].y)}`);
  }
  commands.push("Z");
  return commands.join(" ");
};

export const mindMapConnector = (
  sourcePoint: MindMapPoint,
  targetPoint: MindMapPoint,
  _routePoints?: MindMapPoint[],
  options: { sourceWidth?: number; targetWidth?: number; raw?: boolean } = {},
) => mindMapConnectorPath(
  sourcePoint,
  targetPoint,
  options.sourceWidth,
  options.targetWidth,
);
