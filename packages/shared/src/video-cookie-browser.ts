// Browser names accepted by yt-dlp --cookies-from-browser. "none" turns the
// reuse off. The desktop app keeps its own copy of this list so Electron does
// not have to load this TypeScript module.
export const VIDEO_COOKIE_BROWSERS = [
  "chrome",
  "chromium",
  "edge",
  "firefox",
  "safari",
  "brave",
  "opera",
  "vivaldi",
  "whale",
] as const;

export const DEFAULT_VIDEO_COOKIE_BROWSER = "chrome";

export type VideoCookieBrowser = (typeof VIDEO_COOKIE_BROWSERS)[number] | "none";

export const videoCookieBrowser = (value: unknown): VideoCookieBrowser => {
  const name = String(value ?? "").trim().toLowerCase();
  if (name === "none") return "none";
  return VIDEO_COOKIE_BROWSERS.find((browser) => browser === name) ?? DEFAULT_VIDEO_COOKIE_BROWSER;
};
