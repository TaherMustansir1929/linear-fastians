"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";

import { Document } from "@/types";

export const DashboardProvider = ({
  children,
  userDocuments = [],
  bookmarkedDocuments = [],
}: {
  children: React.ReactNode;
  userDocuments?: Document[];
  bookmarkedDocuments?: Document[];
}) => {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <AppSidebar
        userDocuments={userDocuments}
        bookmarkedDocuments={bookmarkedDocuments}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {pathname
                  .split("/")
                  .filter(Boolean)
                  .map((segment, index, arr) => {
                    const href = `/${arr.slice(0, index + 1).join("/")}`;
                    const isLast = index === arr.length - 1;
                    const title =
                      segment.charAt(0).toUpperCase() + segment.slice(1);

                    return (
                      <React.Fragment key={href}>
                        <BreadcrumbItem className="hidden md:block">
                          {isLast ? (
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              href={href === "/documents" ? href + "/me" : href}
                            >
                              {title}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!isLast && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </React.Fragment>
                    );
                  })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};
