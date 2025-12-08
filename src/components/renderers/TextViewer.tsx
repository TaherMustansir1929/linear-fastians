interface TextViewerProps {
  content: string
  language?: string
}

export function TextViewer({ content, language = 'text' }: TextViewerProps) {
  return (
    <div className="w-full h-[80vh] overflow-auto bg-muted/50 p-4 rounded-lg border">
      <pre className="font-mono text-sm whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  )
}
