import { DocumentList } from "@/components/DocumentList";
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

export const metadata = {
  title: "Linear - Home",
  description:
    "Linear provides an obstacle-free learning experience. Upload and specific study materials for your university exams.",
};

export default async function Home() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(documentsOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="container mx-auto pb-12 px-4">
        <div className="relative mb-12 w-full flex flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:h-120 ">
          <BackgroundRippleEffect />
          <div className="relative z-20 text-center max-w-3xl mx-auto px-4 py-16 pointer-events-none">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              <Image
                src={"/icon.svg"}
                alt="Logo"
                width={40}
                height={40}
                className="mx-auto"
              />
              Linear
            </h1>
            <p className="text-2xl font-semibold mb-4 text-primary/80">
              Obstacle-free learning.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed dark:text-neutral-400">
              Welcome to the new standard of sharing. Browse the collection
              freely - view everything right here, no downloads required.
            </p>
          </div>
        </div>
        <Suspense fallback={<GlobalLoader />}>
          <DocumentList />
        </Suspense>
      </main>
    </HydrationBoundary>
  );
}
