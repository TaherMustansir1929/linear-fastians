import DashboardContent from "./DashboardContent";
import { auth } from "@clerk/nextjs/server";
import { dashboardOptions } from "@/hooks/useDashboard";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import GlobalLoader from "@/components/ui/global-loader";
import { Suspense } from "react";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    const showDummy = process.env.SHOW_DUMMY_METRICS === "true";
    if (!showDummy) {
      return <div className="p-8">Please sign in to view your dashboard.</div>;
    }
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(dashboardOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<GlobalLoader />}>
        <DashboardContent />
        {/* <GlobalLoader /> */}
      </Suspense>
    </HydrationBoundary>
  );
}
