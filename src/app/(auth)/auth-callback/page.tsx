"use client";

import { client } from "@/lib/hono";
import { Alert } from "@/components/ui/alert";
import { SignOutButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { redirect } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function AuthCallbackPage() {
  // Server Component: Run sync (which creates user if missing)
  const { isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await client.api.users.me.$get();
      if (res.ok) {
        const { userId } = await res.json();
        if (userId) {
          // Successful sync/creation -> enter app
          redirect("/documents/me");
        }
      }
    },
  });

  if (!isLoading)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Loader className="size-32 animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Authenticating your account...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Alert className="size-32" />
        <p className="text-muted-foreground animate-pulse">
          Something went wrong. Please try again later.
        </p>
        <SignOutButton />
      </div>
    );
}
