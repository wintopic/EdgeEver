import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("editor content alignment preference", () => {
  test("is configured from settings instead of the per-note toolbar", () => {
    const preferenceCard = readFileSync(new URL("./PreferenceCard.tsx", import.meta.url), "utf8");
    const editorPane = readFileSync(new URL("../EditorPane.tsx", import.meta.url), "utf8");

    expect(preferenceCard).toContain('t("settings.editorContentAlignmentTitle")');
    expect(preferenceCard).toContain('onEditorContentAlignmentChange(value as EditorContentAlignment)');
    expect(editorPane).not.toContain("onToggleEditorContentAlignment");
  });
});

describe("appearance preference", () => {
  test("exposes light, dark, and system as a first-class setting", () => {
    const preferenceCard = readFileSync(new URL("./PreferenceCard.tsx", import.meta.url), "utf8");

    expect(preferenceCard).toContain('t("settings.themeTitle")');
    expect(preferenceCard).toContain('setAppearancePreference(value as ThemePreference)');
    expect(preferenceCard).toContain('value="system"');
    expect(preferenceCard).toContain('value="light"');
    expect(preferenceCard).toContain('value="dark"');
  });
});

describe("paper editor themes", () => {
  test("offers the paper editor themes alongside existing presets", () => {
    const preferenceCard = readFileSync(new URL("./PreferenceCard.tsx", import.meta.url), "utf8");

    expect(preferenceCard).not.toContain('t("settings.publishLayoutTitle")');
    expect(preferenceCard).toContain('value="letter"');
    expect(preferenceCard).toContain('t("settings.editorThemes.letter")');
    expect(preferenceCard).toContain('t("settings.editorThemes.guide")');
    expect(preferenceCard).toContain('t("settings.editorThemes.blueprint")');
    expect(preferenceCard).toContain('t("settings.editorThemes.journal")');
    expect(preferenceCard).toContain('t("settings.editorThemes.stance")');
    expect(preferenceCard).toContain('t("settings.editorThemes.stub")');
    expect(preferenceCard).toContain('t("settings.editorThemes.brief")');
    expect(preferenceCard).toContain('t("settings.editorThemes.outline")');
    expect(preferenceCard).toContain('t("settings.editorThemes.zen")');
    expect(preferenceCard).toContain('t("settings.editorThemes.grove")');
  });
});

describe("custom editor theme portability", () => {
  test("offers import and export while keeping contrast as a warning", () => {
    const dialog = readFileSync(new URL("./CustomEditorThemeDialog.tsx", import.meta.url), "utf8");

    expect(dialog).toContain('t("settings.customEditorTheme.import")');
    expect(dialog).toContain('t("settings.customEditorTheme.export")');
    expect(dialog).toContain("activeContrastIssues.length > 0");
    expect(dialog).not.toContain("hasAccessibleContrast(draft.light)");
  });
});
