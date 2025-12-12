import React from "react";
import { DashboardProvider } from "../../components/dashboard";
import { auth } from "@clerk/nextjs/server";

import { Document } from "@/types";
import { db } from "@/db";
import { bookmarks, documents as documentsSchema } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();

  let documents: Document[] = [];
  let bookmarkedDocuments: Document[] = [];

  if (userId) {
    // Fetch User Docs
    const userDocs = await db
      .select()
      .from(documentsSchema)
      .where(eq(documentsSchema.userId, userId))
      .orderBy(desc(documentsSchema.createdAt));

    documents = userDocs.map((doc) => ({
      ...doc,
      fileType: doc.fileType as Document["fileType"],
      createdAt: doc.createdAt.toISOString(),
      subject: doc.subject as Document["subject"],
      viewCount: doc.viewCount || 0,
      upvoteCount: doc.upvoteCount || 0,
      downvoteCount: doc.downvoteCount || 0,
    }));

    // Fetch Bookmarks
    const fetchedBookmarks = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .innerJoin(documentsSchema, eq(documentsSchema.id, bookmarks.documentId))
      .orderBy(desc(bookmarks.createdAt));

    // Transform for Sidebar
    bookmarkedDocuments = fetchedBookmarks.map((b) => {
      return {
        id: b.documents.id,
        title: b.documents.title,
        filePath: b.documents.filePath,
        fileType: b.documents.fileType,
        subject: b.documents.subject as Document["subject"],
        tags: b.documents.tags,
        userId: b.documents.userId,
        uploaderName: b.documents.uploaderName,
        uploaderAvatar: b.documents.uploaderAvatar,
        createdAt:
          b.bookmarks.createdAt?.toISOString() || new Date().toISOString(),
        viewCount: b.documents.viewCount || 0,
        upvoteCount: b.documents.upvoteCount || 0,
        downvoteCount: b.documents.downvoteCount || 0,
      } as Document;
    });
  }

  return (
    <div>
      <DashboardProvider
        userDocuments={documents}
        bookmarkedDocuments={bookmarkedDocuments}
      >
        {children}
      </DashboardProvider>
    </div>
  );
};

export default DashboardLayout;
