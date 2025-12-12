"use client";

import { Document, Subject } from "@/types";
import {
  Files,
  FolderItem,
  FolderTrigger,
  FolderPanel,
  FileItem,
  SubFiles,
} from "./animate-ui/components/base/files";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChevronRight, LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export function NavDocuments({
  documents,
  title,
  url,
  icon: Icon,
}: {
  documents: Document[];
  title: string;
  url?: string;
  icon?: LucideIcon;
}) {
  const router = useRouter();

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

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Collapsible key={title} asChild defaultOpen={false}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={title}>
                <a href={url}>
                  {Icon && <Icon />}
                  <span>{title}</span>
                </a>
              </SidebarMenuButton>
              {subjects?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <Files className="w-full">
                        {subjects.map((sub) => (
                          <FolderItem key={sub} value={sub}>
                            <FolderTrigger className="capitalize pl-8">
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
                                    <FileItem className="pl-8">
                                      {doc.title}
                                    </FileItem>
                                  </div>
                                ))}
                              </SubFiles>
                            </FolderPanel>
                          </FolderItem>
                        ))}
                      </Files>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
