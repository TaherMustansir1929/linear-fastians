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
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' // Assuming sonner is installed as per package.json

export function UploadModal() {
  const { user } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title || !subject || !user) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() as string
      let fileType: FileType = 'txt'
      if (['pdf'].includes(fileExt)) fileType = 'pdf'
      else if (['md', 'markdown'].includes(fileExt)) fileType = 'md'
      else if (['html', 'htm'].includes(fileExt)) fileType = 'html'
      else if (['tex', 'latex'].includes(fileExt)) fileType = 'latex'
      
      const filePath = `${user.id}/${Date.now()}_${file.name}`

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Insert into DB
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          title,
          file_path: filePath,
          file_type: fileType,
          subject,
          user_id: user.id,
          tags: [] // Todo implement tags
        })

      if (dbError) throw dbError

      toast.success('Document uploaded successfully!')
      setOpen(false)
      setTitle('')
      setSubject('')
      setFile(null)
      router.refresh()
    } catch (error: any) {
      console.error('Upload failed:', error)
      toast.error('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
          <DialogDescription>
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
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((sub) => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
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
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
