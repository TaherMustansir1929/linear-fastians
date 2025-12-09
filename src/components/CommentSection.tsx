"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { postCommentAction } from "@/app/actions";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Comment } from "@/types"; // Ensure Comment type is imported

interface CommentSectionProps {
  documentId: string;
  comments: Comment[];
}

export function CommentSection({ documentId, comments }: CommentSectionProps) {
  const { user, isSignedIn } = useUser();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      try {
        await postCommentAction(documentId, content);
        setContent("");
        toast.success("Comment posted!");
      } catch (e) {
        toast.error("Failed to post comment");
      }
    });
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
            <Button disabled={isPending || !content.trim()}>
              {isPending ? "Posting..." : "Post Comment"}
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
            <Link href={`/users/${comment.user_id}`}>
              <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
                <AvatarImage src={comment.user?.avatar_url || ""} />
                <AvatarFallback>
                  {comment.user?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/users/${comment.user_id}`}
                  className="font-semibold text-sm hover:underline"
                >
                  {comment.user?.full_name || "Unknown User"}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground/90">{comment.content}</p>

              <CommentVoteButtons
                comment={comment}
                documentId={documentId}
                currentUserId={user?.id}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { voteCommentAction } from "@/app/actions";
import { cn } from "@/lib/utils";

function CommentVoteButtons({
  comment,
  documentId,
  currentUserId,
}: {
  comment: Comment;
  documentId: string;
  currentUserId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  // Simple optimistic UI for now

  // We don't have isOptimisticUpvoted state yet without fetching user vote.
  // So we just show counts and allow voting.

  const handleVote = (type: 1 | -1) => {
    if (!currentUserId) {
      toast.error("Please sign in to vote");
      return;
    }
    startTransition(async () => {
      try {
        await voteCommentAction(comment.id, documentId, type);
      } catch (e) {
        toast.error("Failed to vote");
      }
    });
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 transition-colors group/up disabled:opacity-50"
      >
        <ArrowBigUp className="h-4 w-4 group-hover/up:scale-110 transition-transform" />
        <span>{comment.upvote_count || 0}</span>
        <span className="sr-only">Upvote</span>
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-600 transition-colors group/down disabled:opacity-50"
      >
        <ArrowBigDown className="h-4 w-4 group-hover/down:scale-110 transition-transform" />
        <span>{comment.downvote_count || 0}</span>
        <span className="sr-only">Downvote</span>
      </button>
      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2">
        Reply
      </button>
    </div>
  );
}
