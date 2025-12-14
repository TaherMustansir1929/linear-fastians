import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import ClientLoader from "@/components/ui/client-loader";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 bg-muted/10 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Linear</h1>
        <p className="text-muted-foreground">Join the study group.</p>
      </div>
      <ClerkLoading>
        <ClientLoader label="Loading sign up..." />
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp />
      </ClerkLoaded>
    </div>
  );
}
