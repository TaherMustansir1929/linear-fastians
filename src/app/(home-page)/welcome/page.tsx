import { MarkdownViewer } from "@/components/renderers/MarkdownViewer";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Download, Tag } from "lucide-react";
import Link from "next/link";
import fs from "fs";

export default function WelcomePage() {
  const doc = {
    title: "Welcome to Linear - the Docs Sharing App",
    subject: "Welcome",
    created_at: new Date("2025-12-08T21:21:46+05:00"),
  };

  const file = fs.readFileSync("public/WELCOME.md", "utf-8");

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {doc.subject}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(doc.created_at), "PPP")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        <MarkdownViewer content={file} />
      </div>
    </div>
  );
}
