import { PublicDocumentView } from "@/components/public/PublicDocumentView";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@/lib/hono";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { token } = await params;

  const res = await client.api.documents.public[":token"].$get({
    param: { token },
  });

  if (!res.ok) {
    return {
      title: "Document Not Found",
    };
  }

  const { doc } = await res.json();

  if (!doc) {
    return {
      title: "Document Not Found",
    };
  }

  return {
    title: `${doc.title} | Docs Share`,
    description: `View ${doc.title} - ${doc.subject} document shared by ${
      doc.uploader?.fullName || "a user"
    }.`,
    openGraph: {
      title: doc.title,
      description: `View ${doc.title} - ${doc.subject} document.`,
      type: "article",
    },
  };
}

export default async function PublicSharePage({ params }: PageProps) {
  const { token } = await params;

  // 1. Fetch document by token using Hono client
  const res = await client.api.documents.public[":token"].$get({
    param: { token },
  });

  if (!res.ok) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">Document Not Found</h1>
        <p className="text-muted-foreground">
          This link may be invalid or has expired.
        </p>
      </div>
    );
  }

  const { doc, signedUrl } = await res.json();

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">Document Not Found</h1>
        <p className="text-muted-foreground">
          This link may be invalid or has expired.
        </p>
      </div>
    );
  }

  // 2. Check if user is logged in
  const { userId } = await auth();

  // 3. If logged in, redirect to internal view
  if (userId) {
    redirect(`/documents/${doc.id}`);
  }

  return <PublicDocumentView doc={doc} signedUrl={signedUrl} />;
}
