import { cn } from "@/lib/utils";

interface PDFViewerProps {
  url: string;
  className?: string;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  return (
    <div
      className={cn(
        "w-full h-screen bg-gray-100 rounded-lg overflow-hidden border",
        className
      )}
    >
      <iframe
        src={`${url}#toolbar=0`}
        className="w-full h-full"
        title="PDF Document"
      />
    </div>
  );
}
