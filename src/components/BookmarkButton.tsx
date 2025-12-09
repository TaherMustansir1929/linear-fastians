"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toggleBookmarkAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface BookmarkButtonProps {
  documentId: string;
  initialIsBookmarked: boolean;
}

export function BookmarkButton({
  documentId,
  initialIsBookmarked,
}: BookmarkButtonProps) {
  const { isSignedIn } = useUser();
  const [isPending, startTransition] = useTransition();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

  const handleToggle = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to bookmark");
      return;
    }

    const previous = isBookmarked;
    setIsBookmarked(!isBookmarked); // Optimistic

    startTransition(async () => {
      try {
        await toggleBookmarkAction(documentId);
        toast.success(
          previous ? "Removed from bookmarks" : "Added to bookmarks"
        );
      } catch (e) {
        setIsBookmarked(previous);
        toast.error("Failed to update bookmark");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-9 px-3 gap-2 border hover:bg-secondary/80",
        isBookmarked && "bg-secondary text-primary border-primary/20",
        !isBookmarked && "text-muted-foreground"
      )}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
      <span>{isBookmarked ? "Saved" : "Save"}</span>
    </Button>
  );
}
