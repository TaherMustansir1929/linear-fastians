import UserProfileContent from "./UserProfileContent";
import { userOptions } from "@/hooks/useUsers";
import { documentsOptions } from "@/hooks/useDocuments";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import GlobalLoader from "@/components/ui/global-loader";
import { Suspense } from "react";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserProfile({ params }: ProfilePageProps) {
  const { userId } = await params;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(userOptions(userId)),
    queryClient.prefetchQuery(documentsOptions(userId)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<GlobalLoader />}>
        <UserProfileContent userId={userId} />
      </Suspense>
    </HydrationBoundary>
  );
}
