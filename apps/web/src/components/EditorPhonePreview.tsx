import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useEditorTheme, useMermaidTheme } from "@/components/ThemeProvider";
import { embedMermaidForPreview } from "@/lib/phone-preview-mermaid";
import { Switch } from "@/components/ui/switch";
import { buildPhonePreviewHtml } from "@/lib/publish-layout";
import {
  readEditorPhonePreviewFollowPreference,
  writeEditorPhonePreviewFollowPreference,
} from "@/lib/app-helpers";

export const PhonePreviewGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
    <rect x="3.6" y="1.1" width="8.8" height="13.8" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <rect x="5.15" y="3.35" width="5.7" height="7.15" rx="0.55" fill="currentColor" opacity="0.2" />
    <rect x="6.35" y="2.15" width="3.3" height="0.85" rx="0.42" fill="currentColor" />
    <rect x="6.7" y="12.55" width="2.6" height="0.7" rx="0.35" fill="currentColor" />
  </svg>
);

type EditorPhonePreviewProps = {
  editor: Editor | null;
  title?: string;
  scrollContainer?: HTMLDivElement | null;
  className?: string;
};

const BLOCK_SELECTOR =
  "p, h1, h2, h3, li, blockquote, pre, img, table, hr, figure, [data-edgeever-theme-block]";

export const collectPhonePreviewBlocks = (root: Element, skipTitle = "") => {
  const blocks = [...root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)].filter((element) => {
    if (element.matches("[data-ee-publish-chrome]") || element.closest("[data-ee-publish-chrome]")) {
      return false;
    }
    const parentBlock = element.parentElement?.closest(BLOCK_SELECTOR);
    if (parentBlock && parentBlock !== element && root.contains(parentBlock)) {
      return false;
    }
    return true;
  });

  const trimmedTitle = skipTitle.trim();
  if (trimmedTitle && blocks[0]?.tagName === "H1" && blocks[0].textContent?.trim() === trimmedTitle) {
    return blocks.slice(1);
  }
  return blocks;
};

const fingerprint = (element: HTMLElement) =>
  `${element.tagName}:${(element.innerText || element.getAttribute("src") || "").replace(/\s+/g, " ").trim().slice(0, 48)}`;

const blockAtReadLine = (blocks: HTMLElement[], viewportTop: number) =>
  blocks.find((element) => element.getBoundingClientRect().bottom > viewportTop + 8) ?? blocks[0] ?? null;

const matchPreviewBlock = (editorBlocks: HTMLElement[], previewBlocks: HTMLElement[], source: HTMLElement) => {
  const index = editorBlocks.indexOf(source);
  if (index >= 0 && previewBlocks[index]) return previewBlocks[index];
  const key = fingerprint(source);
  return previewBlocks.find((element) => fingerprint(element) === key) ?? null;
};

const alignElement = (scroller: HTMLElement, target: HTMLElement, viewportTop: number) => {
  const delta = target.getBoundingClientRect().top - viewportTop;
  if (Math.abs(delta) < 4) return;
  scroller.scrollTop += delta;
};

