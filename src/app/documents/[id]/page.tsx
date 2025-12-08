import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { MarkdownViewer } from '@/components/renderers/MarkdownViewer'
import { PDFViewer } from '@/components/renderers/PDFViewer'
import { HTMLViewer } from '@/components/renderers/HTMLViewer'
import { TextViewer } from '@/components/renderers/TextViewer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Download, Calendar, User as UserIcon, Tag } from 'lucide-react'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params

  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !doc) {
    notFound()
  }

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(doc.file_path)

  let content = ''
  if (['md', 'txt', 'latex', 'tex'].includes(doc.file_type)) {
    try {
      const res = await fetch(publicUrl)
      if (res.ok) {
        content = await res.text()
      }
    } catch (e) {
      console.error('Failed to fetch text content', e)
    }
  }

  const renderContent = () => {
    switch (doc.file_type) {
      case 'pdf':
        return <PDFViewer url={publicUrl} />
      case 'md':
        return <MarkdownViewer content={content} />
      case 'html':
        return <HTMLViewer url={publicUrl} /> // Iframe
      case 'txt':
      case 'tex':
      case 'latex':
        return <TextViewer content={content} language={doc.file_type === 'latex' || doc.file_type === 'tex' ? 'latex' : 'text'} />
      default:
        return (
          <div className="text-center py-10">
            <p>File preview not available.</p>
            <Button asChild className="mt-4">
               <a href={publicUrl} target="_blank" rel="noopener noreferrer">Download File</a>
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-0 hover:bg-transparent">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </Link>
        </Button>
      
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {doc.subject}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(doc.created_at), 'PPP')}
              </div>
            </div>
          </div>
          
          <Button asChild>
            <a href={publicUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </div>

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  )
}
