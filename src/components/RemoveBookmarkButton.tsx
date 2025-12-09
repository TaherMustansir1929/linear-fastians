"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkX } from "lucide-react";
import { toggleBookmarkAction } from "@/app/actions";
import { toast } from "sonner";

interface RemoveBookmarkButtonProps {
  documentId: string;
}

export function RemoveBookmarkButton({
  documentId,
}: RemoveBookmarkButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent row click if any

    startTransition(async () => {
      try {
        await toggleBookmarkAction(documentId);
        toast.success("Bookmark removed");
        window.location.reload(); // Refresh to remove from list immediately
      } catch (_err) {
        toast.error("Failed to remove bookmark");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive cursor-pointer"
      onClick={handleRemove}
      disabled={isPending}
      title="Remove Bookmark"
    >
      <BookmarkX className="h-4 w-4" />
      <span className="sr-only">Remove</span>
    </Button>
  );
}
