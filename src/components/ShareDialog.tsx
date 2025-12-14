"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Share2, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";

interface ShareDialogProps {
  documentId: string;
}

export function ShareDialog({ documentId }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await client.api.documents[":id"].share.$post({
        param: { id: documentId },
      });
      if (!res.ok) {
        const error = await res.json();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        throw new Error(error.error || "Failed to generate link");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      if ("shareUrl" in data) {
        setLink(data.shareUrl);
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setIsOpen(false);
    },
  });

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && !link) {
      mutation.mutate();
    }
  };

  const copyToClipboard = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription className="text-xs">
            Anyone with this link can view this document
          </DialogDescription>
        </DialogHeader>

        {mutation.isPending ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input id="link" defaultValue={link} readOnly className="h-9" />
              </div>
              <Button
                type="submit"
                size="sm"
                className="px-3 cursor-pointer"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
