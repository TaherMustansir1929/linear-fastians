'use client'

import React, { use } from 'react'
import { useDocuments } from '@/hooks/useDocuments'
import { DocumentList } from '@/components/DocumentList' // Reuse generic list or make a specific one?
// Wait, DocumentList fetches ALL docs. I need to make DocumentList accept a filter or just map manually here.
// Actually, useDocuments hook accepts userId.
// Let's create a specific list view for this page or reuse logic.
// Simpler: Just copy the list rendering logic since I want to reuse the same card style. 
// OR refactor DocumentList to accept `documents` prop again? 
// The user asked for "useQuery". 
// Let's refactor DocumentList to accept an optional `userId` prop which passes to `useDocuments`.

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { format } from 'date-fns'
import { FileText, FileCode, FileType as FileTypeIcon, Calendar } from 'lucide-react'

// Copying helper from DocumentList for consistency since I don't want to over-complicate DocumentList prop drilling right now.
const getIcon = (type: string) => {
  switch (type) {
    case 'pdf': return <FileText className="h-10 w-10 text-red-500" />
    case 'md': return <FileCode className="h-10 w-10 text-blue-500" />
    case 'html': return <FileCode className="h-10 w-10 text-orange-500" />
    case 'latex': return <div className="h-10 w-10 flex items-center justify-center font-bold text-green-600 border rounded">TeX</div>
    default: return <FileTypeIcon className="h-10 w-10 text-gray-500" />
  }
}

interface ProfilePageProps {
    params: Promise<{ userId: string }>
}

export default function UserProfile({ params }: ProfilePageProps) {
  const { userId } = use(params)
  const { data: documents, isLoading } = useDocuments(userId)

  if (isLoading) return <div className="text-center py-20">Loading profile...</div>

  // We don't have a "getUserProfile" API, so we infer name from the first document or just show generic header.
  const userName = documents?.[0]?.uploader_name || 'Student'
  const userAvatar = documents?.[0]?.uploader_avatar

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="w-16 h-16 rounded-full border-2" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
            {userName[0]}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{userName}</h1>
          <p className="text-muted-foreground">{documents?.length || 0} Documents Shared</p>
        </div>
      </div>

      {documents?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          This user hasn't shared any documents yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {documents?.map((doc) => (
            <Link href={`/documents/${doc.id}`} key={doc.id}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1">
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
