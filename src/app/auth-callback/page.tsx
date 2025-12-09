import { syncUser } from "@/app/actions";
import { Alert } from "@/components/ui/alert";
import { SignOutButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  // Server Component: Run sync (which creates user if missing)
  const userId = await syncUser();

  if (userId) {
    // Successful sync/creation -> enter app
    redirect("/documents/me");
  }

  // If sync fails (no user), redirect to sign-in or show error?
  // If userId is null, they aren't signed in.
  if (!userId) {
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

  // This part usually unreachable due to redirect, but good for react quirks
  // Render loading state while server action completes (streaming)
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <Loader className="size-32 animate-spin" />
      <p className="text-muted-foreground animate-pulse">
        Authenticating your account...
      </p>
    </div>
  );
}
