'use client'

import { useState } from 'react'
import { Document, SUBJECTS } from '@/types'
import { useDocuments } from '@/hooks/useDocuments'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { FileText, FileCode, FileType as FileTypeIcon, Search, Calendar, ArrowUp, ArrowDown } from 'lucide-react'
import { format } from 'date-fns'

export function DocumentList() {
  const { data: documents, isLoading } = useDocuments()
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  if (isLoading) return <div className="text-center py-20">Loading documents...</div>

  // Filter first
  const filtered = documents?.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase())
    const matchesSubject = selectedSubject ? doc.subject === selectedSubject : true
    return matchesSearch && matchesSubject
  }) || []

  // Then sort
  const sortedDocs = [...filtered].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
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
        <div className="relative w-full md:w-1/3 flex gap-2">
            <div className='relative flex-1'>
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search documents..." 
                className="pl-8" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>
             <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                title={`Sort by Date (${sortOrder === 'asc' ? 'Oldest' : 'Newest'})`}
            >
                {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
        </div>
        
        {/* Subject Filter - Fixed Scrollbar & Padding */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-4 pt-2 px-1 scrollbar-hide mask-fade-sides">
          <Badge 
            variant={selectedSubject === null ? "default" : "outline"} 
            className="cursor-pointer whitespace-nowrap hover:scale-105 transition-transform"
            onClick={() => setSelectedSubject(null)}
          >
            All
          </Badge>
          {subjects.map(sub => (
            <Badge 
              key={sub} 
              variant={selectedSubject === sub ? "default" : "outline"} 
              className="cursor-pointer whitespace-nowrap hover:scale-105 transition-transform"
              onClick={() => setSelectedSubject(sub)}
            >
              {sub.split('(')[1]?.replace(')', '') || sub}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid */}
      {sortedDocs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No documents found. Be the first to upload one!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedDocs.map((doc) => (
            <Link href={`/documents/${doc.id}`} key={doc.id}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/50 active:scale-[0.98]">
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
                <CardFooter className="flex-col items-start gap-2 pt-0">
                   <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(doc.created_at), 'MMM d, yyyy')}
                  </div>
                  {doc.uploader_name && (
                    <div className="flex items-center gap-2 w-full text-xs text-muted-foreground border-t pt-2 mt-2" 
                         onClick={(e) => { e.preventDefault(); window.location.href = `/users/${doc.user_id}` }}>
                      {doc.uploader_avatar && <img src={doc.uploader_avatar} className="w-4 h-4 rounded-full" />}
                       <span className="hover:underline cursor-pointer truncate">
                        By {doc.uploader_name}
                       </span>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
