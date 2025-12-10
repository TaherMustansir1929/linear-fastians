import { Hono } from "hono";
import { revalidatePath } from "next/cache";

const app = new Hono().post("/revalidate", async (c) => {
  const { path } = await c.req.json();
  if (!path) {
    return c.json({ error: "Missing path" }, 400);
  }

  // Note: revalidatePath might not work seamlessly in all Hono contexts if not handled correctly
  // but in Next.js App Router API routes it should work.
  try {
    revalidatePath(path);
    return c.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    console.error("Revalidation error:", error);
    return c.json({ revalidated: false, error: String(error) }, 500);
  }
});

export default app;
