import { DocumentList } from "@/components/DocumentList";
import { supabase } from "@/lib/supabase";
import { Document } from "@/types";

// Revalidate every 60 seconds (incremental static regeneration-like behavior)
export const revalidate = 60;

export default async function Home() {
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
          Study Materials
        </h1>
        <p className="text-muted-foreground">
          Access and share exam prep resources for your upcoming finals.
        </p>
      </div>
      <DocumentList initialDocuments={(documents as Document[]) || []} />
    </main>
  );
}
