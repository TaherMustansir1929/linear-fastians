"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDocuments } from "@/hooks/useDocuments";
import { SUBJECTS } from "@/types";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Eye,
  FileCode,
  FileText,
  FileType as FileTypeIcon,
  Search,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function DocumentList() {
  const { data: documents, isLoading } = useDocuments();
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [sortBy, setSortBy] = useState<"date" | "views" | "upvotes">("date");

  if (isLoading)
    return <div className="text-center py-20">Loading documents...</div>;

  // Filter first
  const filtered =
    documents?.filter((doc) => {
      const matchesSearch = doc.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesSubject = selectedSubject
        ? doc.subject === selectedSubject
        : true;
      return matchesSearch && matchesSubject;
    }) || [];

  // Then sort
  const sortedDocs = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortBy === "date") {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      diff = dateA - dateB;
    } else if (sortBy === "views") {
      diff = (a.viewCount || 0) - (b.viewCount || 0);
    } else if (sortBy === "upvotes") {
      diff = (a.upvoteCount || 0) - (b.upvoteCount || 0);
    }

    return sortOrder === "asc" ? diff : -diff;
  });

  // Group subjects for filter UI
  const subjects = Array.from(SUBJECTS);

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-10 w-10 text-red-500" />;
      case "md":
        return <FileCode className="h-10 w-10 text-blue-500" />;
      case "html":
        return <FileCode className="h-10 w-10 text-orange-500" />;
      case "latex":
        return (
          <div className="h-10 w-10 flex items-center justify-center font-bold text-green-600 border rounded">
            TeX
          </div>
        );
      default:
        return <FileTypeIcon className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex bg-muted rounded-md p-1 items-center shrink-0">
            <select
              className="bg-transparent text-sm px-2 py-1 outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "views" | "upvotes")
              }
            >
              <option value="date">Date</option>
              <option value="views">Views</option>
              <option value="upvotes">Upvotes</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              title={`Sort Order (${
                sortOrder === "asc" ? "Ascending" : "Descending"
              })`}
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Subject Filter */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-4 pt-2 px-1 scrollbar-hide mask-fade-sides">
          <Badge
            variant={selectedSubject === null ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap hover:scale-105 transition-transform"
            onClick={() => setSelectedSubject(null)}
          >
            All
          </Badge>
          {subjects.map((sub) => (
            <Badge
              key={sub}
              variant={selectedSubject === sub ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap hover:scale-105 transition-transform"
              onClick={() => setSelectedSubject(sub)}
            >
              {sub.split("(")[1]?.replace(")", "") || sub}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid */}
      {sortedDocs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No documents found. Be the first to upload one!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedDocs.map((doc) => (
            <Link href={`/documents/${doc.id}`} key={doc.id}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/50 active:scale-[0.98]">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    {getIcon(doc.fileType)}
                    <Badge variant="secondary" className="text-xs">
                      {doc.subject.split("(")[1]?.replace(")", "") || "Gen"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {doc.title}
                  </CardTitle>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-0">
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(doc.createdAt), "MMM d")}
                    </div>
                    <div className="flex items-center gap-1" title="Views">
                      <Eye className="h-3 w-3" />
                      {doc.viewCount || 0}
                    </div>
                    <div className="flex items-center gap-1" title="Upvotes">
                      <ThumbsUp className="h-3 w-3" />
                      {doc.upvoteCount || 0}
                    </div>
                  </div>
                  {doc.uploaderName && (
                    <div
                      className="flex items-center gap-2 w-full text-xs text-muted-foreground border-t pt-2 mt-2"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/users/${doc.userId}`;
                      }}
                    >
                      {doc.uploaderAvatar && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={doc.uploaderAvatar}
                          alt="Uploader Avatar"
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span className="hover:underline cursor-pointer truncate">
                        By {doc.uploaderName}
                      </span>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
