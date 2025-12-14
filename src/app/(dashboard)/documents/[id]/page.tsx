import DocumentPageContent from "./DocumentPageContent";
import { documentDetailsOptions } from "@/hooks/useDocuments";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import GlobalLoader from "@/components/ui/global-loader";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(documentDetailsOptions(id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<GlobalLoader />}>
        <DocumentPageContent id={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
