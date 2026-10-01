import { expect, test } from "bun:test";
import { displayedDesktopAcpAdapter } from "./desktop-acp.ts";

test("a checked custom Antigravity executable takes priority over the managed connector status", () => {
  const managed = { id: "antigravity", label: "Antigravity", state: "failed", version: "1.2.1", managed: true };
  const custom = { id: "antigravity", label: "Antigravity", state: "available" };
  const input = { id: "antigravity", path: "/tmp/agy-acp", listed: [managed], probed: custom };
  expect(displayedDesktopAcpAdapter(input)).toBe(custom);
  expect(displayedDesktopAcpAdapter({ ...input, probed: null })).toBeUndefined();
  expect(displayedDesktopAcpAdapter({ ...input, path: "" })).toBe(managed);
});

test("a newly installed managed connector takes priority over an older probe", () => {
  const current = { id: "antigravity", label: "Antigravity", state: "available", version: "1.2.2", managed: true };
  const previous = { id: "antigravity", label: "Antigravity", state: "failed", version: "1.2.1", managed: true };
  expect(displayedDesktopAcpAdapter({ id: "antigravity", path: "", listed: [current], probed: previous })).toBe(current);
});
