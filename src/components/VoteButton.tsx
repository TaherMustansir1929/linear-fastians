"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { client } from "@/lib/hono";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface VoteButtonProps {
  documentId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  userVote?: 1 | -1 | null;
}

export function VoteButton({
  documentId,
  initialUpvotes,
  initialDownvotes,
  userVote,
}: VoteButtonProps) {
  const { isSignedIn } = useUser();
  const [optimisticVote, setOptimisticVote] = useState<{
    type: 1 | -1 | null;
    up: number;
    down: number;
  }>({
    type: userVote || null,
    up: initialUpvotes,
    down: initialDownvotes,
  });

  const mutation = useMutation({
    mutationFn: async (type: 1 | -1) => {
      const res = await client.api.documents[":id"].vote.$post({
        param: { id: documentId },
        json: { voteType: type },
      });
      if (!res.ok) throw new Error("Vote failed");
      return await res.json();
    },
    onError: () => {
      toast.error("Failed to vote");
    },
  });

  const handleVote = (type: 1 | -1) => {
    if (!isSignedIn) {
      toast.error("Please sign in to vote");
      return;
    }

    setOptimisticVote((curr) => {
      let newUp = curr.up;
      let newDown = curr.down;
      const newType = curr.type === type ? null : type;

      if (curr.type === 1) newUp--;
      if (curr.type === -1) newDown--;

      if (newType === 1) newUp++;
      if (newType === -1) newDown++;

      return { type: newType, up: newUp, down: newDown };
    });

    mutation.mutate(type);
  };

  return (
    <div className="flex flex-row items-center gap-2 bg-muted/30 p-1 rounded-lg border">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-emerald-100 hover:text-emerald-600 transition-colors",
            optimisticVote.type === 1 && "text-emerald-600 bg-emerald-100"
          )}
          onClick={() => handleVote(1)}
          disabled={mutation.isPending}
        >
          <ArrowBigUp
            className={cn(
              "h-6 w-6",
              optimisticVote.type === 1 && "fill-current"
            )}
          />
        </Button>
        <span
          className={cn(
            "font-bold text-sm min-w-[1.5ch] text-center",
            optimisticVote.type === 1 && "text-emerald-600"
          )}
        >
          {optimisticVote.up}
        </span>
      </div>

      <div className="w-px h-4 bg-border mx-1" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-rose-100 hover:text-rose-600 transition-colors",
            optimisticVote.type === -1 && "text-rose-600 bg-rose-100"
          )}
          onClick={() => handleVote(-1)}
          disabled={mutation.isPending}
        >
          <ArrowBigDown
            className={cn(
              "h-6 w-6",
              optimisticVote.type === -1 && "fill-current"
            )}
          />
        </Button>
        <span
          className={cn(
            "font-bold text-sm min-w-[1.5ch] text-center",
            optimisticVote.type === -1 && "text-rose-600"
          )}
        >
          {optimisticVote.down}
        </span>
      </div>
    </div>
  );
}
