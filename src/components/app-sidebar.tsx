"use client";

import {
  Bookmark,
  Frame,
  LifeBuoy,
  PieChart,
  Send,
  SquareTerminal,
  Trophy,
  Upload,
  UsersRound,
} from "lucide-react";

import { NavDocuments } from "@/components/nav-main";
import { NavPages } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

const data = {
  navDocs: [
    {
      title: "My Documents",
      url: "/documents/me",
      icon: SquareTerminal,
      isActive: false,
      items: [],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/coming-soon",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/coming-soon",
      icon: Send,
    },
  ],
  pages: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
    },
    {
      name: "Gallery",
      url: "/gallery",
      icon: Frame,
    },
    {
      name: "Bookmarks",
      url: "/bookmarks",
      icon: Bookmark,
    },
    {
      name: "Community",
      url: "/coming-soon",
      icon: UsersRound,
    },
    {
      name: "Leaderboard",
      url: "/leaderboard",
      icon: Trophy,
    },
    {
      name: "Upload",
      url: "/upload/batch",
      icon: Upload,
    },
  ],
};

import { Document } from "@/types";
import Link from "next/link";

export function AppSidebar({
  userDocuments,
  bookmarkedDocuments,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  userDocuments?: Document[];
  bookmarkedDocuments?: Document[];
}) {
  const { user } = useUser();
  const documents = userDocuments || [];
  const bookmarks = bookmarkedDocuments || [];

  const navDocs = {
    ...data.navDocs[0],
    items: documents.map((doc) => ({
      title: doc.title,
      url: `/documents/${doc.id}`,
    })),
  };

  const navBookmarks = {
    title: "Bookmarks",
    url: "/bookmarks",
    icon: Bookmark,
    isActive: false,
    items: bookmarks.map((doc) => ({
      title: doc.title,
      url: `/documents/${doc.id}`,
    })),
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-10 items-center justify-center rounded-lg border border-border p-1">
                  <Image src={"/icon.svg"} alt="logo" width={36} height={36} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Linear</span>
                  <span className="truncate text-xs">Student</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavPages projects={data.pages} />
        <NavDocuments title="Documents" items={navDocs} />
        {bookmarks.length > 0 && <NavDocuments items={navBookmarks} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          name={(user?.firstName || "") + (user?.lastName || "")}
          email={user?.emailAddresses[0].emailAddress || ""}
          avatar={user?.imageUrl || ""}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
