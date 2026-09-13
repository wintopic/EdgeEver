export const PAPER_EDITOR_THEME_IDS = [
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
] as const;
export type PublishLayoutId = (typeof PAPER_EDITOR_THEME_IDS)[number];
export const PUBLISH_LAYOUT_IDS = PAPER_EDITOR_THEME_IDS;

export const PUBLISH_PALETTE_IDS = [
  "emerald",
  "ink",
  "dawn",
  "clay",
  "navy",
  "slate",
  "plum",
  "forest",
] as const;
export type PublishPaletteId = (typeof PUBLISH_PALETTE_IDS)[number];

export const DEFAULT_PUBLISH_LAYOUT: PublishLayoutId = "letter";
export const DEFAULT_PUBLISH_PALETTE: PublishPaletteId = "emerald";

export const PAPER_EDITOR_THEME_PALETTES = {
  letter: "dawn",
  guide: "emerald",
  blueprint: "navy",
  journal: "slate",
  stance: "clay",
  stub: "dawn",
  brief: "forest",
  outline: "ink",
  zen: "slate",
  grove: "forest",
} as const satisfies Record<PublishLayoutId, PublishPaletteId>;

export const isPaperEditorTheme = (value: string | null | undefined): value is PublishLayoutId =>
  Boolean(value && (PAPER_EDITOR_THEME_IDS as readonly string[]).includes(value));

export const resolvePaperEditorTheme = (theme: string | null | undefined) => {
  if (!isPaperEditorTheme(theme)) return null;
  return { layout: theme, palette: PAPER_EDITOR_THEME_PALETTES[theme] };
};

export const PUBLISH_LAYOUT_STORAGE_KEY = "edgeever.publish-layout";
export const PUBLISH_PALETTE_STORAGE_KEY = "edgeever.publish-palette";
export const PUBLISH_LAYOUT_CHANGED_EVENT = "edgeever:publish-layout-changed";

export type PublishPalette = {
  id: PublishPaletteId;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  text: string;
  textStrong: string;
  textMuted: string;
  surface: string;
  divider: string;
  link: string;
  codeBg: string;
  codeText: string;
  bg: string;
};

