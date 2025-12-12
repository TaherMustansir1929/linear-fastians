"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/hono";
import { Comment } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CommentSectionProps {
  documentId: string;
  comments: Comment[];
}

export function CommentSection({ documentId, comments }: CommentSectionProps) {
  const { user, isSignedIn } = useUser();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await client.api.comments.$post({
        json: { documentId, content },
      });
      if (!res.ok) throw new Error("Failed to post");
      return await res.json();
    },
    onSuccess: () => {
      setContent("");
      toast.success("Comment posted!");
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      window.location.reload();
    },
    onError: () => toast.error("Failed to post comment"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-2xl font-semibold">Comments ({comments.length})</h3>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 gap-2 flex flex-col items-end">
            <Textarea
              placeholder="Add a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px]"
            />
            <Button disabled={mutation.isPending || !content.trim()}>
              {mutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
          Please sign in to join the discussion.
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <Link href={`/users/${comment.userId}`}>
              <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
                <AvatarImage src={comment.user?.avatarUrl || ""} />
                <AvatarFallback>
                  {comment.user?.fullName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/users/${comment.userId}`}
                  className="font-semibold text-sm hover:underline"
                >
                  {comment.user?.fullName || "Unknown User"}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground/90">{comment.content}</p>

              <CommentVoteButtons comment={comment} currentUserId={user?.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentVoteButtons({
  comment,
  currentUserId,
}: {
  comment: Comment;
  currentUserId?: string;
}) {
  const mutation = useMutation({
    mutationFn: async (type: 1 | -1) => {
      const res = await client.api.comments[":id"].vote.$post({
        param: { id: comment.id },
        json: { voteType: type },
      });
      if (!res.ok) throw new Error("Vote failed");
      return await res.json();
    },
    onError: () => toast.error("Failed to vote"),
  });

  const handleVote = (type: 1 | -1) => {
    if (!currentUserId) {
      toast.error("Please sign in to vote");
      return;
    }
    mutation.mutate(type);
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      <button
        onClick={() => handleVote(1)}
        disabled={mutation.isPending}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 transition-colors group/up disabled:opacity-50"
      >
        <ArrowBigUp className="h-4 w-4 group-hover/up:scale-110 transition-transform" />
        <span>{comment.upvoteCount || 0}</span>
        <span className="sr-only">Upvote</span>
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={mutation.isPending}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-600 transition-colors group/down disabled:opacity-50"
      >
        <ArrowBigDown className="h-4 w-4 group-hover/down:scale-110 transition-transform" />
        <span>{comment.downvoteCount || 0}</span>
        <span className="sr-only">Downvote</span>
      </button>
      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2">
        Reply
      </button>
    </div>
  );
}
