"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Upload,
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
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
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
      icon: Map,
    },
    {
      name: "Upload",
      url: "/upload/batch",
      icon: Upload,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-accent text-sidebar-accent-foreground flex aspect-square size-10 items-center justify-center rounded-lg border border-border p-1">
                  <Image
                    src={"/icon.svg"}
                    alt="logo"
                    width={36}
                    height={36}
                    className=""
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Linear</span>
                  <span className="truncate text-xs">Student</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavPages projects={data.pages} />
        <NavDocuments items={data.navDocs} />
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
