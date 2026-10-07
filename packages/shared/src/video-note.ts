import { mergeAttributes, Node } from "@tiptap/core";
import { Base64 } from "js-base64";
import { parseVideoTranscriptJob, type VideoTranscriptJobInput } from "./schemas";

/** Hidden block that marks a saved YouTube or Bilibili note. */
export const VIDEO_NOTE_NODE_TYPE = "edgeeverVideoNote" as const;

const MARKER_PREFIX = "edgeever-video-v1";
const MARKER = new RegExp(`<!--\\s*${MARKER_PREFIX}:([A-Za-z0-9_=-]+)\\s*-->`);
const MARKER_TOKEN = new RegExp(`^<!--\\s*${MARKER_PREFIX}:([A-Za-z0-9_=-]+)\\s*-->[ \\t]*(?:\\n+|$)`);

export const serializeVideoNoteMarker = (input: VideoTranscriptJobInput) =>
  `<!-- ${MARKER_PREFIX}:${Base64.encodeURI(JSON.stringify(input))} -->`;

export const parseVideoNoteMarker = (markdown: string | null | undefined) => {
  const encoded = markdown?.match(MARKER)?.[1];
  if (!encoded || encoded.length > 8000) return undefined;
  try {
    return parseVideoTranscriptJob(JSON.parse(Base64.decode(encoded)));
  } catch {
    return undefined;
  }
};

export const getVideoNoteSummary = (markdown: string | null | undefined) => ({
  videoNote: Boolean(parseVideoNoteMarker(markdown)),
});

export const VideoNoteMarker = Node.create({
  name: VIDEO_NOTE_NODE_TYPE,
  group: "block",
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      encoded: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-edgeever-video-note") ?? "",
        renderHTML: (attributes) => (
          typeof attributes.encoded === "string" && attributes.encoded
            ? { "data-edgeever-video-note": attributes.encoded }
            : {}
        ),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-edgeever-video-note]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, {
      class: "edgeever-video-note",
      contenteditable: "false",
      style: "display:none",
    })];
  },

  renderMarkdown(node) {
    const encoded = String(node.attrs?.encoded ?? "");
    if (!/^[A-Za-z0-9_=-]+$/.test(encoded)) return "";
    return `<!-- ${MARKER_PREFIX}:${encoded} -->\n`;
  },

  parseMarkdown(token) {
    return {
      type: VIDEO_NOTE_NODE_TYPE,
      attrs: { encoded: String(token.encoded ?? "") },
    };
  },

  markdownTokenizer: {
    name: VIDEO_NOTE_NODE_TYPE,
    level: "block",
    start(src: string) {
      return src.indexOf(`<!-- ${MARKER_PREFIX}:`);
    },
    tokenize(src: string) {
      const match = MARKER_TOKEN.exec(src);
      if (!match) return undefined;
      return {
        type: VIDEO_NOTE_NODE_TYPE,
        raw: match[0],
        encoded: match[1],
      };
    },
  },
});