export const PUBLISH_PALETTES: Record<PublishPaletteId, PublishPalette> = {
  emerald: {
    id: "emerald",
    accent: "#16A06E",
    accentSoft: "#E8F6F0",
    accentBorder: "#B7E0CC",
    text: "#2C3A34",
    textStrong: "#14241C",
    textMuted: "#5C6F66",
    surface: "#F4FBF7",
    divider: "#D7EBE1",
    link: "#0F7A54",
    codeBg: "#F3F7F5",
    codeText: "#0F7A54",
    bg: "#FFFFFF",
  },
  ink: {
    id: "ink",
    accent: "#1A5C4A",
    accentSoft: "#E7F2EE",
    accentBorder: "#B5D2C8",
    text: "#24332E",
    textStrong: "#12201B",
    textMuted: "#5A6C65",
    surface: "#F3F8F6",
    divider: "#D3E3DD",
    link: "#164C3E",
    codeBg: "#EEF4F1",
    codeText: "#164C3E",
    bg: "#FFFFFF",
  },
  dawn: {
    id: "dawn",
    accent: "#C49A3C",
    accentSoft: "#FBF6EA",
    accentBorder: "#E8D7A8",
    text: "#3D3426",
    textStrong: "#2A2418",
    textMuted: "#7A6E58",
    surface: "#FFFCF6",
    divider: "#EFE3C8",
    link: "#8A6420",
    codeBg: "#FBF6EA",
    codeText: "#8A6420",
    bg: "#FFFFFF",
  },
  clay: {
    id: "clay",
    accent: "#C45C3E",
    accentSoft: "#FBEFEA",
    accentBorder: "#E8C4B6",
    text: "#3D2E29",
    textStrong: "#271C18",
    textMuted: "#7A635B",
    surface: "#FDF8F6",
    divider: "#EEDDD6",
    link: "#9A3E28",
    codeBg: "#F8EEE9",
    codeText: "#9A3E28",
    bg: "#FFFFFF",
  },
  navy: {
    id: "navy",
    accent: "#3B6B9A",
    accentSoft: "#EAF1F8",
    accentBorder: "#B7C9DC",
    text: "#2C3640",
    textStrong: "#162029",
    textMuted: "#5C6A78",
    surface: "#F5F8FB",
    divider: "#D7E1EB",
    link: "#2A5278",
    codeBg: "#EEF3F8",
    codeText: "#2A5278",
    bg: "#FFFFFF",
  },
  slate: {
    id: "slate",
    accent: "#5A6B73",
    accentSoft: "#EEF1F2",
    accentBorder: "#C5CED2",
    text: "#2F373B",
    textStrong: "#1A2023",
    textMuted: "#66747B",
    surface: "#F7F8F9",
    divider: "#DEE3E6",
    link: "#3E4C53",
    codeBg: "#F0F2F3",
    codeText: "#3E4C53",
    bg: "#FFFFFF",
  },
  plum: {
    id: "plum",
    accent: "#7A4E6E",
    accentSoft: "#F5EEF3",
    accentBorder: "#D4BCCB",
    text: "#3A2E36",
    textStrong: "#241820",
    textMuted: "#746068",
    surface: "#FBF7F9",
    divider: "#E8D7E0",
    link: "#5E3A54",
    codeBg: "#F4ECF1",
    codeText: "#5E3A54",
    bg: "#FFFFFF",
  },
  forest: {
    id: "forest",
    accent: "#4A7C4E",
    accentSoft: "#EAF3EB",
    accentBorder: "#BDD4BF",
    text: "#2E3A2F",
    textStrong: "#172017",
    textMuted: "#5E6E5F",
    surface: "#F5F9F5",
    divider: "#D6E4D7",
    link: "#37633B",
    codeBg: "#EEF4EE",
    codeText: "#37633B",
    bg: "#FFFFFF",
  },
};

export const isPublishLayoutId = (value: string | null | undefined): value is PublishLayoutId =>
  Boolean(value && (PUBLISH_LAYOUT_IDS as readonly string[]).includes(value));

export const isPublishPaletteId = (value: string | null | undefined): value is PublishPaletteId =>
  Boolean(value && (PUBLISH_PALETTE_IDS as readonly string[]).includes(value));

export const resolveStoredPublishLayout = (stored: string | null): PublishLayoutId =>
  isPublishLayoutId(stored) ? stored : DEFAULT_PUBLISH_LAYOUT;

export const resolveStoredPublishPalette = (stored: string | null): PublishPaletteId =>
  isPublishPaletteId(stored) ? stored : DEFAULT_PUBLISH_PALETTE;

const readStorage = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.setItem(key, value);
  } catch {
    // Private mode / blocked storage — preference stays session-only via the event.
  }
};

export const readPublishLayoutPreference = (): PublishLayoutId =>
  resolveStoredPublishLayout(readStorage(PUBLISH_LAYOUT_STORAGE_KEY));

export const readPublishPalettePreference = (): PublishPaletteId =>
  resolveStoredPublishPalette(readStorage(PUBLISH_PALETTE_STORAGE_KEY));

const notifyPublishLayoutChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PUBLISH_LAYOUT_CHANGED_EVENT));
};

export const writePublishLayoutPreference = (layout: PublishLayoutId) => {
  writeStorage(PUBLISH_LAYOUT_STORAGE_KEY, layout);
  notifyPublishLayoutChanged();
};

export const writePublishPalettePreference = (palette: PublishPaletteId) => {
  writeStorage(PUBLISH_PALETTE_STORAGE_KEY, palette);
  notifyPublishLayoutChanged();
};

export const formatChapterIndex = (index: number) => String(index + 1).padStart(2, "0");

export type PublishHeadingKind = "title" | "chapter" | "small" | "none";

