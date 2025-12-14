import { cn } from "@/lib/utils";

interface TextViewerProps {
  content: string;
  language?: string;
  className?: string;
}

export function TextViewer({
  content,
  language = "text",
  className,
}: TextViewerProps) {
  return (
    <div
      className={cn(
        "w-full h-screen overflow-auto bg-accent p-4 rounded-lg border-b shadow-sm",
        className
      )}
    >
      <pre className="font-sans font-medium text-sm whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}
