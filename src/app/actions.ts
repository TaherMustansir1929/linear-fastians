"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function deleteDocumentAction(
  documentId: string,
  filePath: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 1. Verify Ownership (Safety Check)
  // Even with Service Key, we must manually check if the user requesting delete owns the doc.
  const { data: doc } = await supabaseAdmin
    .from("documents")
    .select("user_id")
    .eq("id", documentId)
    .single();

  if (!doc || doc.user_id !== userId) {
    throw new Error("You do not have permission to delete this document.");
  }

  // 2. Delete from Storage
  const { error: storageError } = await supabaseAdmin.storage
    .from("documents")
    .remove([filePath]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
    // Proceed to DB delete anyway to avoid orphaned records?
    // Or throw? Let's log and proceed.
  }

  // 3. Delete from DB
  const { error: dbError } = await supabaseAdmin
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (dbError) {
    throw new Error(dbError.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function updateDocumentAction(
  id: string,
  title: string,
  subject: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 1. Verify Ownership
  const { data: doc } = await supabaseAdmin
    .from("documents")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!doc || doc.user_id !== userId) {
    throw new Error("You do not have permission to edit this document.");
  }

  // 2. Update DB
  const { error } = await supabaseAdmin
    .from("documents")
    .update({ title, subject })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/documents/${id}`);
  revalidatePath("/");
  return { success: true };
}

// --- Social Features ---

import { currentUser } from "@clerk/nextjs/server";

async function syncUser() {
  const user = await currentUser();
  if (!user) return null;

  const { error } = await supabaseAdmin.from("users").upsert(
    {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      full_name: user.fullName,
      avatar_url: user.imageUrl,
    },
    { onConflict: "id", ignoreDuplicates: true }
  ); // upsert but mainly ensure exists.
  // Actually we might want to update avatar/name if changed.
  // For now, let's allow updating.

  if (error) console.error("Error syncing user:", error);
  return user.id;
}

export async function incrementViewAction(documentId: string) {
  const { error } = await supabaseAdmin.rpc("increment_view", {
    doc_id: documentId,
  });
  if (error) console.error("Error incrementing view:", error);
}

export async function voteDocumentAction(documentId: string, voteType: 1 | -1) {
  const userId = await syncUser();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin.rpc("handle_vote", {
    doc_id: documentId,
    voter_id: userId,
    new_vote_type: voteType,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/gallery");
}

export async function postCommentAction(documentId: string, content: string) {
  const userId = await syncUser();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin.from("comments").insert({
    user_id: userId,
    document_id: documentId,
    content,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/documents/${documentId}`);
  return { success: true };
}

export async function voteCommentAction(
  commentId: string,
  documentId: string,
  voteType: 1 | -1
) {
  const userId = await syncUser();
  if (!userId) throw new Error("Unauthorized");

  const { error } = await supabaseAdmin.rpc("handle_comment_vote", {
    c_id: commentId,
    voter_id: userId,
    new_vote_type: voteType,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/documents/${documentId}`);
}
