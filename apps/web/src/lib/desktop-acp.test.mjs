import { expect, test } from "bun:test";
import { aiSidebarAdapterFromStorage, aiSidebarSourceFromStorage, displayedDesktopAcpAdapter } from "./desktop-acp.ts";

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

test("the sidebar follows a stored local agent only when the desktop bridge exists", () => {
  expect(aiSidebarSourceFromStorage("local", true)).toBe("local");
  expect(aiSidebarSourceFromStorage("local", false)).toBe("builtin");
  expect(aiSidebarSourceFromStorage("builtin", true)).toBe("builtin");
  expect(aiSidebarAdapterFromStorage("codex", "/tmp/ignored")).toEqual({ id: "codex" });
  expect(aiSidebarAdapterFromStorage("antigravity", " /tmp/agy ")).toEqual({ id: "antigravity", path: "/tmp/agy" });
  expect(aiSidebarAdapterFromStorage("missing", "")).toBeNull();
});

test("a prompt-time login failure takes priority over an earlier successful session probe", () => {
  const current = { id: "grokBuild", label: "Grok Build", state: "needs_login", authMethods: [{ id: "browser", name: "Browser" }] };
  const earlierProbe = { id: "grokBuild", label: "Grok Build", state: "available" };
  expect(displayedDesktopAcpAdapter({ id: "grokBuild", path: "", listed: [current], probed: earlierProbe })).toBe(current);
});

test("switching into an external agent starts a fresh chat without changing built-in chats", async () => {
  const { startsNewLocalAgentThread } = await import("./desktop-acp.ts");
  const builtin = { source: "builtin", adapterId: "codex" };
  const codex = { source: "local", adapterId: "codex" };
  const claude = { source: "local", adapterId: "claudeCode" };
  expect(startsNewLocalAgentThread(builtin, codex)).toBe(true);
  expect(startsNewLocalAgentThread(codex, claude)).toBe(true);
  expect(startsNewLocalAgentThread(codex, codex)).toBe(false);
  expect(startsNewLocalAgentThread(codex, builtin)).toBe(false);
});

test("agent selection reuses preference keys, preserves the custom path and notifies only after saving", async () => {
  const { selectAiSidebarAgent, AI_SIDEBAR_SELECTION_EVENT, AI_SIDEBAR_SOURCE_KEY, AI_SIDEBAR_ADAPTER_KEY, AI_SIDEBAR_ADAPTER_PATH_KEY } = await import("./desktop-acp.ts");
  const previousWindow = globalThis.window;
  const data = new Map([[AI_SIDEBAR_SOURCE_KEY, "builtin"], [AI_SIDEBAR_ADAPTER_KEY, "codex"], [AI_SIDEBAR_ADAPTER_PATH_KEY, "/custom/antigravity"]]);
  const snapshots = [];
  let fail = false;
  globalThis.window = {
    localStorage: {
      getItem: key => data.get(key) ?? null,
      setItem: (key, value) => {
        if (fail && key === AI_SIDEBAR_SOURCE_KEY) { fail = false; throw new Error("storage full"); }
        data.set(key, value);
      },
      removeItem: key => data.delete(key),
    },
    dispatchEvent: event => snapshots.push({ type: event.type, source: data.get(AI_SIDEBAR_SOURCE_KEY), adapter: data.get(AI_SIDEBAR_ADAPTER_KEY) }),
  };
  try {
    selectAiSidebarAgent("local", "claudeCode");
    expect(snapshots).toEqual([{ type: AI_SIDEBAR_SELECTION_EVENT, source: "local", adapter: "claudeCode" }]);
    expect(data.get(AI_SIDEBAR_ADAPTER_PATH_KEY)).toBe("/custom/antigravity");
    selectAiSidebarAgent("builtin");
    expect(data.get(AI_SIDEBAR_ADAPTER_KEY)).toBe("claudeCode");
    fail = true;
    expect(() => selectAiSidebarAgent("local", "codex")).toThrow("storage full");
    expect(data.get(AI_SIDEBAR_SOURCE_KEY)).toBe("builtin");
    expect(data.get(AI_SIDEBAR_ADAPTER_KEY)).toBe("claudeCode");
    expect(snapshots).toHaveLength(2);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
