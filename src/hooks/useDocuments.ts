import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Document, FileType } from '@/types'
import { toast } from 'sonner'
import { deleteDocumentAction, updateDocumentAction } from '@/app/actions'

// ... (existing code)

export function useDocuments(userId?: string) {
  return useQuery({
    queryKey: ['documents', userId],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      
      if (error) throw error
      return data as Document[]
    }
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()
        
      if (error) throw error
      return data as Document
    }
  })
}

interface UpdateVariables {
  id: string
  title: string
  subject: string
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, title, subject }: UpdateVariables) => {
      const result = await updateDocumentAction(id, title, subject)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['document'] }) 
      toast.success('Document updated')
    },
    onError: (e) => toast.error(e.message)
  })
}

interface UploadVariables {
  file: File
  title: string
  subject: string
  userId: string
  userFullName?: string | null
  userAvatar?: string | null
}

export const uploadFile = async ({ file, title, subject, userId, userFullName, userAvatar }: UploadVariables) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() as string
    let fileType: FileType = 'txt'
    if (['pdf'].includes(fileExt)) fileType = 'pdf'
    else if (['md', 'markdown'].includes(fileExt)) fileType = 'md'
    else if (['html', 'htm'].includes(fileExt)) fileType = 'html'
    else if (['tex', 'latex'].includes(fileExt)) fileType = 'latex'
    
    const filePath = `${userId}/${Date.now()}_${file.name}`

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
        user_id: userId,
        uploader_name: userFullName,
        uploader_avatar: userAvatar,
        tags: []
      })

    if (dbError) throw dbError
    return { title }
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document uploaded successfully!')
    },
    onError: (error: Error) => {
      toast.error('Upload failed: ' + error.message)
    }
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string, filePath: string }) => {
       const result = await deleteDocumentAction(id, filePath)
       return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['userDocuments'] }) // Ensure specific user queries are invalidated
      toast.success('Document deleted.')
    },
    onError: (error: Error) => {
      toast.error('Delete failed: ' + error.message)
    }
  })
}
