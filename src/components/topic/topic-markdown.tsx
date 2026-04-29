import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function TopicMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-[var(--accent)] prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
