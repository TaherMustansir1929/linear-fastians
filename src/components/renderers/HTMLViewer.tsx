interface HTMLViewerProps {
  url: string
  content?: string
}

export function HTMLViewer({ url, content }: HTMLViewerProps) {
  // If we have direct content, we can use srcDoc, else src
  return (
    <div className="w-full h-[80vh] bg-white rounded-lg overflow-hidden border">
      <iframe
        src={url}
        srcDoc={content}
        className="w-full h-full"
        title="HTML Document"
        sandbox="allow-scripts" // Be careful with permissions
      />
    </div>
  )
}
