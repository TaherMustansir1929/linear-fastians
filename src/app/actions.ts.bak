'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function deleteDocumentAction(documentId: string, filePath: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // 1. Verify Ownership (Safety Check)
  // Even with Service Key, we must manually check if the user requesting delete owns the doc.
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .select('user_id')
    .eq('id', documentId)
    .single()

  if (!doc || doc.user_id !== userId) {
    throw new Error('You do not have permission to delete this document.')
  }

  // 2. Delete from Storage
  const { error: storageError } = await supabaseAdmin.storage
    .from('documents')
    .remove([filePath])

  if (storageError) {
    console.error('Storage delete error:', storageError)
    // Proceed to DB delete anyway to avoid orphaned records? 
    // Or throw? Let's log and proceed.
  }

  // 3. Delete from DB
  const { error: dbError } = await supabaseAdmin
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (dbError) {
    throw new Error(dbError.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function updateDocumentAction(id: string, title: string, subject: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // 1. Verify Ownership
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!doc || doc.user_id !== userId) {
    throw new Error('You do not have permission to edit this document.')
  }

  // 2. Update DB
  const { error } = await supabaseAdmin
    .from('documents')
    .update({ title, subject })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/documents/${id}`)
  revalidatePath('/')
  return { success: true }
}
