import { DocumentList } from "@/components/DocumentList";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Linear - Home",
  description:
    "Linear provides an obstacle-free learning experience. Upload and specific study materials for your university exams.",
};

export default function Home() {
  return (
    <main className="container mx-auto pb-12 px-4">
      <div className="relative mb-12 w-full flex flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:h-120 ">
        <BackgroundRippleEffect />
        <div className="relative z-20 text-center max-w-3xl mx-auto px-4 py-16 pointer-events-none">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
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
            Welcome to the new standard of sharing. Upload your study notes,
            past papers, and resources to help your classmates succeed. Browse
            the collection freely—view everything right here, no downloads
            required.
          </p>
        </div>
      </div>
      <DocumentList />
    </main>
  );
}
