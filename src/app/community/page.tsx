'use client'

import { useDocuments } from '@/hooks/useDocuments'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default function CommunityPage() {
  const { data: documents, isLoading } = useDocuments()
  
  if (isLoading) return <div className="text-center py-20">Loading community stats...</div>

  // Client-side aggregation
  const contributorStats = documents?.reduce((acc, doc) => {
    if (!doc.uploader_name) return acc
    if (!acc[doc.user_id]) {
      acc[doc.user_id] = {
        name: doc.uploader_name,
        avatar: doc.uploader_avatar,
        count: 0
      }
    }
    acc[doc.user_id].count += 1
    return acc
  }, {} as Record<string, { name: string, avatar: string | null | undefined, count: number }>)

  const sortedContributors = Object.entries(contributorStats || {})
    .sort(([, a], [, b]) => b.count - a.count)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Community Contributors</h1>
      
      {sortedContributors.length === 0 ? (
        <div className="text-center py-12">No contributions yet. Be the first!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedContributors.map(([userId, stats]) => (
            <Link href={`/users/${userId}`} key={userId}>
              <Card className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center gap-4">
                  {stats.avatar ? (
                    <img src={stats.avatar} alt={stats.name} className="w-12 h-12 rounded-full border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                       {stats.name[0]}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{stats.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {stats.count} Document{stats.count !== 1 && 's'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
             </Link>
          ))}
        </div>
      )}
    </div>
  )
}
