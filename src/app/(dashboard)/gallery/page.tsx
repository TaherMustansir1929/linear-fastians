import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import Image from "next/image";
import { documentsOptions } from "@/hooks/useDocuments";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import GlobalLoader from "@/components/ui/global-loader";
import { Suspense } from "react";
import { GalleryContent } from "@/components/gallery/GalleryContent";

export const metadata = {
  title: "Linear - Gallery",
  description:
    "Linear provides an obstacle-free learning experience. Upload and specific study materials for your university exams.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const subject = searchParams.subject as string | undefined;
  const category = searchParams.category as string | undefined;

  const queryClient = new QueryClient();

  // Only prefetch if subject is selected, as that's when we show docs
  if (subject) {
    await queryClient.prefetchQuery(
      documentsOptions(undefined, subject, category)
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="container mx-auto pb-12 px-4">
        <Suspense fallback={<GlobalLoader />}>
          <GalleryContent />
        </Suspense>
      </main>
    </HydrationBoundary>
  );
}
