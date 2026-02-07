import {
  pgTable,
  text,
  uuid,
  integer,
  timestamp,
  unique,
  check,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Matches Clerk user ID
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  role: text("role").default("Student"),
  reputationScore: integer("reputation_score").default(0),
  totalViews: integer("total_views").default(0),
  totalUpvotes: integer("total_upvotes").default(0),
  totalDownvotes: integer("total_downvotes").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const VerificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "processing",
  "verified",
]);

// 2. Documents Table
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(), // 'pdf', 'md', 'html', 'latex', 'txt'
  subject: text("subject").notNull(),
  category: text("category").default("Notes").notNull(),
  tags: text("tags").array(),
  userId: text("user_id").notNull(), // stored from Clerk
  uploaderName: text("uploader_name"),
  uploaderAvatar: text("uploader_avatar"),
  viewCount: integer("view_count").default(0),
  upvoteCount: integer("upvote_count").default(0),
  downvoteCount: integer("downvote_count").default(0),
  bookmarkCount: integer("bookmark_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`timezone('utc'::text, now())`)
    .notNull(),
  publicShareToken: text("public_share_token").unique(),
  verificationStatus: VerificationStatusEnum("verification_status").default(
    "unverified",
  ),
});

// 3. Document Votes Table
export const documentVotes = pgTable(
  "document_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    voteType: integer("vote_type").notNull(), // 1 for Up, -1 for Down
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueVote: unique().on(t.userId, t.documentId),
    voteTypeCheck: check("vote_type_check", sql`${t.voteType} IN (1, -1)`),
  }),
);

// 4. Comments Table
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  upvoteCount: integer("upvote_count").default(0),
  downvoteCount: integer("downvote_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 5. Comment Votes Table
export const commentVotes = pgTable(
  "comment_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    voteType: integer("vote_type").notNull(), // 1 or -1
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueCommentVote: unique().on(t.userId, t.commentId),
    voteTypeCheck: check("vote_type_check", sql`${t.voteType} IN (1, -1)`),
  }),
);

// 6. Bookmarks Table
export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueBookmark: unique().on(t.userId, t.documentId),
  }),
);

// 7. Document Access Logs Table
export const documentAccessLogs = pgTable(
  "document_access_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    timeSpentSeconds: integer("time_spent_seconds").default(0),
    accessedAt: timestamp("accessed_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueAccessLog: unique().on(t.userId, t.documentId),
  }),
);

// --- Relations ---

import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  comments: many(comments),
  accessLogs: many(documentAccessLogs),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  uploader: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  comments: many(comments),
  accessLogs: many(documentAccessLogs),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  document: one(documents, {
    fields: [comments.documentId],
    references: [documents.id],
  }),
}));

export const documentAccessLogsRelations = relations(
  documentAccessLogs,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentAccessLogs.documentId],
      references: [documents.id],
    }),
    user: one(users, {
      fields: [documentAccessLogs.userId],
      references: [users.id],
    }),
  }),
);
