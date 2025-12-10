import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { FileInput, FileText, User } from "lucide-react";
import Link from "next/link";

import { RemoveBookmarkButton } from "@/components/RemoveBookmarkButton";
import { db } from "@/db";
import { bookmarks as bookmarksSchema, documents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function BookmarksPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in.</div>;
  }

  const bookmarks = await db
    .select()
    .from(bookmarksSchema)
    .where(eq(bookmarksSchema.userId, userId))
    .innerJoin(documents, eq(documents.id, bookmarksSchema.documentId))
    .orderBy(desc(bookmarksSchema.createdAt));

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Bookmarked Documents</h1>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Uploaded By</TableHead> {/* New Column */}
              <TableHead>Saved On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookmarks && bookmarks.length > 0 ? (
              bookmarks.map((b) => (
                <TableRow key={b.bookmarks.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/documents/${b.documents.id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      {b.documents.title}
                    </Link>
                  </TableCell>
                  <TableCell>{b.documents.subject}</TableCell>
                  <TableCell>
                    {/* Display Uploader */}
                    <div className="flex items-center gap-2">
                      {/* Avatar could go here if available in uploader_avatar */}
                      <Link
                        href={`/profile/${b.documents.userId}`}
                        className="text-muted-foreground hover:text-black hover:underline"
                      >
                        <span className="text-sm flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {b.documents.uploaderName || "Unknown"}
                        </span>
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(b.bookmarks.createdAt!), "PPP")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-black"
                        title="Open Document"
                        asChild
                      >
                        <Link href={`/documents/${b.documents.id}`}>
                          <FileInput />
                        </Link>
                      </Button>
                      <RemoveBookmarkButton documentId={b.documents.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No bookmarks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
