"use client";

import {
  Bookmark,
  Frame,
  Home,
  LifeBuoy,
  PieChart,
  Send,
  SquareTerminal,
  Trophy,
  Upload,
  UsersRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/animate-ui/components/radix/sidebar";
import { NavDocuments } from "@/components/nav-main";
import { NavPages } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

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
      name: "Community",
      url: "/community",
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

import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@/components/animate-ui/components/buttons/flip";
import { Document } from "@/types";
import {
  Spring,
  SpringElement,
  SpringProvider,
} from "./animate-ui/primitives/animate/spring";
import { Separator } from "./ui/separator";

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

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div>
                <FlipButton className="w-full">
                  <FlipButtonFront
                    className="w-full p-0 cursor-pointer"
                    variant={"ghost"}
                  >
                    <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-10 items-center justify-center rounded-lg border border-border p-1">
                      <Image
                        src={"/icon.svg"}
                        alt="logo"
                        width={36}
                        height={36}
                        draggable={false}
                      />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Linear</span>
                      <span className="truncate text-xs">Student</span>
                    </div>
                  </FlipButtonFront>
                  <FlipButtonBack
                    className="w-full p-0 cursor-pointer"
                    variant={"ghost"}
                    onClick={() => (window.location.pathname = "/")}
                  >
                    <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-10 items-center justify-center rounded-lg border border-border p-1">
                      <Image
                        src={"/icon.svg"}
                        alt="logo"
                        width={36}
                        height={36}
                        draggable={false}
                      />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium flex items-center gap-1">
                        <Home /> Home
                      </span>
                    </div>
                  </FlipButtonBack>
                </FlipButton>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <NavPages projects={data.pages} />
        <Separator />
        <NavDocuments
          title="My Documents"
          documents={documents}
          url="/documents/me"
          icon={SquareTerminal}
        />
        <Separator />
        <NavDocuments
          title="Bookmarks"
          documents={bookmarks}
          url="/bookmarks"
          icon={Bookmark}
        />
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
