import { expect, test } from "bun:test";
import { docToMarkdown, markdownToDoc } from "./content.ts";
import { getVideoNoteSummary, parseVideoNoteMarker, serializeVideoNoteMarker } from "./video-note.ts";

const identity = {
  platform: "youtube",
  videoId: "abcdefghijk",
  sourceUrl: "https://www.youtube.com/watch?v=abcdefghijk",
  durationSeconds: 42,
  placeholderText: "这一集没有可用字幕",
  transcriptLabel: "字幕实录",
};

test("a video-note marker round-trips and stays out of the visible text", () => {
  const marker = serializeVideoNoteMarker(identity);
  const markdown = `# 标题\n\n这一集没有可用字幕\n\n${marker}\n`;
  expect(parseVideoNoteMarker(markdown)).toEqual(identity);
  expect(getVideoNoteSummary(markdown)).toEqual({ videoNote: true });
  expect(getVideoNoteSummary("普通笔记")).toEqual({ videoNote: false });
  expect(parseVideoNoteMarker("<!-- edgeever-video-v1:not-json -->")).toBeUndefined();

  const roundTrip = docToMarkdown(markdownToDoc(markdown));
  expect(parseVideoNoteMarker(roundTrip)).toEqual(identity);
  expect(roundTrip).not.toContain("&lt;!--");
  const doc = markdownToDoc(markdown);
  const texts = [];
  const walk = (node) => {
    if (node.text) texts.push(node.text);
    for (const child of node.content ?? []) walk(child);
  };
  walk(doc);
  expect(texts.join("\n")).not.toContain("edgeever-video");
});
