import { cn } from "@/lib/utils";

interface HTMLViewerProps {
  url: string;
  content?: string;
  className?: string;
}

export function HTMLViewer({ url, content, className }: HTMLViewerProps) {
  // If we have direct content, we can use srcDoc, else src
  return (
    <div
      className={cn(
        "w-full h-[80vh] bg-white rounded-lg overflow-hidden border-b shadow-sm",
        className
      )}
    >
      <iframe
        src={url}
        srcDoc={content}
        className="w-full h-full"
        title="HTML Document"
        sandbox="allow-scripts" // Be careful with permissions
      />
    </div>
  );
}