export const planHeadingDecoration = (
  tag: string,
  layout: PublishLayoutId,
  chapterIndex: number,
): { kind: PublishHeadingKind; chapterLabel?: string } => {
  if (tag === "h1") return { kind: "title" };
  if (tag === "h3") return { kind: "small" };
  if (tag === "h2" && (layout === "letter" || layout === "blueprint" || layout === "stub" || layout === "outline")) {
    return { kind: "chapter", chapterLabel: formatChapterIndex(chapterIndex) };
  }
  return { kind: "none" };
};

export type PublishSurface = "desktop" | "phone";

export type PublishRhythm = {
  fontSize: string;
  lineHeight: string;
  paragraphSpacing: string;
  headingAlign: "left" | "center";
};

export const PHONE_ARTICLE_RHYTHM = {
  fontSize: "15px",
  lineHeight: "1.9",
  paragraphSpacing: "16px",
  h1Size: "24px",
  h2Size: "20px",
  h3Size: "15px",
} as const;

const resolvePublishRhythm = (layout: PublishLayoutId, surface: PublishSurface): PublishRhythm => {
  const desktop = PUBLISH_LAYOUT_RHYTHM[layout];
  if (surface !== "phone") return desktop;
  return {
    fontSize: PHONE_ARTICLE_RHYTHM.fontSize,
    lineHeight: PHONE_ARTICLE_RHYTHM.lineHeight,
    paragraphSpacing: PHONE_ARTICLE_RHYTHM.paragraphSpacing,
    headingAlign: desktop.headingAlign,
  };
};

export const PUBLISH_LAYOUT_RHYTHM: Record<PublishLayoutId, PublishRhythm> = {
  letter: { fontSize: "15px", lineHeight: "1.9", paragraphSpacing: "24px", headingAlign: "center" },
  guide: { fontSize: "15px", lineHeight: "1.8", paragraphSpacing: "16px", headingAlign: "left" },
  blueprint: { fontSize: "16px", lineHeight: "1.8", paragraphSpacing: "20px", headingAlign: "left" },
  journal: { fontSize: "16px", lineHeight: "1.9", paragraphSpacing: "26px", headingAlign: "left" },
  stance: { fontSize: "16px", lineHeight: "1.8", paragraphSpacing: "20px", headingAlign: "left" },
  stub: { fontSize: "15px", lineHeight: "1.9", paragraphSpacing: "32px", headingAlign: "left" },
  brief: { fontSize: "15px", lineHeight: "1.9", paragraphSpacing: "24px", headingAlign: "left" },
  outline: { fontSize: "16px", lineHeight: "1.8", paragraphSpacing: "22px", headingAlign: "left" },
  zen: { fontSize: "16px", lineHeight: "2", paragraphSpacing: "32px", headingAlign: "left" },
  grove: { fontSize: "15px", lineHeight: "1.9", paragraphSpacing: "24px", headingAlign: "left" },
};

export const publishEditorCssVars = (
  layout: PublishLayoutId,
  paletteId: PublishPaletteId,
  surface: PublishSurface = "desktop",
): Record<string, string> => {
  const rhythm = resolvePublishRhythm(layout, surface);
  const palette = PUBLISH_PALETTES[paletteId] ?? PUBLISH_PALETTES[DEFAULT_PUBLISH_PALETTE];
  return {
    "--editor-body-font-size": rhythm.fontSize,
    "--editor-body-line-height": rhythm.lineHeight,
    "--editor-paragraph-spacing": rhythm.paragraphSpacing,
    "--publish-accent": palette.accent,
    "--publish-accent-soft": palette.accentSoft,
    "--publish-accent-border": palette.accentBorder,
    "--publish-text": palette.text,
    "--publish-text-strong": palette.textStrong,
    "--publish-text-muted": palette.textMuted,
    "--publish-surface": palette.surface,
    "--publish-divider": palette.divider,
    "--publish-link": palette.link,
    "--publish-code-bg": palette.codeBg,
    "--publish-code-text": palette.codeText,
    "--publish-bg": palette.bg,
  };
};

