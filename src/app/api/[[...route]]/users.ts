import { Hono } from "hono";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { isEmailAllowed } from "@/lib/auth-config";

const app = new Hono()
  .get("/me", async (c) => {
    const user = await currentUser();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!isEmailAllowed(user.emailAddresses[0].emailAddress)) {
      return c.json({ error: "Invalid email id domain" }, 401);
    }

    // Upsert user
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

    return c.json({ userId: user.id });
  })
  .get("/leaderboard", async (c) => {
    const topUsers = await db.query.users.findMany({
      orderBy: [desc(users.reputationScore)],
      limit: 10,
    });
    return c.json(topUsers);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    if (!user) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json(user);
  });

export default app;
