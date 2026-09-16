import { jsonSchema, tool, type ToolSet } from "ai";
import type { CompanionSource, CompanionTurnInput, MemoDetail, MemoSummary } from "@edgeever/shared";
import type { DatabaseAdapter } from "./storage-contract";
import type { AppContext } from "./api-context";
import type { CompanionScope } from "./companion-service";
import { COMPANION_MCP_TOOLS, validateCompanionTool } from "./companion-tool-catalog";
import { companionWorkspaceCursor, proposeCompanionToolAction } from "./companion-tool-actions";
import { executeWorkspaceTool } from "./mcp-tool-executor";
import { getMemoDetail } from "./memo-service";
import { AppError } from "./app-error";

const AUTO_APPLY_WRITES = new Set(
  COMPANION_MCP_TOOLS.filter(tool => !tool.annotations.readOnlyHint).map(tool => tool.name),
);

export function createCompanionTools(args: { db: DatabaseAdapter; scope: CompanionScope; input: CompanionTurnInput;
  context?: AppContext; signal: AbortSignal; assertActive: () => Promise<void>; sources: CompanionSource[] }): ToolSet {
  if (!args.input.allowNotes || !args.context) return {};
  let calls = 0;
  let noteRemaining = 12000;
  let metadataRemaining = 12000;
  let cursor: number | undefined;
  const inspected = new Map<string, number>();
  const takeNoteText = (text: string, limit: number) => {
    const result = text.slice(0, Math.min(limit, noteRemaining));
    noteRemaining -= result.length;
    return result;
  };
  const remember = (memo: MemoSummary) => {
    const source = { id: memo.id, title: (memo.title ?? "").slice(0, 200), revision: memo.revision, notebookId: memo.notebookId };
    const index = args.sources.findIndex(item => item.id === memo.id);
    if (index < 0) args.sources.push(source); else args.sources[index] = source;
    return source;
  };
  const catalog = COMPANION_MCP_TOOLS.filter(definition =>
    args.input.allowWrites !== false || definition.annotations.readOnlyHint);
  const toolHints: Record<string, string> = {
    find_notebooks: " Use this whenever the user names a notebook. Notebook names are not IDs.",
    list_notebooks: " Use this to list every notebook name. Do not guess names from the open note.",
    list_memos: " To list a named notebook, call find_notebooks first and pass that id. Without notebookId this lists the whole workspace, newest updated first. For newly created notes in a time range, use search_memos with createdAfter. If hasMore is true, say the list is incomplete.",
    search_memos: " Searches note titles and bodies, not notebook names. query is optional. For recently created or added notes, pass createdAfter (YYYY-MM-DD or ISO date-time) and omit query; never put this week/最近/新增 in query. For recently edited notes, use updatedAfter. Do not pass notebookId unless find_notebooks or list_notebooks returned it. For notes in a named notebook, find_notebooks then list_memos. If hasMore is true, say the list is incomplete.",
    list_tags: " Use this when the user names a tag.",
    create_memo: " For prose Markdown notes only. Never use this for 思维导图/mind maps, 流程图/flowcharts, or 架构图; use create_diagram_memo.",
    create_diagram_memo: " Create an editable visual diagram note. kind=mind-map for 思维导图/mind map, flowchart for 流程图, architecture for 架构图. For mind maps, give a root and children with parentId; omit node type. If the user did not name a notebook, use the open notebook id from Focus DATA. Build nodes from the open note body in Focus DATA when the user refers to this note.",
    get_diagram: " Read an existing editable diagram as a semantic graph. Call this before update_diagram. Do not use get_memo when you only need the diagram structure.",
    update_diagram: " Edit an existing diagram after get_diagram. Pass expectedRevision from get_diagram. Use add_node, update_node, remove_node, add_edge, update_edge, or remove_edge. Do not create a new diagram unless the user asked for a new note.",
    use_note_template: " Create a new memo from a template. If the user did not name a notebook, use the open notebook id from Focus DATA.",
    create_note_template: " Save a reusable note template from Markdown or from an existing memoId.",
    list_ai_instructions: " List the user's reusable AI instructions, including built-in ones.",
  };
  let notebookNames: Map<string, string> | undefined;
  const notebookName = async (id: string) => {
    try {
      if (!notebookNames) {
        const listed = await executeWorkspaceTool(args.context!, args.context!.get("auth"), "list_notebooks", {}) as { notebooks: { id: string; name: string }[] };
        notebookNames = new Map((listed.notebooks ?? []).map(notebook => [notebook.id, notebook.name]));
      }
      return notebookNames.get(id);
    } catch {
      return undefined;
    }
  };
  return Object.fromEntries(catalog.map(definition => {
    const readOnly = definition.annotations.readOnlyHint;
    const autoApply = AUTO_APPLY_WRITES.has(definition.name);
    return [definition.name, tool({
      description: `${definition.description}${toolHints[definition.name] ?? ""}${readOnly || autoApply ? autoApply ? " This executes immediately. New notes are created in the named notebook. Trashed notes go to the recycle bin; edits keep revision history." : "" : " This only proposes changes; the user must confirm the card. Supply a short _reason."}`,
      inputSchema: jsonSchema<Record<string, unknown>>((readOnly || autoApply ? definition.inputSchema : {
        ...definition.inputSchema, properties: { ...definition.inputSchema.properties, _reason: { type: "string", minLength: 1, maxLength: 400 } },
        required: [...(definition.inputSchema.required ?? []), "_reason"],
      }) as Parameters<typeof jsonSchema>[0]),
      execute: async input => {
        args.signal.throwIfAborted();
        await args.assertActive();
        if (++calls > 16) throw new Error("Tool call limit reached.");
        const { _reason, ...parameters } = input;
        const { args: parameters_ } = validateCompanionTool(definition.name, parameters);
        const current = await companionWorkspaceCursor(args.db, args.scope.workspaceId);
        cursor ??= current;
        if (cursor !== current) return { error: "Notes changed during this request. Start a fresh request." };
        if (!readOnly && !autoApply && parameters_.dryRun !== true) return proposeCompanionToolAction(args.db, args.scope, args.input.id,
          definition.name, parameters_, typeof _reason === "string" ? _reason : definition.title, cursor, inspected);
        if (autoApply && parameters_.dryRun !== true && (definition.name === "update_memo" || definition.name === "update_diagram" || definition.name === "restore_memo_revision")) {
          const memo = await getMemoDetail(args.db, args.scope.workspaceId, String(parameters_.memoId));
          if (!memo || inspected.get(memo.id) !== memo.revision) {
            throw new AppError("companion_action_unread",
              definition.name === "update_diagram"
                ? "Call get_diagram on this note before changing it."
                : "Read the complete source notes before changing their content.", 400);
          }
          if (definition.name === "update_diagram") parameters_.expectedRevision = memo.revision;
        }
        if (autoApply && parameters_.dryRun !== true && definition.name === "merge_memos") {
          const memoIds = Array.isArray(parameters_.memoIds) ? parameters_.memoIds.map(String) : [];
          for (const memoId of memoIds) {
            const memo = await getMemoDetail(args.db, args.scope.workspaceId, memoId);
            if (!memo || inspected.get(memo.id) !== memo.revision) {
              throw new AppError("companion_action_unread", "Read every source note completely before merging.", 400);
            }
          }
        }
        if ((definition.name === "get_memo" || definition.name === "get_diagram") && inspected.has(String(parameters_.memoId))) {
          // The original full result remains in this run's model messages. Only
          // reuse it after authorization/context/cursor checks, never across runs.
          return { id: parameters_.memoId, revision: inspected.get(String(parameters_.memoId)), alreadyRead: true,
            message: "Use the complete result already returned in this run." };
        }
        let searchLimit: number | undefined;
        if (definition.name === "search_memos") {
          searchLimit = Math.min(Number(parameters_.limit ?? 20), 20);
          parameters_.limit = searchLimit + 1;
        }
        if (definition.name === "list_memos") {
          parameters_.limit = Math.min(Number(parameters_.limit ?? 20), 20);
          parameters_.includeContent = false;
        }
        if (definition.name === "get_diagram") parameters_.includeLayout = false;
        const result = await executeWorkspaceTool(args.context!, args.context!.get("auth"), definition.name, parameters_);
        if (autoApply && parameters_.dryRun !== true) {
          cursor = await companionWorkspaceCursor(args.db, args.scope.workspaceId);
          if (definition.name === "create_diagram_memo") {
            const created = result as { memo: MemoDetail; diagramKind?: string; diagram?: { nodes?: unknown[] } };
            remember(created.memo);
            return {
              applied: true,
              id: created.memo.id,
              title: created.memo.title,
              notebookId: created.memo.notebookId,
              notebookName: await notebookName(created.memo.notebookId),
              revision: created.memo.revision,
              diagramKind: created.diagramKind,
              nodeCount: Array.isArray(created.diagram?.nodes) ? created.diagram.nodes.length : undefined,
            };
          }
          if (definition.name === "update_diagram") {
            const updated = result as { memo: { id: string; title: string | null; revision: number }; diagram?: { nodes?: unknown[] }; changes?: unknown };
            inspected.set(updated.memo.id, updated.memo.revision);
            return {
              applied: true,
              id: updated.memo.id,
              title: updated.memo.title,
              revision: updated.memo.revision,
              nodeCount: Array.isArray(updated.diagram?.nodes) ? updated.diagram.nodes.length : undefined,
              changes: updated.changes,
            };
          }
          if ((definition.name === "create_memo" || definition.name === "use_note_template" || definition.name === "merge_memos")
            && result && typeof result === "object" && "memo" in result) {
            remember((result as { memo: MemoDetail }).memo);
          }
          return { applied: true, ...(typeof result === "object" && result ? result as object : { result }) };
        }
        if (current !== await companionWorkspaceCursor(args.db, args.scope.workspaceId)) return { error: "Notes changed during this read. Start a fresh request." };
        if (definition.name === "get_diagram") {
          const payload = result as { memo: { id: string; title: string | null; revision: number }; diagram: { kind?: string; nodes?: unknown[] } };
          inspected.set(payload.memo.id, payload.memo.revision);
          const known = args.sources.find(source => source.id === payload.memo.id);
          remember({
            id: payload.memo.id,
            title: payload.memo.title,
            revision: payload.memo.revision,
            notebookId: known?.notebookId || "",
          });
          return payload;
        }
        if (definition.name === "get_memo") {
          const payload = result as { memo: MemoDetail; diagram?: { kind?: string } };
          const memo = payload.memo;
          remember(memo);
          if (payload.diagram) {
            inspected.set(memo.id, memo.revision);
            return {
              id: memo.id, title: memo.title, notebookId: memo.notebookId, tags: memo.tags, revision: memo.revision,
              createdAt: memo.createdAt, updatedAt: memo.updatedAt, diagramKind: payload.diagram.kind, diagram: payload.diagram,
              message: "This is an editable diagram. Change it with update_diagram, not update_memo.",
            };
          }
          const content = takeNoteText(memo.contentMarkdown, 8000);
          if (content.length === memo.contentMarkdown.length) inspected.set(memo.id, memo.revision); else inspected.delete(memo.id);
          return { id: memo.id, title: memo.title, notebookId: memo.notebookId, tags: memo.tags, revision: memo.revision,
            createdAt: memo.createdAt, updatedAt: memo.updatedAt,
            content, truncated: content.length !== memo.contentMarkdown.length };
        }
        if (definition.name === "search_memos" || definition.name === "list_memos") {
          const listed = result as { memos: MemoSummary[]; hasMore?: boolean };
          const memos = searchLimit === undefined ? listed.memos : listed.memos.slice(0, searchLimit);
          return {
            ...listed,
            hasMore: searchLimit === undefined ? Boolean(listed.hasMore) : listed.memos.length > memos.length,
            memos: await Promise.all(memos.map(async memo => ({
              ...remember(memo),
              notebookId: memo.notebookId,
              notebookName: await notebookName(memo.notebookId),
              tags: memo.tags,
              createdAt: memo.createdAt,
              updatedAt: memo.updatedAt,
              excerpt: takeNoteText(memo.excerpt, 180),
            }))),
          };
        }
        const serialized = JSON.stringify(result);
        const text = serialized.slice(0, Math.min(8000, metadataRemaining));
        metadataRemaining -= text.length;
        return text.length === serialized.length ? result : { truncated: true, data: text };
      },
    })];
  }));
}