const css = (declarations: Record<string, string | undefined>) =>
  Object.entries(declarations)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0)
    .map(([property, value]) => `${property}: ${value}`)
    .join("; ");

export type PublishTagStyles = Record<string, string>;

export const buildPublishStyles = (
  layout: PublishLayoutId,
  palette: PublishPalette,
  surface: PublishSurface = "desktop",
): PublishTagStyles => {
  const rhythm = resolvePublishRhythm(layout, surface);
  const phone = surface === "phone";
  const align = rhythm.headingAlign;
  const h1AlignRules =
    layout === "letter"
      ? {
          "text-align": "center",
          "border-bottom": `3px solid ${palette.accent}`,
          "padding-bottom": "10px",
        }
      : layout === "blueprint"
        ? {
            "text-align": "left",
            "border-top": `3px solid ${palette.accent}`,
            "padding-top": "10px",
          }
        : layout === "stance"
          ? {
              "text-align": "left",
              "border-bottom": `6px solid ${palette.accent}`,
              "padding-bottom": "10px",
            }
          : layout === "stub"
            ? {
                "text-align": "left",
                "letter-spacing": "0.12em",
                "border-bottom": `1px dashed ${palette.accent}`,
                "padding-bottom": "10px",
              }
            : layout === "outline"
              ? {
                  "text-align": "left",
                  "letter-spacing": "0.06em",
                  "border-bottom": `1px solid ${palette.divider}`,
                  "padding-bottom": "10px",
                }
              : layout === "zen"
                ? { "text-align": "left", "font-weight": "600" }
                : { "text-align": align };

  const h2Rules =
    layout === "guide" || layout === "blueprint" || layout === "stance"
      ? {
          "border-left": layout === "stance" ? `6px solid ${palette.accent}` : `4px solid ${palette.accent}`,
          "padding-left": "12px",
        }
      : layout === "journal" || layout === "grove"
        ? {
            "border-bottom": `1px solid ${palette.divider}`,
            "padding-bottom": "8px",
          }
        : layout === "stub"
          ? {
              "border-bottom": `1px dashed ${palette.accentBorder}`,
              "padding-bottom": "8px",
            }
          : {};

  const h3Rules =
    layout === "letter"
      ? {
          "text-align": "center",
          "border-bottom": `2px solid ${palette.accentBorder}`,
          "padding-bottom": "8px",
        }
      : layout === "blueprint" || layout === "stance"
        ? {
            "border-bottom": `2px solid ${palette.accent}`,
            "padding-bottom": "6px",
          }
        : layout === "stub"
          ? {
              "border-bottom": `1px dashed ${palette.accentBorder}`,
              "padding-bottom": "6px",
            }
          : {};

  const quoteRules =
    layout === "letter" || layout === "grove"
      ? {
          margin: "0 0 28px",
          padding: "16px 18px",
          border: `1px solid ${palette.accentBorder}`,
          "border-radius": layout === "grove" ? "16px" : "12px",
          background: palette.surface,
          color: palette.textMuted,
        }
      : layout === "journal" || layout === "zen"
        ? {
            margin: "0 0 28px",
            padding: layout === "zen" ? "8px 0 8px 0" : "4px 0 4px 16px",
            "border-left": layout === "zen" ? "0" : `2px solid ${palette.divider}`,
            background: "transparent",
            color: palette.textMuted,
            "font-style": "italic",
          }
        : layout === "stub"
          ? {
              margin: "0 0 28px",
              padding: "14px 16px",
              border: `1px dashed ${palette.accent}`,
              "border-radius": "2px",
              background: palette.surface,
              color: palette.textMuted,
            }
          : layout === "outline"
            ? {
                margin: "0 0 24px",
                padding: "12px 16px",
                border: `1px solid ${palette.divider}`,
                background: "transparent",
                color: palette.textMuted,
              }
            : {
                margin: "0 0 24px",
                padding: "12px 16px",
                "border-left": layout === "stance" ? `6px solid ${palette.accent}` : `4px solid ${palette.accent}`,
                background: palette.accentSoft,
                color: palette.textMuted,
              };

  const quote = phone ? { ...quoteRules, margin: "0 0 14px", padding: "10px 12px" } : quoteRules;

  return {
    root: css({
      "font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
      "font-size": rhythm.fontSize,
      "line-height": rhythm.lineHeight,
      color: palette.text,
      "background-color": palette.bg,
      "word-break": "break-word",
    }),
    p: css({
      margin: `0 0 ${rhythm.paragraphSpacing}`,
      padding: "0",
      "line-height": rhythm.lineHeight,
      "font-size": rhythm.fontSize,
      color: palette.text,
    }),
    h1: css({
      ...h1AlignRules,
      margin: phone ? "0 0 12px" : "0 0 24px",
      "font-size": phone
        ? PHONE_ARTICLE_RHYTHM.h1Size
        : layout === "journal" || layout === "zen"
          ? "26px"
          : "24px",
      "line-height": phone ? "1.4" : "1.35",
      "font-weight": "800",
      ...(phone ? { "letter-spacing": "0.02em" } : {}),
      color: palette.textStrong,
    }),
    h2: css({
      margin: phone ? "18px 0 10px" : "28px 0 16px",
      "font-size": phone ? PHONE_ARTICLE_RHYTHM.h2Size : "20px",
      "line-height": "1.35",
      "font-weight": phone ? "600" : "700",
      color: palette.textStrong,
      "text-align": "left",
      ...h2Rules,
    }),
    h3: css({
      margin: phone ? "14px 0 8px" : "24px 0 12px",
      "font-size": phone ? PHONE_ARTICLE_RHYTHM.h3Size : layout === "letter" ? "15px" : "16px",
      "line-height": "1.45",
      "font-weight": "700",
      color: palette.textStrong,
      ...h3Rules,
    }),
    blockquote: css({
      "line-height": rhythm.lineHeight,
      ...quote,
    }),
    ul: css({
      margin: "0 0 1em",
      "padding-left": "1.6em",
      "line-height": rhythm.lineHeight,
      color: palette.text,
    }),
    ol: css({
      margin: "0 0 1em",
      "padding-left": "1.6em",
      "line-height": rhythm.lineHeight,
      color: palette.text,
    }),
    li: css({
      margin: "0.25em 0",
      "line-height": rhythm.lineHeight,
      color: palette.text,
    }),
    a: css({
      color: palette.link,
      "text-decoration": "underline",
    }),
    strong: css({
      "font-weight": "700",
      color: palette.accent,
    }),
    em: css({
      "font-style": "italic",
      color: palette.textMuted,
    }),
    del: css({
      "text-decoration": "line-through",
      color: palette.textMuted,
    }),
    code: css({
      padding: "0.15em 0.35em",
      "border-radius": "3px",
      background: palette.codeBg,
      color: palette.codeText,
      "font-family": "Menlo, Consolas, monospace",
      "font-size": "0.9em",
    }),
    pre: css({
      margin: "1em 0",
      padding: "12px 14px",
      overflow: "hidden",
      "border-radius": "6px",
      background: palette.codeBg,
      color: palette.text,
      "line-height": "1.6",
      "text-align": "left",
      border: `1px solid ${palette.accentBorder}`,
    }),
    hr: css({
      margin: "28px auto",
      border: "0",
      "border-top": `1px solid ${palette.divider}`,
      width: layout === "letter" ? "42%" : "100%",
    }),
    table: css({
      width: "100%",
      margin: "1em 0",
      "border-collapse": "collapse",
      "font-size": "14px",
      "line-height": "1.6",
    }),
    th: css({
      padding: "8px",
      border: `1px solid ${palette.accentBorder}`,
      background: palette.accentSoft,
      "font-weight": "700",
      "text-align": "left",
      color: palette.textStrong,
    }),
    td: css({
      padding: "8px",
      border: `1px solid ${palette.divider}`,
      "text-align": "left",
      color: palette.text,
    }),
    img: css({
      display: "block",
      "max-width": "100%",
      height: "auto",
      margin: "1em auto",
    }),
  };
};

