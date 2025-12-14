import LeaderboardContent from "./LeaderboardContent";
import { leaderboardOptions } from "@/hooks/useUsers";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import GlobalLoader from "@/components/ui/global-loader";
import { Suspense } from "react";

export default async function LeaderboardPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(leaderboardOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<GlobalLoader />}>
        <LeaderboardContent />
      </Suspense>
    </HydrationBoundary>
  );
}
