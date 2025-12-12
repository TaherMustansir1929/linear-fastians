"use client";

import { useState } from "react";
import { Document, SUBJECTS, Subject } from "@/types";
import { useUpdateDocument } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Pencil } from "lucide-react";

interface EditDocumentDrawerProps {
  document: Document;
}

export function EditDocumentDrawer({ document }: EditDocumentDrawerProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(document.title);
  const [subject, setSubject] = useState(document.subject);
  const { mutate: updateDocument, isPending } = useUpdateDocument();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDocument(
      {
        id: document.id,
        title,
        subject,
      },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Pencil className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Edit Document</DrawerTitle>
            <DrawerDescription>
              Make changes to your document details.
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                onValueChange={(val) => setSubject(val as Subject)}
                value={subject}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer"
              >
                Save Changes
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="cursor-pointer">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