const THEME_BLOCK_LABELS: Record<string, string> = {
  intro: "引言",
  "key-point": "重点观点",
  callout: "提示",
  chapter: "章节",
};

const themeBlockStyles = (
  kind: string,
  palette: PublishPalette,
  layout: PublishLayoutId,
  surface: PublishSurface = "desktop",
) => {
  const phone = surface === "phone";
  const label = phone
    ? `padding: 8px 12px 0; color: ${palette.accent}; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin: 0;`
    : `padding: 10px 14px 0; color: ${palette.accent}; font-size: 12px; font-weight: 700; letter-spacing: 1px; margin: 0;`;
  if (kind === "chapter") {
    return {
      block: `margin: 28px 0 16px; padding: 0 0 4px; border-top: 3px solid ${palette.accent}; color: ${palette.textStrong};`,
      label: `padding: 10px 0 0; color: ${palette.accent}; font-size: 12px; font-weight: 700; letter-spacing: 2px; margin: 0;`,
    };
  }
  if (layout === "letter" || kind === "key-point") {
    return {
      block: phone
        ? `margin: 12px 0; padding: 0 0 2px; border: 1px solid ${palette.accentBorder}; border-radius: 8px; background: ${palette.surface}; color: ${palette.text};`
        : `margin: 20px 0; padding: 0 0 4px; border: 1px solid ${palette.accentBorder}; border-radius: 12px; background: ${palette.surface}; color: ${palette.text};`,
      label,
    };
  }
  if (kind === "callout") {
    return {
      block: `margin: 20px 0; padding: 0 0 4px; border: 1px dashed ${palette.accentBorder}; background: ${palette.accentSoft}; color: ${palette.text};`,
      label,
    };
  }
  return {
    block: phone
      ? `margin: 12px 0; padding: 0 0 2px; border-left: 3px solid ${palette.accent}; background: ${palette.accentSoft}; color: ${palette.text};`
      : `margin: 20px 0; padding: 0 0 4px; border-left: 5px solid ${palette.accent}; background: ${palette.accentSoft}; color: ${palette.text};`,
    label,
  };
};

