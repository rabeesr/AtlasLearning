import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isValidElement, type HTMLAttributes, type ReactNode } from "react";

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

export function TopicMarkdown({ content }: { content: string }) {
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
    <div className="atlas-prose max-w-none">
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
    </div>
  );
}
