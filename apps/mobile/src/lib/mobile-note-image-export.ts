const MAX_SOURCE_HEIGHT = 15_000;
const MAX_OUTPUT_HEIGHT = 15_000;
const MAX_OUTPUT_PIXELS = 12_000_000;
const PREFERRED_PIXEL_RATIO = 2;

/** Keep a complete long card within the dimensions Android WebView can rasterize. */
export const planMobileNoteImageRender = (width: number, height: number) => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("Invalid note image dimensions");
  }

  const sourceScale = Math.min(1, MAX_SOURCE_HEIGHT / height);
  if (sourceScale < 0.5) {
    throw new Error("NOTE_IMAGE_TOO_LONG");
  }

  const sourceWidth = Math.max(1, Math.floor(width * sourceScale));
  const sourceHeight = Math.max(1, Math.floor(height * sourceScale));
  const pixelRatio = Math.min(
    PREFERRED_PIXEL_RATIO,
    MAX_OUTPUT_HEIGHT / sourceHeight,
    Math.sqrt(MAX_OUTPUT_PIXELS / (sourceWidth * sourceHeight)),
  );

  return { pixelRatio, sourceHeight, sourceScale, sourceWidth };
};
