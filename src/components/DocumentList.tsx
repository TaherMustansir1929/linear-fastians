'use client'

import { useState } from 'react'
import { Document, SUBJECTS } from '@/types'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { FileText, FileCode, FileType as FileTypeIcon, Search, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface DocumentListProps {
  initialDocuments: Document[]
}

export function DocumentList({ initialDocuments }: DocumentListProps) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase())
    const matchesSubject = selectedSubject ? doc.subject === selectedSubject : true
    return matchesSearch && matchesSubject
  })

  // Group subjects for filter UI
  const subjects = Array.from(SUBJECTS)

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-10 w-10 text-red-500" />
      case 'md': return <FileCode className="h-10 w-10 text-blue-500" />
      case 'html': return <FileCode className="h-10 w-10 text-orange-500" />
      case 'latex': return <div className="h-10 w-10 flex items-center justify-center font-bold text-green-600 border rounded">TeX</div>
      default: return <FileTypeIcon className="h-10 w-10 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <Badge 
            variant={selectedSubject === null ? "default" : "outline"} 
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedSubject(null)}
          >
            All
          </Badge>
          {subjects.map(sub => (
            <Badge 
              key={sub} 
              variant={selectedSubject === sub ? "default" : "outline"} 
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedSubject(sub)}
            >
              {sub.split('(')[1]?.replace(')', '') || sub} {/* Show short name if possible */}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No documents found. Be the first to upload one!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => (
            <Link href={`/documents/${doc.id}`} key={doc.id}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    {getIcon(doc.file_type)}
                    <Badge variant="secondary" className="text-xs">
                      {doc.subject.split('(')[1]?.replace(')', '') || 'Gen'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {doc.title}
                  </CardTitle>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(doc.created_at), 'MMM d, yyyy')}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
