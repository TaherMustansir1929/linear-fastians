import { cn } from "@/lib/utils";
import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import Image from "next/image";
import ClientLoader from "@/components/ui/client-loader";

export default function Page() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-24 px-4 bg-muted/10 min-h-screen"
      )}
    >
      <div className="mb-8 text-center">
        <Image
          src={"/icon.svg"}
          alt="logo"
          width={30}
          height={30}
          className="inline-block"
        />
        <h1 className="text-3xl font-bold">Linear</h1>
        <p className="text-muted-foreground">Prep for exams {"<together/>"}</p>
      </div>
      <ClerkLoading>
        <ClientLoader label="Loading sign in..." />
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn />
      </ClerkLoaded>
      <p className="text-muted-foreground text-sm mt-5">
        Make sure to sign-in with your <strong>NU</strong> email id
      </p>
    </div>
  );
}
