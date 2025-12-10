import { Hono } from "hono";
import { db } from "@/db";
import { bookmarks, documents, users } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

const app = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        userId: z.string(),
      })
    ),
    async (c) => {
      const { userId } = c.req.valid("json");

      const userBookmarks = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.userId, userId)))
        .innerJoin(documents, eq(documents.id, bookmarks.documentId))
        .orderBy(desc(documents.createdAt));

      return c.json({ bookmarks: userBookmarks }, 200);
    }
  )
  .post("/:id/toggle", async (c) => {
    const documentId = c.req.param("id");
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

    const existing = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.documentId, documentId)
      ),
    });

    if (existing) {
      // Remove
      await db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.documentId, documentId)
          )
        );
      return c.json({ isBookmarked: false });
    } else {
      // Add
      await db.insert(bookmarks).values({
        userId,
        documentId,
      });
      return c.json({ isBookmarked: true });
    }
  });

export default app;
