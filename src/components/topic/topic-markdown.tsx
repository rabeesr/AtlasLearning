import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isValidElement, type HTMLAttributes, type ReactNode } from "react";

import { ProbePrompt } from "@/components/learn/probe-prompt";
import { parseTopicBody } from "@/lib/content/topic-body-parser";
import { slugifyHeading } from "@/lib/content/topic-learn-sections";

function flattenText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (isValidElement(node)) return flattenText((node.props as { children?: ReactNode }).children);
  return "";
}

type MarkdownHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  children?: ReactNode;
  node?: unknown;
};

function Heading({
  level,
  children,
  ...props
}: {
  level: 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
} & HTMLAttributes<HTMLHeadingElement>) {
  const Tag = `h${level}` as const;
  const id = slugifyHeading(flattenText(children));

  return (
    <Tag id={id} style={{ scrollMarginTop: "6rem" }} {...props}>
      {children}
    </Tag>
  );
}

function MarkdownSlice({ content }: { content: string }) {
  const renderHeading = (level: 2 | 3 | 4 | 5 | 6) =>
    function RenderHeading({ node, children, ...props }: MarkdownHeadingProps) {
      void node;
      return (
        <Heading level={level} {...props}>
          {children}
        </Heading>
      );
    };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: renderHeading(2),
        h3: renderHeading(3),
        h4: renderHeading(4),
        h5: renderHeading(5),
        h6: renderHeading(6),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/**
 * TopicMarkdown — renders a topic body, splitting out `:::probe` blocks
 * into interactive `<ProbePrompt>` components so the learner is forced to
 * predict before revealing. Pass `topicSlug` to enable concept-tracking
 * for revealed probes.
 */
export function TopicMarkdown({
  content,
  topicSlug,
}: {
  content: string;
  topicSlug?: string;
}) {
  const segments = parseTopicBody(content);
  return (
    <div className="atlas-prose max-w-none">
      {segments.map((seg, i) => {
        if (seg.kind === "probe") {
          const p = seg.probe;
          return (
            <ProbePrompt
              key={`probe-${p.id}-${i}`}
              topicSlug={topicSlug}
              probeId={p.id}
              question={p.question}
              answer={p.answer}
            />
          );
        }
        return <MarkdownSlice key={`md-${i}`} content={seg.text} />;
      })}
    </div>
  );
}
