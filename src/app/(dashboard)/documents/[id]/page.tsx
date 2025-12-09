import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { MarkdownViewer } from "@/components/renderers/MarkdownViewer";
import { PDFViewer } from "@/components/renderers/PDFViewer";
import { HTMLViewer } from "@/components/renderers/HTMLViewer";
import { TextViewer } from "@/components/renderers/TextViewer";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

import { auth } from "@clerk/nextjs/server";
import { TimeTracker } from "@/components/TimeTracker";
import { VoteButton } from "@/components/VoteButton";
import { BookmarkButton } from "@/components/BookmarkButton";
import { CommentSection } from "@/components/CommentSection";
import { ViewTracker } from "@/components/ViewTracker";
import { Eye } from "lucide-react";

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  const { data: doc, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !doc) {
    notFound();
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from("comments")
    .select("*, user:users(*)")
    .eq("document_id", id)
    .order("created_at", { ascending: false });

  // Fetch user vote
  let userVote = null;
  if (userId) {
    const { data: vote } = await supabase
      .from("document_votes")
      .select("vote_type")
      .eq("document_id", id)
      .eq("user_id", userId)
      .single();
    if (vote) userVote = vote.vote_type;
    if (vote) userVote = vote.vote_type;
  }

  // Fetch bookmark status
  let isBookmarked = false;
  if (userId) {
    const { data: bookmark } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("document_id", id)
      .eq("user_id", userId)
      .single();
    if (bookmark) isBookmarked = true;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("documents").getPublicUrl(doc.file_path);

  let content = "";
  if (["md", "txt", "latex", "tex"].includes(doc.file_type)) {
    try {
      const res = await fetch(publicUrl);
      if (res.ok) {
        content = await res.text();
      }
    } catch (e) {
      console.error("Failed to fetch text content", e);
    }
  }

  const renderContent = () => {
    switch (doc.file_type) {
      case "pdf":
        return <PDFViewer url={publicUrl} />;
      case "md":
        return <MarkdownViewer content={content} />;
      case "html":
        return <HTMLViewer url={publicUrl} />; // Iframe
      case "txt":
      case "tex":
      case "latex":
        return (
          <TextViewer
            content={content}
            language={
              doc.file_type === "latex" || doc.file_type === "tex"
                ? "latex"
                : "text"
            }
          />
        );
      default:
        return (
          <div className="text-center py-10">
            <p>File preview not available.</p>
            <Button asChild className="mt-4">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                Download File
              </a>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <TimeTracker documentId={id} />
      <ViewTracker documentId={id} />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {doc.subject}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(doc.created_at), "PPP")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {doc.view_count || 0} views
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-fit flex flex-col sm:flex-row items-center gap-4 justify-between">
            {/* Vote Button placed in header */}
            <VoteButton
              documentId={id}
              initialUpvotes={doc.upvote_count || 0}
              initialDownvotes={doc.downvote_count || 0}
              userVote={userVote}
            />

            <div className="flex flex-row items-center justify-between gap-4">
              <BookmarkButton
                documentId={id}
                initialIsBookmarked={!!isBookmarked}
              />

              <Button asChild>
                <a
                  href={publicUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        {renderContent()}
      </div>

      {/* Social Section */}
      <div className="mt-12 border-t pt-8">
        <CommentSection documentId={id} comments={comments || []} />
      </div>
    </div>
  );
}
