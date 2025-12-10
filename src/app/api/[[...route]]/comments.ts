import { Hono } from "hono";
import { db } from "@/db";
import { comments, commentVotes, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

const app = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        documentId: z.uuid(),
        content: z.string().min(1),
      })
    ),
    async (c) => {
      const { documentId, content } = c.req.valid("json");
      const user = await currentUser();

      if (!user) return c.json({ error: "Unauthorized" }, 401);

      // Sync user
      await db
        .insert(users)
        .values({
          id: user.id,
          email: user.emailAddresses[0].emailAddress,
          fullName: user.fullName,
          avatarUrl: user.imageUrl,
          role: "Student",
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: user.emailAddresses[0].emailAddress,
            fullName: user.fullName,
            avatarUrl: user.imageUrl,
          },
        });

      await db.insert(comments).values({
        userId: user.id,
        documentId,
        content,
      });

      return c.json({ success: true });
    }
  )
  .post(
    "/:id/vote",
    zValidator(
      "json",
      z.object({
        voteType: z.union([z.literal(1), z.literal(-1)]),
      })
    ),
    async (c) => {
      const commentId = c.req.param("id");
      const { voteType } = c.req.valid("json");
      const user = await currentUser();

      if (!user) return c.json({ error: "Unauthorized" }, 401);
      const userId = user.id;

      // Sync user
      await db
        .insert(users)
        .values({
          id: user.id,
          email: user.emailAddresses[0].emailAddress,
          fullName: user.fullName,
          avatarUrl: user.imageUrl,
          role: "Student",
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: user.emailAddresses[0].emailAddress,
            fullName: user.fullName,
            avatarUrl: user.imageUrl,
          },
        });

      await db.transaction(async (tx) => {
        const existingVote = await tx.query.commentVotes.findFirst({
          where: and(
            eq(commentVotes.commentId, commentId),
            eq(commentVotes.userId, userId)
          ),
        });

        if (existingVote && existingVote.voteType === voteType) {
          // Toggle Off
          await tx
            .delete(commentVotes)
            .where(
              and(
                eq(commentVotes.commentId, commentId),
                eq(commentVotes.userId, userId)
              )
            );

          if (voteType === 1) {
            await tx
              .update(comments)
              .set({
                upvoteCount: sql`GREATEST(0, ${comments.upvoteCount} - 1)`,
              })
              .where(eq(comments.id, commentId));
          } else {
            await tx
              .update(comments)
              .set({
                downvoteCount: sql`GREATEST(0, ${comments.downvoteCount} - 1)`,
              })
              .where(eq(comments.id, commentId));
          }
        } else if (existingVote && existingVote.voteType !== voteType) {
          // Change Vote
          await tx
            .update(commentVotes)
            .set({ voteType: voteType })
            .where(
              and(
                eq(commentVotes.commentId, commentId),
                eq(commentVotes.userId, userId)
              )
            );

          if (voteType === 1) {
            await tx
              .update(comments)
              .set({
                downvoteCount: sql`GREATEST(0, ${comments.downvoteCount} - 1)`,
                upvoteCount: sql`${comments.upvoteCount} + 1`,
              })
              .where(eq(comments.id, commentId));
          } else {
            await tx
              .update(comments)
              .set({
                upvoteCount: sql`GREATEST(0, ${comments.upvoteCount} - 1)`,
                downvoteCount: sql`${comments.downvoteCount} + 1`,
              })
              .where(eq(comments.id, commentId));
          }
        } else {
          // New Vote
          await tx.insert(commentVotes).values({
            userId,
            commentId,
            voteType,
          });

          if (voteType === 1) {
            await tx
              .update(comments)
              .set({ upvoteCount: sql`${comments.upvoteCount} + 1` })
              .where(eq(comments.id, commentId));
          } else {
            await tx
              .update(comments)
              .set({ downvoteCount: sql`${comments.downvoteCount} + 1` })
              .where(eq(comments.id, commentId));
          }
        }
      });

      return c.json({ success: true });
    }
  );

export default app;
