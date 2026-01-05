"use client";

import { SubjectList } from "./SubjectList";
import { CategoryList } from "./CategoryList";
import { DocumentsTable } from "./DocumentsTable";
import { useQueryState } from "nuqs";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { ChevronLeft } from "lucide-react";
import { BackgroundRippleEffect } from "../ui/background-ripple-effect";
import Image from "next/image";

export function GalleryContent() {
  const [subject, setSubject] = useQueryState("subject");

  if (!subject) {
    return (
      <div>
        <div className="relative mb-8 w-full flex flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:h-120 ">
          <BackgroundRippleEffect />
          <div className="relative z-20 text-center max-w-3xl mx-auto px-4 py-8 pointer-events-none">
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl mb-2 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Image src={"/icon.svg"} alt="Logo" width={40} height={40} />
              Linear
            </h1>
            <p className="text-xl font-semibold mb-2 text-primary/80">
              Obstacle-free learning.
            </p>
          </div>
        </div>
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Select a Subject
            </h2>
            <p className="text-muted-foreground">
              Choose a subject to view its materials.
            </p>
          </div>
          <SubjectList />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 cursor-pointer text-xs text-muted-foreground"
          onClick={() => setSubject(null)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Subjects
        </Button>
        <h2 className="text-2xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {subject}
        </h2>
      </div>

      <CategoryList />
      <DocumentsTable />
    </div>
  );
}
