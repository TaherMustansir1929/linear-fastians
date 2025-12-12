"use client";

import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/animate-ui/primitives/headless/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadDocument } from "@/hooks/useDocuments";
import { SUBJECTS, Subject } from "@/types";
import { useUser } from "@clerk/nextjs";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UploadModal() {
  const { user } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutate: uploadDocument, isPending } = useUploadDocument();

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject | "">("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Auto-fill title if empty
      if (!title) {
        const fileName = e.target.files[0].name
          .split(".")
          .slice(0, -1)
          .join(".");
        setTitle(fileName);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !subject || !user) return;

    uploadDocument(
      {
        file,
        title,
        subject,

        userFullName: user.fullName || user.username || "Anonymous",
        userAvatar: user.imageUrl,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setSubject("");
          setFile(null);
        },
      }
    );
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 cursor-pointer">
        <Upload className="h-4 w-4" />
        Upload Document
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/80" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="bg-background w-full max-w-[425px] rounded-xl border p-6 shadow-lg">
            <DialogHeader>
              <DialogTitle>Upload Study Material</DialogTitle>
              <DialogDescription className="text-xs">
                Share your notes, signals, or past papers with the class.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Calculus Final Review"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  onValueChange={(val) => setSubject(val as Subject)}
                  value={subject}
                  required
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((sub) => (
                      <SelectItem
                        key={sub}
                        value={sub}
                        className="cursor-pointer"
                      >
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.md,.markdown,.html,.htm,.txt,.tex,.latex"
                  required
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Note:{" "}
                  <span className="font-semibold text-foreground">
                    Markdown (.md)
                  </span>{" "}
                  format is preferred for best rendering experience, <br />
                  PDFs, LaTeX, TXT and HTML files are also supported.
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="cursor-pointer"
                >
                  {isPending ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
