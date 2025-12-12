"use client";

import { useState } from "react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Bookmark } from "lucide-react";
import { client } from "@/lib/hono";
import { useMutation } from "@tanstack/react-query";
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
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await client.api.bookmarks[":id"].toggle.$post({
        param: { id: documentId },
      });
      if (!res.ok) throw new Error("Bookmark failed");
      return await res.json();
    },
    onError: () => {
      setIsBookmarked(!isBookmarked); // Revert
      toast.error("Failed to update bookmark");
    },
    onSuccess: () => {
      // Success
    },
  });

  const handleToggle = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to bookmark");
      return;
    }

    const previous = isBookmarked;
    setIsBookmarked(!isBookmarked); // Optimistic

    mutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(
          previous ? "Removed from bookmarks" : "Added to bookmarks"
        );
      },
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
      disabled={mutation.isPending}
    >
      <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
      <span>{isBookmarked ? "Saved" : "Save"}</span>
    </Button>
  );
}
