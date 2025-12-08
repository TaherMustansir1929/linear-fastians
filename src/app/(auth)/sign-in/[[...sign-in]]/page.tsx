import { cn } from "@/lib/utils";
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className={cn("flex flex-col items-center justify-center py-24 px-4 bg-muted/10")}>
      <div className="mb-8 text-center">
        <Image src={"/icon.svg"} alt="logo" width={30} height={30} className="inline-block"/>
        <h1 className="text-3xl font-bold">Linear</h1>
        <p className="text-muted-foreground">Prep for exams {"<together/>"}</p>
      </div>
      <SignIn />
    </div>
  );
}
