// Client-safe parser for topic markdown body. Lives in its own module so
// components (which can be bundled for the browser) can import the parser
// without dragging in node:fs / gray-matter via `topic-content.ts`.

export interface ParsedProbe {
  id: string;
  question: string;
  answer: string;
}

export type TopicBodySegment =
  | { kind: "markdown"; text: string }
  | { kind: "probe"; probe: ParsedProbe };

/**
 * Split a topic markdown body into a sequence of plain-markdown segments
 * and structured `:::probe` segments. Grammar:
 *
 *   :::probe id=optional-stable-id
 *   The question (markdown, single paragraph recommended)
 *   ???
 *   The answer text.
 *   :::
 *
 * `???` (or `---`) on its own line separates question from answer. If the
 * delimiter is absent, the whole block becomes the question with an empty
 * answer. `id=` is optional; positional ids are used as a fallback.
 */
export function parseTopicBody(body: string): TopicBodySegment[] {
  const segments: TopicBodySegment[] = [];
  const re = /:::\s*probe([^\n]*)\n([\s\S]*?)\n:::/g;
  let lastIndex = 0;
  let ordinal = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "markdown", text: body.slice(lastIndex, match.index) });
    }
    const headerLine = match[1] ?? "";
    const inner = match[2] ?? "";
    const idMatch = /\bid=([\w-]+)/.exec(headerLine);
    const id = idMatch ? idMatch[1] : `p${ordinal}`;

    let question = inner;
    let answer = "";
    const delim = /\n\s*(?:\?\?\?|---)[^\n]*\n/.exec(inner);
    if (delim) {
      question = inner.slice(0, delim.index);
      answer = inner.slice(delim.index + delim[0].length);
    }
    question = question.trim().replace(/^\*\*[^*]+\*\*\s*/, "").trim();
    answer = answer.trim();

    segments.push({ kind: "probe", probe: { id, question, answer } });
    lastIndex = match.index + match[0].length;
    ordinal += 1;
  }
  if (lastIndex < body.length) {
    segments.push({ kind: "markdown", text: body.slice(lastIndex) });
  }
  return segments;
}
