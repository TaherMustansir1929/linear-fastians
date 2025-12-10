import { Hono } from "hono";
import { handle } from "hono/vercel";
import authors from "./authors";
import books from "./books";
import { HTTPException } from "hono/http-exception";

const app = new Hono().basePath("/api");

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json({ message: "Internal Server Error" }, 500);
});

import users from "./users";
import documents from "./documents";
import comments from "./comments";
import bookmarks from "./bookmarks";
import dashboard from "./dashboard";
import other from "./other";

const routes = app
  .route("/authors", authors)
  .route("/books", books)
  .route("/users", users)
  .route("/documents", documents)
  .route("/comments", comments)
  .route("/bookmarks", bookmarks)
  .route("/bookmarks", bookmarks)
  .route("/dashboard", dashboard)
  .route("/", other);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
