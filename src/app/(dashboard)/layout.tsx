import React from "react";
import { DashboardProvider } from "../../components/dashboard";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

import { Document } from "@/types";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();

  let documents: Document[] = [];
  let bookmarkedDocuments: Document[] = [];

  if (userId) {
    // Fetch User Docs
    const { data: userDocs } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    documents = (userDocs as Document[]) || [];

    // Fetch Bookmarks
    const { data: bookmarks } = await supabaseAdmin
      .from("bookmarks")
      .select("document:documents(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Transform for Sidebar
    bookmarkedDocuments =
      (bookmarks?.map((b: any) => b.document) as Document[]) || [];
  }

  return (
    <div>
      <DashboardProvider
        userDocuments={documents}
        bookmarkedDocuments={bookmarkedDocuments}
      >
        {children}
      </DashboardProvider>
    </div>
  );
};

export default DashboardLayout;
