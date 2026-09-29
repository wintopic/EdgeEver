import { describe, expect, test } from "bun:test";
import {
  DEFAULT_NOTE_PROSE_CUSTOM_COLORS,
  MAX_NOTE_PROSE_CSS_BYTES,
  NoteProseUpdateSchema,
  noteProseCodeFontSize,
  noteProseMigrationPatch,
  paletteForLegacyEditorTheme,
  sanitizeNoteProseCss,
} from "@edgeever/shared";

const emptyAccount = () => ({
  fontSize: null,
  lineHeight: null,
  palette: null,
  customCss: null,
  customColors: null,
});

describe("note prose", () => {
  test("maps retired editor themes onto color names and leaves the native theme unset", () => {
    expect(paletteForLegacyEditorTheme("stance")).toBe("clay");
    expect(paletteForLegacyEditorTheme("stub")).toBe("dawn");
    expect(paletteForLegacyEditorTheme("letter")).toBe("dawn");
    expect(paletteForLegacyEditorTheme("grove")).toBe("emerald");
    expect(paletteForLegacyEditorTheme("minimal-emerald")).toBe("emerald");
    expect(paletteForLegacyEditorTheme("wechat-green")).toBe("emerald");
    expect(paletteForLegacyEditorTheme("brief")).toBe("teal");
    expect(paletteForLegacyEditorTheme("zen")).toBe("teal");
    expect(paletteForLegacyEditorTheme("guide")).toBe("azure");
    expect(paletteForLegacyEditorTheme("blueprint")).toBe("azure");
    expect(paletteForLegacyEditorTheme("outline")).toBe("violet");
    expect(paletteForLegacyEditorTheme("journal")).toBe("slate");
    expect(paletteForLegacyEditorTheme("default")).toBeNull();
    expect(paletteForLegacyEditorTheme("marxico")).toBeNull();
    expect(paletteForLegacyEditorTheme("custom-default")).toBe("custom");
    expect(paletteForLegacyEditorTheme("not-a-theme")).toBeNull();
  });

  test("steps code one preset below the body size", () => {
    expect(noteProseCodeFontSize(14)).toBe(12);
    expect(noteProseCodeFontSize(16)).toBe(14);
    expect(noteProseCodeFontSize(18)).toBe(16);
    expect(noteProseCodeFontSize(20)).toBe(18);
  });

  test("drops font size, line height, and urls from account CSS", () => {
    const css = sanitizeNoteProseCss("p { color: red; font-size: 40px; line-height: 3; margin: 1em 0; background: url(https://evil.test/a.png); } @import 'x';");
    expect(css).toContain("color: red");
    expect(css).toContain("margin: 1em 0");
    expect(css).not.toContain("font-size");
    expect(css).not.toContain("line-height");
    expect(css).not.toContain("url(");
    expect(css).not.toContain("@import");
  });

  test("fills only account fields that were never set", () => {
    expect(noteProseMigrationPatch(emptyAccount(), {
      palette: "emerald",
      customCss: "p { color: red; }",
      customColors: null,
    })).toEqual({
      palette: "emerald",
      customCss: "p { color: red; }",
    });

    expect(noteProseMigrationPatch({
      ...emptyAccount(),
      palette: "native",
      customCss: "",
    }, {
      palette: "clay",
      customCss: "h1 { letter-spacing: 0.04em; }",
      customColors: null,
    })).toEqual({});

    const custom = noteProseMigrationPatch(emptyAccount(), {
      palette: "custom",
      customCss: "   ",
      customColors: null,
    });
    expect(custom.palette).toBe("custom");
    expect(custom.customCss).toBeUndefined();
    expect(custom.customColors).toEqual(DEFAULT_NOTE_PROSE_CUSTOM_COLORS);
  });

  test("rejects a stylesheet larger than 8 KB", () => {
    expect(NoteProseUpdateSchema.safeParse({
      customCss: "p { color: red; }",
    }).success).toBe(true);
    expect(NoteProseUpdateSchema.safeParse({
      customCss: "a".repeat(MAX_NOTE_PROSE_CSS_BYTES + 1),
    }).success).toBe(false);
    expect(NoteProseUpdateSchema.safeParse({}).success).toBe(false);
    expect(MAX_NOTE_PROSE_CSS_BYTES).toBe(8192);
  });
});
