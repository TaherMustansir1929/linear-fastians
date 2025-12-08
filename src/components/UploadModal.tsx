'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SUBJECTS, FileType } from '@/types'
import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUploadDocument } from '@/hooks/useDocuments'

export function UploadModal() {
  const { user } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { mutate: uploadDocument, isPending } = useUploadDocument()
  
  // Form State
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      // Auto-fill title if empty
      if (!title) {
        const fileName = e.target.files[0].name.split('.').slice(0, -1).join('.')
        setTitle(fileName)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title || !subject || !user) return

    uploadDocument({
      file,
      title,
      subject,
      userId: user.id,
      userFullName: user.fullName || user.username || 'Anonymous',
      userAvatar: user.imageUrl
    }, {
      onSuccess: () => {
        setOpen(false)
        setTitle('')
        setSubject('')
        setFile(null)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 cursor-pointer">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
          <DialogDescription className='text-xs'>
            Share your notes, signals, or past papers with the class.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Document Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Calculus Final Review" 
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Select onValueChange={setSubject} value={subject} required>
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((sub) => (
                  <SelectItem key={sub} value={sub} className="cursor-pointer">{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <Input 
              id="file" 
              type="file" 
              onChange={handleFileChange} 
              accept=".pdf,.md,.markdown,.html,.htm,.txt,.tex,.latex"
              required
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Note: <span className="font-semibold text-foreground">Markdown (.md)</span> format is preferred for best rendering experience, <br/>PDFs, LaTeX, TXT and HTML files are also supported.
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="cursor-pointer">
              {isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
