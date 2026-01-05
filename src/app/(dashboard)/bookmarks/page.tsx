import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookmarks as bookmarksSchema, documents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { SubjectFolderView } from "@/components/SubjectFolderView";
import { Document } from "@/types";

export default async function BookmarksPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in.</div>;
  }

  const fetchedBookmarks = await db
    .select()
    .from(bookmarksSchema)
    .where(eq(bookmarksSchema.userId, userId))
    .innerJoin(documents, eq(documents.id, bookmarksSchema.documentId))
    .orderBy(desc(bookmarksSchema.createdAt));

  // Transform to Document[]
  const docs: Document[] = fetchedBookmarks.map((b) => ({
    ...b.documents,
    fileType: b.documents.fileType as Document["fileType"],
    subject: b.documents.subject as Document["subject"],
    category: b.documents.category as Document["category"],
    createdAt: b.documents.createdAt.toISOString(),
    viewCount: b.documents.viewCount || 0,
    upvoteCount: b.documents.upvoteCount || 0,
    downvoteCount: b.documents.downvoteCount || 0,
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <SubjectFolderView
        documents={docs}
        title="Bookmarked Documents"
        isBookmarkView={true}
        rootFolderName="Bookmarks"
      />
    </div>
  );
}
