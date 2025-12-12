import { Hono } from "hono";
import { db } from "@/db";
import {
  documents,
  documentVotes,
  users,
  documentAccessLogs,
  comments,
  bookmarks,
} from "@/db/schema";
import { getUploadUrl, getFileUrl, deleteFile } from "@/lib/storage";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono()
  .get("/", async (c) => {
    const { userId } = await auth();
    // Default: fetch all recent or filter by user if query param?
    // Current useDocuments fetches *all* if userId not provided, or filtered.
    const filterUserId = c.req.query("userId");

    const docs = await db.query.documents.findMany({
      where: filterUserId ? eq(documents.userId, filterUserId) : undefined,
      orderBy: [desc(documents.createdAt)],
    });

    return c.json(docs);
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        title: z.string(),
        filePath: z.string(),
        fileType: z.string(),
        subject: z.string(),
        uploaderName: z.string().optional(),
        uploaderAvatar: z.string().optional(),
      })
    ),
    async (c) => {
      const {
        title,
        filePath,
        fileType,
        subject,
        uploaderName,
        uploaderAvatar,
      } = c.req.valid("json");
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

      await db.transaction(async (tx) => {
        await tx.insert(documents).values({
          title,
          filePath,
          fileType: fileType as any,
          subject,
          userId: user.id,
          uploaderName: uploaderName || user.fullName,
          uploaderAvatar: uploaderAvatar || user.imageUrl,
          tags: [],
        });

        // +10 Reputation for Upload
        await tx
          .update(users)
          .set({
            reputationScore: sql`${users.reputationScore} + 10`,
          })
          .where(eq(users.id, user.id));
      });

      return c.json({ success: true });
    }
  )
  .post(
    "/upload-url",
    zValidator(
      "json",
      z.object({
        filePath: z.string(),
        fileType: z.string(),
      })
    ),
    async (c) => {
      const { filePath, fileType } = c.req.valid("json");
      const { userId } = await auth();

      if (!userId) return c.json({ error: "Unauthorized" }, 401);

      const url = await getUploadUrl(filePath, fileType);
      return c.json({ url });
    }
  )
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const { userId } = await auth();

    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });

    if (!doc) return c.json({ error: "Not found" }, 404);

    // Fetch comments
    const docComments = await db.query.comments.findMany({
      where: eq(comments.documentId, id),
      orderBy: [desc(comments.createdAt)],
      with: {
        user: true,
      },
    });

    // Fetch user vote
    let userVote: 1 | -1 | null = null;
    if (userId) {
      const vote = await db.query.documentVotes.findFirst({
        where: and(
          eq(documentVotes.documentId, id),
          eq(documentVotes.userId, userId)
        ),
      });
      if (vote) userVote = vote.voteType as 1 | -1;
    }

    // Fetch bookmark status
    let isBookmarked = false;
    if (userId) {
      const bookmark = await db.query.bookmarks.findFirst({
        where: and(eq(bookmarks.documentId, id), eq(bookmarks.userId, userId)),
      });
      if (bookmark) isBookmarked = true;
    }

    const signedUrl = await getFileUrl(doc.filePath);

    return c.json({ doc, docComments, userVote, isBookmarked, signedUrl });
  })
  .delete(
    "/:id",
    zValidator("json", z.object({ filePath: z.string().optional() })),
    async (c) => {
      const id = c.req.param("id");
      const { userId } = await auth();

      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const { filePath } = c.req.valid("json");

      // 1. Verify Ownership
      const doc = await db.query.documents.findFirst({
        where: eq(documents.id, id),
        columns: { userId: true },
      });

      if (!doc || doc.userId !== userId) {
        return c.json({ error: "Forbidden" }, 403);
      }

      // 2. Delete from Storage
      if (filePath) {
        try {
          await deleteFile(filePath);
        } catch (error) {
          console.error("Storage delete error:", error);
        }
      }

      // 3. Delete from DB & Revert Reputation
      await db.transaction(async (tx) => {
        const targetDoc = await tx.query.documents.findFirst({
          where: eq(documents.id, id),
        });
        if (!targetDoc) return;

        const viewRep = Math.floor((targetDoc.viewCount || 0) / 10);
        const voteRep =
          (targetDoc.upvoteCount || 0) * 1 +
          (targetDoc.downvoteCount || 0) * -1;
        const totalRepToRemove = 10 + viewRep + voteRep; // 10 for upload

        // Deduct Rep from User
        await tx
          .update(users)
          .set({
            reputationScore: sql`${users.reputationScore} - ${totalRepToRemove}`,
            totalViews: sql`${users.totalViews} - ${targetDoc.viewCount || 0}`,
            totalUpvotes: sql`${users.totalUpvotes} - ${
              targetDoc.upvoteCount || 0
            }`,
            totalDownvotes: sql`${users.totalDownvotes} - ${
              targetDoc.downvoteCount || 0
            }`,
          })
          .where(eq(users.id, userId));

        // Delete Document
        await tx.delete(documents).where(eq(documents.id, id));
      });

      return c.json({ success: true });
    }
  )
  .patch(
    "/:id",
    zValidator(
      "json",
      z.object({
        title: z.string(),
        subject: z.string(),
      })
    ),
    async (c) => {
      const id = c.req.param("id");
      const { title, subject } = c.req.valid("json");
      const { userId } = await auth();

      if (!userId) return c.json({ error: "Unauthorized" }, 401);

      // Verify Ownership
      const doc = await db.query.documents.findFirst({
        where: eq(documents.id, id),
        columns: { userId: true },
      });

      if (!doc || doc.userId !== userId) {
        return c.json({ error: "Forbidden" }, 403);
      }

      await db
        .update(documents)
        .set({ title, subject })
        .where(eq(documents.id, id));

      return c.json({ success: true });
    }
  )
  .post("/:id/view", async (c) => {
    const documentId = c.req.param("id");
    const user = await currentUser();
    const userId = user?.id;

    await db.transaction(async (tx) => {
      const [updatedDoc] = await tx
        .update(documents)
        .set({
          viewCount: sql`${documents.viewCount} + 1`,
        })
        .where(eq(documents.id, documentId))
        .returning({
          userId: documents.userId,
          viewCount: documents.viewCount,
        });

      if (!updatedDoc) return;

      if (updatedDoc.userId) {
        const ownerExists = await tx.query.users.findFirst({
          where: eq(users.id, updatedDoc.userId),
          columns: { id: true },
        });

        if (ownerExists) {
          // Check if we crossed a 10-view threshold
          // If (newCount % 10 === 0), add +1
          // We can't easily check "previous" count in SQL alone cleanly without fetching,
          // but we returned the doc. updatedDoc has the NEW viewCount.
          const newViews = updatedDoc.viewCount || 0;
          const shouldIncrementRep = newViews > 0 && newViews % 10 === 0;

          await tx
            .update(users)
            .set({
              totalViews: sql`${users.totalViews} + 1`,
              reputationScore: shouldIncrementRep
                ? sql`${users.reputationScore} + 1`
                : undefined,
            })
            .where(eq(users.id, updatedDoc.userId));
        }
      }

      if (userId) {
        await tx
          .insert(documentAccessLogs)
          .values({
            userId: userId,
            documentId: documentId,
            accessedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [documentAccessLogs.userId, documentAccessLogs.documentId],
            set: { accessedAt: new Date() },
          });
      }
    });

    return c.json({ success: true });
  })
  .post(
    "/:id/log-time",
    zValidator("json", z.object({ seconds: z.number() })),
    async (c) => {
      const documentId = c.req.param("id");
      const { seconds } = c.req.valid("json");
      const user = await currentUser();

      if (!user) return c.json({ error: "Unauthorized" }, 401);

      // Ensure user exists (sync)
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

      await db
        .insert(documentAccessLogs)
        .values({
          userId: user.id,
          documentId,
          timeSpentSeconds: seconds,
          accessedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [documentAccessLogs.userId, documentAccessLogs.documentId],
          set: {
            timeSpentSeconds: sql`${documentAccessLogs.timeSpentSeconds} + ${seconds}`,
            accessedAt: new Date(),
          },
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
      const documentId = c.req.param("id");
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
        const existingVote = await tx.query.documentVotes.findFirst({
          where: and(
            eq(documentVotes.documentId, documentId),
            eq(documentVotes.userId, userId)
          ),
        });

        const doc = await tx.query.documents.findFirst({
          where: eq(documents.id, documentId),
          columns: { userId: true },
        });
        if (!doc) throw new Error("Document not found");
        const ownerId = doc.userId;

        if (existingVote && existingVote.voteType === voteType) {
          // TOGGLE OFF
          await tx
            .delete(documentVotes)
            .where(
              and(
                eq(documentVotes.documentId, documentId),
                eq(documentVotes.userId, userId)
              )
            );

          if (voteType === 1) {
            // Removing Upvote (+1) -> -1 Rep
            await tx
              .update(documents)
              .set({ upvoteCount: sql`${documents.upvoteCount} - 1` })
              .where(eq(documents.id, documentId));
            if (ownerId && ownerId !== userId) {
              await tx
                .update(users)
                .set({
                  totalUpvotes: sql`${users.totalUpvotes} - 1`,
                  reputationScore: sql`${users.reputationScore} - 1`,
                })
                .where(eq(users.id, ownerId));
            }
          } else {
            // Removing Downvote (-1) -> +1 Rep
            await tx
              .update(documents)
              .set({ downvoteCount: sql`${documents.downvoteCount} - 1` })
              .where(eq(documents.id, documentId));
            if (ownerId && ownerId !== userId) {
              await tx
                .update(users)
                .set({
                  totalDownvotes: sql`${users.totalDownvotes} - 1`,
                  reputationScore: sql`${users.reputationScore} + 1`,
                })
                .where(eq(users.id, ownerId));
            }
          }
        } else if (existingVote && existingVote.voteType !== voteType) {
          // CHANGE VOTE
          await tx
            .update(documentVotes)
            .set({ voteType: voteType })
            .where(
              and(
                eq(documentVotes.documentId, documentId),
                eq(documentVotes.userId, userId)
              )
            );

          if (voteType === 1) {
            // Changing Down (-1) to Up (+1) -> +2 Rep
            await tx
              .update(documents)
              .set({
                downvoteCount: sql`${documents.downvoteCount} - 1`,
                upvoteCount: sql`${documents.upvoteCount} + 1`,
              })
              .where(eq(documents.id, documentId));
            if (ownerId && ownerId !== userId) {
              await tx
                .update(users)
                .set({
                  totalDownvotes: sql`${users.totalDownvotes} - 1`,
                  totalUpvotes: sql`${users.totalUpvotes} + 1`,
                  reputationScore: sql`${users.reputationScore} + 2`,
                })
                .where(eq(users.id, ownerId));
            }
          } else {
            // Changing Up (+1) to Down (-1) -> -2 Rep
            await tx
              .update(documents)
              .set({
                upvoteCount: sql`${documents.upvoteCount} - 1`,
                downvoteCount: sql`${documents.downvoteCount} + 1`,
              })
              .where(eq(documents.id, documentId));
            if (ownerId && ownerId !== userId) {
              await tx
                .update(users)
                .set({
                  totalUpvotes: sql`${users.totalUpvotes} - 1`,
                  totalDownvotes: sql`${users.totalDownvotes} + 1`,
                  reputationScore: sql`${users.reputationScore} - 2`,
                })
                .where(eq(users.id, ownerId));
            }
          }
        } else {
          // NEW VOTE
          await tx.insert(documentVotes).values({
            userId,
            documentId,
            voteType,
          });

          if (voteType === 1) {
            // New Upvote -> +1 Rep
            await tx
              .update(documents)
              .set({ upvoteCount: sql`${documents.upvoteCount} + 1` })
              .where(eq(documents.id, documentId));
            if (ownerId && ownerId !== userId) {
              await tx
                .update(users)
                .set({
                  totalUpvotes: sql`${users.totalUpvotes} + 1`,
                  reputationScore: sql`${users.reputationScore} + 1`,
                })
                .where(eq(users.id, ownerId));
            }
          } else {
            // New Downvote -> -1 Rep
            await tx
              .update(documents)
              .set({ downvoteCount: sql`${documents.downvoteCount} + 1` })
              .where(eq(documents.id, documentId));
            if (ownerId && ownerId !== userId) {
              await tx
                .update(users)
                .set({
                  totalDownvotes: sql`${users.totalDownvotes} + 1`,
                  reputationScore: sql`${users.reputationScore} - 1`,
                })
                .where(eq(users.id, ownerId));
            }
          }
        }
      });

      return c.json({ success: true });
    }
  );

export default app;
