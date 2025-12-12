"use client";

import React, { useState } from "react";
import { Document, Subject } from "@/types";
import {
  Files,
  FolderItem,
  FolderTrigger,
  FolderPanel,
  FileItem,
  SubFiles,
} from "./animate-ui/components/base/files";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import {
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  Trash2,
  Pencil,
} from "lucide-react";
import { EditDocumentDrawer } from "./EditDocumentDrawer";
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
import { useDeleteDocument } from "@/hooks/useDocuments";

interface SubjectFolderViewProps {
  documents: Document[];
  title: string;
  isBookmarkView?: boolean;
}

export function SubjectFolderView({
  documents,
  title,
  isBookmarkView = false,
}: SubjectFolderViewProps) {
  const router = useRouter();
  const { mutate: deleteDocument } = useDeleteDocument();

  // Group docs by subject
  const docsBySubject = documents.reduce((acc, doc) => {
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No documents found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <div className="rounded-2xl border bg-background overflow-hidden p-4">
        <Files className="w-full" defaultOpen={subjects}>
          {subjects.map((sub) => (
            <FolderItem key={sub} value={sub}>
              <FolderTrigger className="capitalize">{sub}</FolderTrigger>
              <FolderPanel>
                <SubFiles>
                  {docsBySubject[sub].map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleFileClick(doc.id)}
                      className="cursor-pointer"
                    >
                      <FileItem
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
                                      onClick={(e) => handleDelete(e, doc)}
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
        </Files>
      </div>
    </div>
  );
}
