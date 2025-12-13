"use client";

import { Button } from "@/components/animate-ui/components/buttons/button";
import { useDeleteDocument } from "@/hooks/useDocuments";
import { Document, Subject } from "@/types";
import { useRouter } from "next/navigation";
import React from "react";
import { EditDocumentDrawer } from "./EditDocumentDrawer";
import { UploadModal } from "./UploadModal";
import {
  FileItem,
  Files,
  FolderItem,
  FolderPanel,
  FolderTrigger,
  SubFiles,
} from "./animate-ui/components/base/files";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SubjectFolderViewProps {
  documents: Document[];
  title: string;
  isBookmarkView?: boolean;
  rootFolderName?: string;
}

export function SubjectFolderView({
  documents,
  title,
  isBookmarkView = false,
  rootFolderName = "Documents",
}: SubjectFolderViewProps) {
  const router = useRouter();
  const { mutate: deleteDocument } = useDeleteDocument();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter docs based on search query
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group docs by subject
  const docsBySubject = filteredDocuments.reduce((acc, doc) => {
    const sub = doc.subject;
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(doc);
    return acc;
  }, {} as Record<Subject, Document[]>);

  const subjects = Object.keys(docsBySubject) as Subject[];

  const handleFileClick = (docId: string) => {
    router.push(`/documents/${docId}`);
  };

  const handleDelete = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    deleteDocument({ id: doc.id, filePath: doc.filePath });
  };

  if (!documents || documents.length === 0) {
    return (
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold break-words">{title}</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto md:flex-1 md:justify-end">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {!(rootFolderName === "Bookmarks") && <UploadModal />}
          </div>
        </div>
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No documents found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold break-words">{title}</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto md:flex-1 md:justify-end">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!(rootFolderName === "Bookmarks") && <UploadModal />}
        </div>
      </div>
      <div className="rounded-2xl border bg-background overflow-hidden p-4">
        <Files className="w-full" defaultOpen={["root"]}>
          <FolderItem value="root">
            <FolderTrigger triggerClassName="pointer-events-none">
              {rootFolderName}
            </FolderTrigger>
            <FolderPanel>
              <SubFiles>
                {subjects.map((sub) => (
                  <FolderItem key={sub} value={sub}>
                    <FolderTrigger className="capitalize" subject={sub}>
                      {sub}
                    </FolderTrigger>
                    <FolderPanel>
                      <SubFiles>
                        {docsBySubject[sub].map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => handleFileClick(doc.id)}
                            className="cursor-pointer"
                          >
                            <FileItem
                              className="truncate"
                              actions={
                                !isBookmarkView && ( // Only show actions if not bookmarks view (unless we want remove bookmark logic here)
                                  <div className="flex items-center gap-1">
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <EditDocumentDrawer document={doc} />
                                    </div>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-destructive hover:text-destructive cursor-pointer"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Delete file?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="cursor-pointer">
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90 cursor-pointer"
                                            onClick={(e) =>
                                              handleDelete(e, doc)
                                            }
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                )
                              }
                            >
                              {doc.title}
                            </FileItem>
                          </div>
                        ))}
                        {docsBySubject[sub].length === 0 && (
                          <FolderItem value="empty">
                            <FolderTrigger className="italic text-muted-foreground">
                              Empty
                            </FolderTrigger>
                          </FolderItem>
                        )}
                      </SubFiles>
                    </FolderPanel>
                  </FolderItem>
                ))}
              </SubFiles>
            </FolderPanel>
          </FolderItem>
        </Files>
      </div>
    </div>
  );
}