export const EditorPhonePreview = ({ editor, title, scrollContainer, className }: EditorPhonePreviewProps) => {
  const { t } = useTranslation();
  const { editorTheme } = useEditorTheme();
  const { mermaidTheme } = useMermaidTheme();
  const previewSyncGeneration = useRef(0);
  const [markup, setMarkup] = useState({ html: "", style: "", paper: false });
  const [follow, setFollow] = useState(readEditorPhonePreviewFollowPreference);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      setMarkup({ html: "", style: "", paper: false });
      return;
    }

    const sync = () => {
      if (editor.isDestroyed) return;
      const generation = ++previewSyncGeneration.current;
      const nextMarkup = buildPhonePreviewHtml(editor.getHTML(), title ?? "", editorTheme);
      const holder = document.createElement("div");
      holder.innerHTML = nextMarkup.html;
      void embedMermaidForPreview(holder, editor, mermaidTheme).then(() => {
        if (generation !== previewSyncGeneration.current) return;
        setMarkup({
          ...nextMarkup,
          html: holder.innerHTML,
        });
      });
    };

    sync();
    editor.on("update", sync);
    editor.on("create", sync);
    return () => {
      editor.off("update", sync);
      editor.off("create", sync);
    };
  }, [editor, editorTheme, mermaidTheme, title]);

  const handleFollowChange = (enabled: boolean) => {
    setFollow(enabled);
    writeEditorPhonePreviewFollowPreference(enabled);
  };

  const syncFromEditor = useCallback(() => {
    if (!follow || syncingRef.current || !editor || editor.isDestroyed) return;
    const preview = previewRef.current;
    const editorRoot = editor.view.dom;
    if (!preview || !scrollContainer) return;

    const editorBlocks = collectPhonePreviewBlocks(editorRoot);
    const previewBlocks = collectPhonePreviewBlocks(preview, title);
    if (editorBlocks.length === 0 || previewBlocks.length === 0) return;

    const source = blockAtReadLine(editorBlocks, scrollContainer.getBoundingClientRect().top + 72);
    if (!source) return;
    const dest = matchPreviewBlock(editorBlocks, previewBlocks, source);
    if (!dest) return;

    syncingRef.current = true;
    alignElement(preview, dest, preview.getBoundingClientRect().top + 52);
    window.requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  }, [editor, follow, scrollContainer, title]);

  const syncFromPreview = useCallback(() => {
    if (!follow || syncingRef.current || !editor || editor.isDestroyed) return;
    const preview = previewRef.current;
    const editorRoot = editor.view.dom;
    if (!preview || !scrollContainer) return;

    const editorBlocks = collectPhonePreviewBlocks(editorRoot);
    const previewBlocks = collectPhonePreviewBlocks(preview, title);
    if (editorBlocks.length === 0 || previewBlocks.length === 0) return;

    const source = blockAtReadLine(previewBlocks, preview.getBoundingClientRect().top + 52);
    if (!source) return;
    const dest = matchPreviewBlock(previewBlocks, editorBlocks, source);
    if (!dest) return;

    syncingRef.current = true;
    alignElement(scrollContainer, dest, scrollContainer.getBoundingClientRect().top + 72);
    window.requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  }, [editor, follow, scrollContainer, title]);

  useEffect(() => {
    if (!follow) return;
    const frame = window.requestAnimationFrame(syncFromEditor);
    return () => window.cancelAnimationFrame(frame);
  }, [follow, markup.html, syncFromEditor]);

  useEffect(() => {
    if (!follow || !scrollContainer) return;
    scrollContainer.addEventListener("scroll", syncFromEditor, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", syncFromEditor);
  }, [follow, scrollContainer, syncFromEditor]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!follow || !preview) return;
    preview.addEventListener("scroll", syncFromPreview, { passive: true });
    return () => preview.removeEventListener("scroll", syncFromPreview);
  }, [follow, markup.html, syncFromPreview]);

  useEffect(() => {
    if (!follow || !editor || editor.isDestroyed) return;
    editor.on("selectionUpdate", syncFromEditor);
    return () => {
      editor.off("selectionUpdate", syncFromEditor);
    };
  }, [editor, follow, syncFromEditor]);

  return (
    <aside
      className={cn("edgeever-phone-stage sticky top-0 hidden xl:flex", className)}
      aria-label={t("editor.phonePreview")}
    >
      <label className="mb-3 flex w-full items-center justify-end gap-2 px-5 text-xs text-slate-500">
        <span>{t("editor.phonePreviewFollow")}</span>
        <Switch
          checked={follow}
          aria-label={t("editor.phonePreviewFollow")}
          onCheckedChange={handleFollowChange}
        />
      </label>
      <div className="edgeever-phone-device">
        <span className="edgeever-phone-device__silent" aria-hidden="true" />
        <span className="edgeever-phone-device__vol-up" aria-hidden="true" />
        <span className="edgeever-phone-device__vol-down" aria-hidden="true" />
        <span className="edgeever-phone-device__power" aria-hidden="true" />
        <div className="edgeever-phone-device__screen">
          <div className="edgeever-phone-device__top" aria-hidden="true" />
          <div className="edgeever-phone-device__island" aria-hidden="true">
            <span className="edgeever-phone-device__lens" />
          </div>
          <div
            className={cn("edgeever-phone-preview", markup.paper ? "edgeever-phone-preview--article" : "edgeever-phone-preview--editor")}
            ref={(node) => {
              previewRef.current = node;
              if (node) node.setAttribute("style", markup.style);
            }}
          >
            {markup.html ? (
              <div
                className={markup.paper ? "edgeever-phone-article" : "ProseMirror"}
                dangerouslySetInnerHTML={{ __html: markup.html }}
              />
            ) : (
              <p className="pt-10 text-center text-sm text-slate-400">{t("editor.phonePreviewEmpty")}</p>
            )}
          </div>
          <div className="edgeever-phone-device__home" aria-hidden="true" />
        </div>
      </div>
    </aside>
  );
};
