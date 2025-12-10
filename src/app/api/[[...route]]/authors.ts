// authors.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono()
  .get("/", (c) => c.json("hello", 200))
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        email: z.string(),
      })
    ),
    async (c) => {
      const { name, email } = c.req.valid("json");

      return c.json({ name, email }, 201);
    }
  )
  .get("/:id", (c) => c.json(`get ${c.req.param("id")}`));

export default app;
