"use client";

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
  Bookmark,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { PDFViewer } from "@/components/renderers/PDFViewer";
import { MarkdownViewer } from "@/components/renderers/MarkdownViewer";
import { HTMLViewer } from "@/components/renderers/HTMLViewer";
import { TextViewer } from "@/components/renderers/TextViewer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShareDialog } from "@/components/ShareDialog";
import { type InferSelectModel } from "drizzle-orm";
import { documents } from "@/db/schema";

type Document = Omit<InferSelectModel<typeof documents>, "createdAt"> & {
  createdAt: string | Date;
  uploader?: {
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
};

interface PublicDocumentViewProps {
  doc: Document;
  signedUrl: string;
}

export function PublicDocumentView({
  doc,
  signedUrl,
}: PublicDocumentViewProps) {
  const isMobile = useIsMobile();
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Fetch content if needed (for non-PDF text types)
  const shouldFetchContent =
    doc && ["md", "txt", "latex", "tex"].includes(doc.fileType);

  const { data: textContent, isLoading } = useQuery({
    queryKey: ["public-document-text", doc?.id],
    queryFn: async () => {
      const res = await fetch(signedUrl);
      if (!res.ok) return "";
      return await res.text();
    },
    enabled: !!shouldFetchContent && !!signedUrl,
  });

  // Toggle function
  const toggleFullScreen = () => setIsFullScreen((prev) => !prev);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullScreen();
      } else if (e.key === "Escape") {
        setIsFullScreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLockedFeature = () => {
    toast.warning("Login required", {
      description: "Please log in to use this feature.",
      action: {
        label: "Login",
        onClick: () => (window.location.href = "/sign-in"),
      },
    });
  };

  const renderContent = () => {
    const viewerProps = isFullScreen
      ? { className: "h-full w-full rounded-none border-0 shadow-none" }
      : {};

    if (isLoading && shouldFetchContent) {
      return (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    switch (doc.fileType) {
      case "pdf":
        return <PDFViewer url={signedUrl} {...viewerProps} />;
      case "md":
        return <MarkdownViewer content={textContent || ""} {...viewerProps} />;
      case "html":
        return <HTMLViewer url={signedUrl} {...viewerProps} />;
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
              <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                Download File
              </a>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-semibold">Public View Mode.</span> You are
          viewing a shared document.
        </div>
        <Button variant="link" size="sm" asChild>
          <Link href="/sign-in">Login for full access</Link>
        </Button>
      </div>

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
              {doc.uploader && (
                <div className="flex items-center gap-1">
                  By {doc.uploader.fullName || "Anonymous"}
                </div>
              )}
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
                {isFullScreen ? <X /> : <Fullscreen />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleLockedFeature}
                title="Bookmark (Login Required)"
              >
                <Bookmark className="h-4 w-4" />
              </Button>

              <Button asChild size={isMobile ? "icon" : "default"}>
                <a
                  href={signedUrl}
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

              <ShareDialog documentId={doc.id} />
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isFullScreen
            ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-0 overflow-auto bg-background"
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

        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-full border shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-green-100 hover:text-green-600 h-10 w-10 rounded-full"
              onClick={handleLockedFeature}
            >
              <ThumbsUp className="h-5 w-5" />
              <span className="sr-only">Upvote</span>
            </Button>
            <span className="text-sm font-bold font-mono px-2">
              {(doc.upvoteCount || 0) - (doc.downvoteCount || 0)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-red-100 hover:text-red-600 h-10 w-10 rounded-full"
              onClick={handleLockedFeature}
            >
              <ThumbsDown className="h-5 w-5" />
              <span className="sr-only">Downvote</span>
            </Button>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg text-center gap-4">
            <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">Comments are locked</h3>
            <p className="text-muted-foreground max-w-md">
              To view and post comments, please log in to your account.
            </p>
            <Button onClick={() => (window.location.href = "/sign-in")}>
              Login to Join Discussion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
