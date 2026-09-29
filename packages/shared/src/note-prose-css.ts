const ALLOWED_NOTE_PROSE_CSS_PROPERTIES = new Set([
  "font-family",
  "font-style",
  "font-weight",
  "letter-spacing",
  "color",
  "background",
  "background-color",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-color",
  "border-width",
  "border-style",
  "border-radius",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "text-align",
  "text-decoration",
  "text-transform",
  "text-indent",
  "word-break",
  "word-wrap",
  "white-space",
  "list-style",
  "list-style-type",
]);

const UNSAFE_CSS_VALUE = /url\s*\(|expression|javascript\s*:|behavior|-moz-binding/i;

export const sanitizeNoteProseDeclarationBlock = (block: string): string =>
  block
    .split(";")
    .map((rule) => {
      const parts = rule.split(":");
      if (parts.length < 2) return "";
      const property = parts[0].trim().toLowerCase();
      const value = parts.slice(1).join(":").trim();
      if (!ALLOWED_NOTE_PROSE_CSS_PROPERTIES.has(property) || UNSAFE_CSS_VALUE.test(value)) return "";
      return `${property}: ${value};`;
    })
    .filter(Boolean)
    .join(" ");

/** Drops font-size, line-height, url(), and rules that are not typography. Selectors stay intact. */
export const sanitizeNoteProseCss = (css: string): string => {
  if (!css) return "";
  const cleaned = css
    .replace(/@import/gi, "")
    .replace(/@charset/gi, "")
    .replace(/@namespace/gi, "");
  return cleaned.replace(/([^{]+)({[^}]+})/g, (_, selectors: string, blockContent: string) => {
    const safeRules = sanitizeNoteProseDeclarationBlock(blockContent.slice(1, -1));
    if (!safeRules) return "";
    return `${selectors}{ ${safeRules} }`;
  }).trim();
};