const isChromeElement = (element: HTMLElement) => element.getAttribute("data-ee-publish-chrome") === "true";

const wrapHeading = (heading: HTMLElement) => {
  if (heading.parentElement?.getAttribute("data-ee-publish-heading")) {
    return heading.parentElement;
  }
  const document = heading.ownerDocument;
  const wrapper = document.createElement("section");
  wrapper.setAttribute("data-ee-publish-heading", heading.tagName.toLowerCase());
  heading.parentNode?.insertBefore(wrapper, heading);
  wrapper.appendChild(heading);
  return wrapper;
};

const decorateHeadings = (
  root: HTMLElement,
  layout: PublishLayoutId,
  palette: PublishPalette,
  surface: PublishSurface = "desktop",
) => {
  const headings = Array.from(root.querySelectorAll<HTMLElement>("h1, h2, h3")).filter((heading) => {
    if (heading.closest("table, pre, [data-edgeever-theme-block]")) return false;
    if (heading.closest("[data-ee-publish-heading]")) return false;
    return true;
  });

  let chapterIndex = 0;
  for (const heading of headings) {
    const tag = heading.tagName.toLowerCase();
    const plan = planHeadingDecoration(tag, layout, chapterIndex);
    if (plan.kind === "chapter") chapterIndex += 1;
    if (plan.kind !== "chapter" || !plan.chapterLabel) continue;

    const wrapper = wrapHeading(heading);
    wrapper.style.cssText = "margin: 0; padding: 0;";
    const label = heading.ownerDocument.createElement("p");
    label.setAttribute("data-ee-publish-chrome", "true");
    label.textContent = plan.chapterLabel;
    label.style.cssText = css({
      margin: surface === "phone" ? "16px 0 0" : "28px 0 0",
      padding: "0",
      color: palette.accent,
      "font-size": surface === "phone" ? "15px" : layout === "letter" ? "28px" : "13px",
      "line-height": "1.1",
      "font-weight": "700",
      "font-style": layout === "letter" ? "italic" : "normal",
      "letter-spacing": layout === "blueprint" ? "0.08em" : "0",
    });
    wrapper.insertBefore(label, heading);
    heading.style.margin = surface === "phone" ? "4px 0 10px" : "6px 0 16px";
  }
};

