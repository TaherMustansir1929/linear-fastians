"use client";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "github-markdown-css/github-markdown-light.css";
import "@/components/renderers/markdown.css";
import { cn } from "@/lib/utils";
interface MarkdownViewerProps {
  content: string;
  className?: string;
}
export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div
      className={cn(
        "markdown-body max-w-none p-6 rounded-b-lg border-b shadow-sm",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
