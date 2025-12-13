"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import { useDocumentDetails } from "@/hooks/useDocuments";

import { BookmarkButton } from "@/components/BookmarkButton";
import { CommentSection } from "@/components/CommentSection";
import { TimeTracker } from "@/components/TimeTracker";
import { ViewTracker } from "@/components/ViewTracker";
import { VoteButton } from "@/components/VoteButton";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { HTMLViewer } from "@/components/renderers/HTMLViewer";
import { MarkdownViewer } from "@/components/renderers/MarkdownViewer";
import { PDFViewer } from "@/components/renderers/PDFViewer";
import { TextViewer } from "@/components/renderers/TextViewer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  Download,
  Eye,
  Fullscreen,
  Loader2,
  Tag,
  X,
} from "lucide-react";

export default function DocumentPageContent({ id }: { id: string }) {
  const { data, isLoading, error } = useDocumentDetails(id);
  const isMobile = useIsMobile();

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

  const [isFullScreen, setIsFullScreen] = useState(false);

  // Toggle function
  const toggleFullScreen = () => setIsFullScreen((prev) => !prev);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        // Only toggle if not typing in an input/textarea
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault(); // Prevent default 'f' action if needed (though usually none)
          toggleFullScreen();
        }
      } else if (e.key === "Escape") {
        setIsFullScreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    const viewerProps = isFullScreen
      ? { className: "h-full w-full rounded-none border-0 shadow-none" }
      : {};

    switch (doc.fileType) {
      case "pdf":
        return <PDFViewer url={publicUrl} {...viewerProps} />;
      case "md":
        return <MarkdownViewer content={textContent || ""} {...viewerProps} />;
      case "html":
        return <HTMLViewer url={publicUrl} {...viewerProps} />;
      case "txt":
      case "latex":
        return (
          <TextViewer
            content={textContent || ""}
            language={doc.fileType === "latex" ? "latex" : "text"}
            {...viewerProps}
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

          <div className="w-full md:w-fit flex flex-row items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="p-1 cursor-pointer"
                onClick={toggleFullScreen}
                title={
                  isFullScreen ? "Exit Full Screen (Esc)" : "Full Screen (F)"
                }
              >
                {isFullScreen ? (
                  <X className="" />
                ) : (
                  <Fullscreen className="" />
                )}
              </Button>
              <BookmarkButton
                documentId={id}
                initialIsBookmarked={!!isBookmarked}
              />
              <Button asChild size={isMobile ? "icon" : "default"}>
                <a
                  href={publicUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                  {!isMobile && "Download"}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isFullScreen
            ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-0 overflow-auto"
            : "border rounded-xl overflow-hidden min-h-[500px]"
        )}
      >
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isFullScreen
              ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-0 overflow-auto"
              : "shadow-sm rounded-lg overflow-hidden min-h-[500px]"
          )}
        >
          {isFullScreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullScreen}
              className="absolute top-4 right-4 z-60 bg-background/50 hover:bg-background/80 backdrop-blur-sm shadow-sm"
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Exit Full Screen</span>
            </Button>
          )}
          {renderContent()}
        </div>
        <VoteButton
          documentId={id}
          initialUpvotes={doc.upvoteCount}
          initialDownvotes={doc.downvoteCount}
          userVote={userVote as 1 | -1 | null}
        />
      </div>

      <div className="mt-12 border-t pt-8">
        <CommentSection documentId={id} comments={docComments || []} />
      </div>
    </div>
  );
}
