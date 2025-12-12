"use client";

import { useDocumentDetails } from "@/hooks/useDocuments";

import { MarkdownViewer } from "@/components/renderers/MarkdownViewer";
import { PDFViewer } from "@/components/renderers/PDFViewer";
import { HTMLViewer } from "@/components/renderers/HTMLViewer";
import { TextViewer } from "@/components/renderers/TextViewer";
import { Button } from "@/components/ui/button";
import { Download, Calendar, Tag, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { TimeTracker } from "@/components/TimeTracker";
import { VoteButton } from "@/components/VoteButton";
import { BookmarkButton } from "@/components/BookmarkButton";
import { CommentSection } from "@/components/CommentSection";
import { ViewTracker } from "@/components/ViewTracker";
import { useQuery } from "@tanstack/react-query";

export default function DocumentPageContent({ id }: { id: string }) {
  const { data, isLoading, error } = useDocumentDetails(id);

  // Derived state
  const doc = data?.doc;
  const docComments = data?.docComments;
  const userVote = data?.userVote;
  const isBookmarked = data?.isBookmarked;

  const publicUrl = data?.signedUrl || "";

  // Fetch content if needed
  const shouldFetchContent =
    doc && ["md", "txt", "latex", "tex"].includes(doc.fileType);
  const { data: textContent } = useQuery({
    queryKey: ["document-text", doc?.id],
    queryFn: async () => {
      const res = await fetch(publicUrl);
      if (!res.ok) return "";
      return await res.text();
    },
    enabled: !!shouldFetchContent && !!publicUrl,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load document: {error?.message}
      </div>
    );
  }

  const renderContent = () => {
    switch (doc.fileType) {
      case "pdf":
        return <PDFViewer url={publicUrl} />;
      case "md":
        return <MarkdownViewer content={textContent || ""} />;
      case "html":
        return <HTMLViewer url={publicUrl} />;
      case "txt":
      case "latex":
        return (
          <TextViewer
            content={textContent || ""}
            language={doc.fileType === "latex" ? "latex" : "text"}
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
            <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {doc.subject}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(doc.createdAt), "PPP")}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {doc.viewCount || 0} views
              </div>
            </div>
          </div>

          <div className="w-full md:w-fit flex flex-col sm:flex-row items-center gap-4 justify-between">
            <VoteButton
              documentId={id}
              initialUpvotes={doc.upvoteCount}
              initialDownvotes={doc.downvoteCount}
              userVote={userVote as 1 | -1 | null}
            />
            <div className="flex items-center gap-4">
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
                  <Download className="h-4 w-4" /> Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        {renderContent()}
      </div>

      <div className="mt-12 border-t pt-8">
        <CommentSection documentId={id} comments={docComments || []} />
      </div>
    </div>
  );
}
