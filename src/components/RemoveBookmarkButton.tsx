"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BookmarkX } from "lucide-react";
import { client } from "@/lib/hono";
import { toast } from "sonner";

interface RemoveBookmarkButtonProps {
  documentId: string;
}

export function RemoveBookmarkButton({
  documentId,
}: RemoveBookmarkButtonProps) {
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await client.api.bookmarks[":id"].toggle.$post({
        param: { id: documentId },
      });
      if (!res.ok) throw new Error("Failed to remove");
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Bookmark removed");
      window.location.reload();
    },
    onError: () => toast.error("Failed to remove bookmark"),
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive cursor-pointer"
      onClick={handleRemove}
      disabled={mutation.isPending}
      title="Remove Bookmark"
    >
      <BookmarkX className="h-4 w-4" />
      <span className="sr-only">Remove</span>
    </Button>
  );
}
