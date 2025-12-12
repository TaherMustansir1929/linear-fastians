"use client";

import { SubjectFolderView } from "@/components/SubjectFolderView";
import { useDocuments } from "@/hooks/useDocuments";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const { user } = useUser();
  const { data: documents, isLoading } = useDocuments(user?.id);

  if (!user) return <div className="text-center py-20">Please sign in.</div>;
  if (isLoading)
    return <div className="text-center py-20">Loading your documents...</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <SubjectFolderView documents={documents || []} title="My Documents" />
    </div>
  );
}
