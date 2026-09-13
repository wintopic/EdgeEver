import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  DEFAULT_PUBLISH_LAYOUT,
  DEFAULT_PUBLISH_PALETTE,
  PUBLISH_LAYOUT_IDS,
  PUBLISH_LAYOUT_RHYTHM,
  PUBLISH_PALETTE_IDS,
  PUBLISH_PALETTES,
  assertWeChatSafeCss,
  buildPublishStyles,
  collectPublishStyleText,
  formatChapterIndex,
  planHeadingDecoration,
  publishEditorCssVars,
  resolvePaperEditorTheme,
  resolveStoredPublishLayout,
  resolveStoredPublishPalette,
} from "./publish-layout.ts";

describe("publish layout catalog", () => {
  test("keeps ten paper editor themes and eight palettes", () => {
    expect(PUBLISH_LAYOUT_IDS).toEqual([
      "letter",
      "guide",
      "blueprint",
      "journal",
      "stance",
      "stub",
      "brief",
      "outline",
      "zen",
      "grove",
    ]);
    expect(PUBLISH_PALETTE_IDS).toHaveLength(8);
    expect(DEFAULT_PUBLISH_LAYOUT).toBe("letter");
    expect(DEFAULT_PUBLISH_PALETTE).toBe("emerald");
    expect(PUBLISH_PALETTES.emerald.accent).toBe("#16A06E");
  });

  test("maps paper editor themes to a fixed layout and palette", () => {
    expect(resolvePaperEditorTheme("letter")).toEqual({ layout: "letter", palette: "dawn" });
    expect(resolvePaperEditorTheme("guide")).toEqual({ layout: "guide", palette: "emerald" });
    expect(resolvePaperEditorTheme("default")).toBeNull();
  });

  test("falls back to defaults for unknown stored values", () => {
    expect(resolveStoredPublishLayout(null)).toBe("letter");
    expect(resolveStoredPublishLayout("sunlit-ledger")).toBe("letter");
    expect(resolveStoredPublishPalette("morning-cream")).toBe("emerald");
    expect(resolveStoredPublishPalette("dawn")).toBe("dawn");
  });

  test("numbers letter and blueprint chapters without CSS counters", () => {
    expect(formatChapterIndex(0)).toBe("01");
    expect(planHeadingDecoration("h2", "letter", 0)).toEqual({ kind: "chapter", chapterLabel: "01" });
    expect(planHeadingDecoration("h2", "blueprint", 1)).toEqual({ kind: "chapter", chapterLabel: "02" });
    expect(planHeadingDecoration("h2", "stub", 0)).toEqual({ kind: "chapter", chapterLabel: "01" });
    expect(planHeadingDecoration("h2", "guide", 0)).toEqual({ kind: "none" });
    expect(planHeadingDecoration("h1", "letter", 0)).toEqual({ kind: "title" });
  });
});

describe("publish layout CSS", () => {
  test("typesets phone output for a 375-wide reading column", () => {
    const phone = buildPublishStyles("letter", PUBLISH_PALETTES.emerald, "phone");
    const desktop = buildPublishStyles("letter", PUBLISH_PALETTES.emerald, "desktop");

    expect(phone.p).toContain("font-size: 15px");
    expect(phone.p).toContain("line-height: 1.9");
    expect(phone.p).toContain("margin: 0 0 16px");
    expect(phone.h1).toContain("font-size: 24px");
    expect(phone.h2).toContain("font-size: 20px");
    expect(desktop.p).toContain("font-size: 15px");
    expect(desktop.p).toContain("line-height: 1.9");
  });

  test("uses a looser reading rhythm than the note editor contract", () => {
    const letter = buildPublishStyles("letter", PUBLISH_PALETTES.emerald);
    const guide = buildPublishStyles("guide", PUBLISH_PALETTES.emerald);

    expect(letter.p).toContain("line-height: 1.9");
    expect(letter.p).toContain("margin: 0 0 24px");
    expect(letter.h1).toContain("text-align: center");
    expect(guide.h2).toContain("border-left: 4px solid #16A06E");
    expect(letter.blockquote).toContain("border-radius: 12px");
    expect(letter.strong).toContain("color: #16A06E");
  });

  test("keeps WeChat-safe inline CSS for every layout and palette", () => {
    for (const layout of PUBLISH_LAYOUT_IDS) {
      for (const paletteId of PUBLISH_PALETTE_IDS) {
        const css = collectPublishStyleText(buildPublishStyles(layout, PUBLISH_PALETTES[paletteId]));
        expect(assertWeChatSafeCss(css)).toBe(true);
      }
    }
  });
});

describe("copy pipeline wiring", () => {
  test("wechat copy follows paper editor themes and keeps compact copy for other themes", () => {
    const source = readFileSync(new URL("./wechat-copy.ts", import.meta.url), "utf8");
    const preferenceCard = readFileSync(new URL("../components/settings/PreferenceCard.tsx", import.meta.url), "utf8");

    expect(source).toContain("resolvePaperEditorTheme");
    expect(source).toContain("applyPublishLayout");
    expect(source).toContain('"phone"');
    expect(source).toContain("MEMO_CONTENT_STYLE");
    expect(preferenceCard).not.toContain('t("settings.publishLayoutTitle")');
    expect(preferenceCard).toContain('t("settings.editorThemes.letter")');
  });

  test("drives the rich editor rhythm from paper editor themes", () => {
    const editorPane = readFileSync(new URL("../components/EditorPane.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../styles/publish-layout.css", import.meta.url), "utf8");
    const vars = publishEditorCssVars("letter", "dawn");

    expect(PUBLISH_LAYOUT_RHYTHM.letter.lineHeight).toBe("1.9");
    expect(PUBLISH_LAYOUT_RHYTHM.letter.paragraphSpacing).toBe("24px");
    expect(vars["--editor-body-line-height"]).toBe("1.9");
    expect(vars["--publish-accent"]).toBe("#C49A3C");
    expect(editorPane).toContain("isPaperEditorTheme(editorTheme)");
    expect(editorPane).toContain('data-paper-theme={isPaperEditorTheme(editorTheme) ? "true" : undefined}');
    expect(editorPane).toContain("publishEditorCssVars");
    expect(editorPane).toContain('data-publish-surface={isMobileViewport ? "phone" : "desktop"}');
    expect(css).toContain("counter-increment: publish-h2");
    expect(css).toContain("[data-paper-theme]");
    expect(css).toContain('[data-editor-theme="letter"]');
    expect(css).toContain('[data-editor-theme="stance"]');
    expect(css).toContain('[data-editor-theme="grove"]');
    expect(css).not.toMatch(/\.ProseMirror p\s*\{[^}]*line-height\s*:/);
  });

  test("phone preview markup applies the paper layout instead of raw editor chrome", () => {
    const source = readFileSync(new URL("./publish-layout.ts", import.meta.url), "utf8");
    expect(source).toContain("export const buildPhonePreviewHtml");
    expect(source).toContain('applyPublishLayout(root, paper.layout, paper.palette, "phone")');
  });
});
