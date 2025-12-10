import { Alert } from "@/components/ui/alert";
import { client } from "@/lib/hono";
import { SignOutButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { redirect } from "next/navigation";

import { headers } from "next/headers";

export default async function AuthCallbackPage() {
  const headersList = await headers();
  const res = await client.api.users.me.$get(undefined, {
    headers: {
      cookie: headersList.get("cookie") || "",
    },
  });
  if (res.ok) {
    const { userId } = await res.json();
    if (userId) {
      // Successful sync/creation -> enter app
      redirect("/documents/me");
    }
  } else {
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

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <Loader className="size-32 animate-spin" />
      <p className="text-muted-foreground animate-pulse">
        Authenticating your account...
      </p>
    </div>
  );
}
