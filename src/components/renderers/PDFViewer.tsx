interface PDFViewerProps {
  url: string
}

export function PDFViewer({ url }: PDFViewerProps) {
  return (
    <div className="w-full h-[80vh] bg-gray-100 rounded-lg overflow-hidden border">
      <iframe
        src={`${url}#toolbar=0`}
        className="w-full h-full"
        title="PDF Document"
      />
    </div>
  )
}
