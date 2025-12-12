"use client";

import { useDocuments } from "@/hooks/useDocuments";
import { useUser } from "@clerk/nextjs";
import { UploadModal } from "@/components/UploadModal";
import { SubjectFolderView } from "@/components/SubjectFolderView";

export default function Dashboard() {
  const { user } = useUser();
  const { data: documents, isLoading } = useDocuments(user?.id);

  if (!user) return <div className="text-center py-20">Please sign in.</div>;
  if (isLoading)
    return <div className="text-center py-20">Loading your documents...</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-end mb-4">
        <UploadModal />
      </div>

      <SubjectFolderView documents={documents || []} title="My Documents" />
    </div>
  );
}
