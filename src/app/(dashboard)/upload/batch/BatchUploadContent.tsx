"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SUBJECTS,
  Subject,
  DOCUMENT_CATEGORIES,
  DocumentCategory,
} from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Upload } from "lucide-react";
import { uploadFile } from "@/hooks/useDocuments";
import { mapLimit } from "@/lib/concurrency";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

interface BatchFile {
  file: File;
  title: string;
  subject: Subject | "";
  category: DocumentCategory;
  status: "pending" | "uploading" | "completed" | "error";
}

export default function BatchUploadContent() {
  const { user } = useUser();
  const router = useRouter();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: BatchFile[] = Array.from(e.target.files).map((file) => ({
        file,
        title: file.name.split(".").slice(0, -1).join("."), // Auto title
        subject: "",
        category: "Notes",
        status: "pending" as const,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileMeta = (
    index: number,
    field: "title" | "subject" | "category",
    value: string
  ) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  const uploadAll = async () => {
    // Validation
    const invalidFile = files.find((f) => !f.title || !f.subject);
    if (invalidFile) {
      toast.error("Please complete title and subject for all files.");
      return;
    }
    if (!user) return;

    setIsUploading(true);
    setProgress(0);
    let completedCount = 0;

    try {
      await mapLimit(files, 3, async (batchFile) => {
        try {
          await uploadFile({
            file: batchFile.file,
            title: batchFile.title,
            subject: batchFile.subject as Subject,
            category: batchFile.category,

            userFullName: user.fullName || user.username || "Anonymous",
            userAvatar: user.imageUrl,
          });
          completedCount++;
          setProgress((completedCount / files.length) * 100);
        } catch (e) {
          console.error(e);
          toast.error(`Failed to upload ${batchFile.file.name}`);
          throw e;
        }
      });

      toast.success("Batch upload completed!");
      router.push("/dashboard");
    } catch (e) {
      toast.error("Some uploads failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Upload Files</h1>

      <div className="mb-8 p-8 border-2 border-dashed rounded-lg text-center bg-muted/20">
        <Input
          type="file"
          multiple
          accept=".pdf,.md,.markdown,.html,.htm,.txt,.tex,.latex"
          onChange={handleFileSelect}
          className="hidden"
          id="batch-input"
          disabled={isUploading}
        />
        <Label
          htmlFor="batch-input"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-lg font-medium">Click to select files</span>
          <span className="text-xs text-muted-foreground">
            PDF, Markdown, HTML, TXT, LaTeX supported
          </span>
        </Label>
      </div>

      {files.length > 0 && (
        <div className="space-y-4 mb-8">
          {files.map((file, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 min-w-0 grid gap-1">
                  <p className="font-medium truncate" title={file.file.name}>
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <div className="flex-1 w-full md:w-auto grid gap-2">
                  <Input
                    placeholder="Title"
                    value={file.title}
                    onChange={(e) =>
                      updateFileMeta(index, "title", e.target.value)
                    }
                    disabled={isUploading}
                  />
                </div>

                <div className="w-full md:w-32">
                  <Select
                    value={file.category}
                    onValueChange={(v) => updateFileMeta(index, "category", v)}
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-48">
                  <Select
                    value={file.subject}
                    onValueChange={(v) => updateFileMeta(index, "subject", v)}
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive cursor-pointer"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="sticky bottom-4 bg-background p-4 border rounded-lg shadow-lg flex flex-col gap-4">
          {isUploading && <Progress value={progress} />}
          <Button
            onClick={uploadAll}
            className="w-full cursor-pointer"
            disabled={isUploading}
          >
            {isUploading
              ? `Uploading... ${Math.round(progress)}%`
              : `Upload ${files.length} Documents`}
          </Button>
        </div>
      )}
    </div>
  );
}