const applyThemeBlocks = (
  root: HTMLElement,
  layout: PublishLayoutId,
  palette: PublishPalette,
  surface: PublishSurface = "desktop",
) => {
  root.querySelectorAll<HTMLElement>("[data-edgeever-theme-block]").forEach((block) => {
    const kind = block.getAttribute("data-theme-block-kind") || "intro";
    const styles = themeBlockStyles(kind, palette, layout, surface);
    block.style.cssText = `${styles.block}${block.style.cssText}`;
    const label = root.ownerDocument.createElement("p");
    label.setAttribute("data-ee-publish-chrome", "true");
    label.textContent = THEME_BLOCK_LABELS[kind] || "主题组件";
    label.style.cssText = styles.label;
    block.insertBefore(label, block.firstChild);
  });
};

export const collectPublishStyleText = (styles: PublishTagStyles) => Object.values(styles).join(" ");

export const assertWeChatSafeCss = (source: string) => {
  const forbidden = [
    /var\s*\(/i,
    /\bdisplay\s*:\s*flex\b/i,
    /\bdisplay\s*:\s*grid\b/i,
    /\bposition\s*:\s*(absolute|fixed|sticky)\b/i,
    /::?(?:before|after)\b/i,
    /url\s*\(/i,
  ];
  return forbidden.every((pattern) => !pattern.test(source));
};

export const applyPublishLayout = (
  root: HTMLElement,
  layout: PublishLayoutId = readPublishLayoutPreference(),
  paletteId: PublishPaletteId = readPublishPalettePreference(),
  surface: PublishSurface = "desktop",
) => {
  const palette = PUBLISH_PALETTES[paletteId] ?? PUBLISH_PALETTES[DEFAULT_PUBLISH_PALETTE];
  const styles = buildPublishStyles(layout, palette, surface);
  root.style.cssText = styles.root;

  root.querySelectorAll<HTMLElement>("*").forEach((element) => {
    if (isChromeElement(element)) return;
    if (element.closest("pre") && element.tagName.toLowerCase() !== "pre") return;
    const tagName = element.tagName.toLowerCase();
    const style = styles[tagName];
    if (style) element.style.cssText = `${style}${element.style.cssText}`;
  });

  root.querySelectorAll<HTMLElement>("pre code").forEach((element) => {
    element.style.cssText =
      "padding: 0; background: transparent; color: inherit; font-family: Menlo, Consolas, monospace; font-size: 13px; white-space: pre-wrap;";
  });

  root.querySelectorAll<HTMLElement>("hr[data-edgeever-merge-divider], hr.edgeever-merge-divider").forEach((divider) => {
    divider.style.cssText = css({
      margin: "1.75em 0",
      border: "0",
      "border-top": `2px solid ${palette.accent}`,
    });
  });

  decorateHeadings(root, layout, palette, surface);
  applyThemeBlocks(root, layout, palette, surface);
};

export const buildPhonePreviewHtml = (html: string, title = "", editorTheme?: string | null) => {
  const root = document.createElement("div");
  const trimmedTitle = title.trim();
  if (trimmedTitle && !/^\s*<h1[\s>]/i.test(html)) {
    const heading = document.createElement("h1");
    heading.textContent = trimmedTitle;
    root.appendChild(heading);
  }
  root.insertAdjacentHTML("beforeend", html);

  const paper = resolvePaperEditorTheme(editorTheme);
  if (paper) {
    applyPublishLayout(root, paper.layout, paper.palette, "phone");
  }

  return {
    html: root.innerHTML,
    style: root.getAttribute("style") ?? "",
    paper: Boolean(paper),
  };
};
