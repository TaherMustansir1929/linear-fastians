'use client'

import { useDocuments, useDeleteDocument } from '@/hooks/useDocuments'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, FileText, ExternalLink } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { EditDocumentDrawer } from '@/components/EditDocumentDrawer'

export default function Dashboard() {
  const { user } = useUser()
  const { data: documents, isLoading } = useDocuments(user?.id)
  const { mutate: deleteDocument } = useDeleteDocument()

  if (!user) return <div className="text-center py-20">Please sign in.</div>
  if (isLoading) return <div className="text-center py-20">Loading your documents...</div>

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      {documents?.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground mb-4">You haven't uploaded any documents yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents?.map((doc) => (
            <div key={doc.id} className="relative group border rounded-lg bg-card hover:shadow-md transition-all">
              
              <div className="flex items-center justify-between p-4 z-10 relative">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <Link href={`/documents/${doc.id}`} className="hover:underline">
                        <h3 className="font-semibold">{doc.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {doc.subject} • Uploaded on {format(new Date(doc.created_at), 'PPP')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <EditDocumentDrawer document={doc} />
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{doc.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                          onClick={() => deleteDocument({ id: doc.id, filePath: doc.file_path })}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
