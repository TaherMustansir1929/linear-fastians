"use client";

import { useDocuments } from "@/hooks/useDocuments";
import { Document } from "@/types";
import { useQueryState } from "nuqs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileIcon, Heart, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function DocumentsTable() {
  const [subject] = useQueryState("subject");
  const [category] = useQueryState("category");
  const [search, setSearch] = useQueryState("search", {
    throttleMs: 300,
  });

  const { data: documents, isLoading } = useDocuments(
    undefined, // userId (all)
    subject || undefined,
    category || undefined,
    search || undefined,
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or uploader..."
          className="pl-9"
          value={search || ""}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !documents || documents.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border rounded-md">
          No documents found for this selection.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="">Date</TableHead>
                <TableHead className="">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc: Document) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-4 w-4 text-blue-500" />
                      <Link
                        href={`/documents/${doc.id}`}
                        className="hover:underline"
                      >
                        {doc.title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={"outline"}>{doc.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={doc.uploaderAvatar || undefined}
                          alt={doc.uploaderName || "User"}
                        />
                        <AvatarFallback>
                          {doc.uploaderName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {doc.uploaderName || "Anonymous"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span className="text-xs">{doc.upvoteCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span className="text-xs">{doc.viewCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Badge variant={"outline"}>
                      {doc.verificationStatus === "verified" ? (
                        <span className="text-green-600">Verified</span>
                      ) : doc.verificationStatus === "processing" ? (
                        <span className="text-gray-600">Processing</span>
                      ) : (
                        <span className="text-yellow-600">Unverified</span>
                      )}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
