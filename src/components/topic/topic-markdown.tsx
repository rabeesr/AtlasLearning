import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function TopicMarkdown({ content }: { content: string }) {
  return (
    <div className="atlas-prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
