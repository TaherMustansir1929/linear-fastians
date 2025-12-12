import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Document, Comment, FileType } from "@/types";
import { toast } from "sonner";
import { client } from "@/lib/hono";

export function useDocuments(userId?: string) {
  return useQuery({
    queryKey: ["documents", userId],
    queryFn: async () => {
      const res = await client.api.documents.$get({
        query: { userId: userId || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      // API returns camelCase objects matching Document type (since we updated Document type)
      // Drizzle might return dates as strings in JSON? Yes.
      // Our Document type has createdAt: string. So this matches.
      return data as Document[];
    },
  });
}

// Deprecated or simple version
export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const res = await client.api.documents[":id"].$get({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to fetch document");
      const data = await res.json();
      return data.doc as Document;
    },
  });
}

export function useDocumentDetails(id: string) {
  return useQuery({
    queryKey: ["document-details", id],
    queryFn: async () => {
      const res = await client.api.documents[":id"].$get({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to fetch document details");
      const data = await res.json();
      // Ensure types match
      return {
        doc: data.doc as Document,
        docComments: data.docComments as Comment[],
        userVote: data.userVote as number | null,
        isBookmarked: data.isBookmarked as boolean,
        signedUrl: data.signedUrl as string,
      };
    },
  });
}

interface UpdateVariables {
  id: string;
  title: string;
  subject: string;
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title, subject }: UpdateVariables) => {
      const res = await client.api.documents[":id"].$patch({
        param: { id },
        json: { title, subject },
      });
      if (!res.ok) throw new Error("Failed to update");
      return await res.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document"] });
      queryClient.invalidateQueries({ queryKey: ["document-details"] });
      toast.success("Document updated");
    },
    onError: (e) => toast.error(e.message),
  });
}

interface UploadVariables {
  file: File;
  title: string;
  subject: string;
  userFullName?: string | null;
  userAvatar?: string | null;
}

export const uploadFile = async ({
  file,
  title,
  subject,
  userFullName,
  userAvatar,
}: UploadVariables) => {
  const fileExt = file.name.split(".").pop()?.toLowerCase() as string;
  let fileType: FileType = "txt";
  if (["pdf"].includes(fileExt)) fileType = "pdf";
  else if (["md", "markdown"].includes(fileExt)) fileType = "md";
  else if (["html", "htm"].includes(fileExt)) fileType = "html";
  else if (["tex", "latex"].includes(fileExt)) fileType = "latex";

  const userId = "temp"; // The backend determines exact path or we send only filename.
  // Actually, backend needs path to generate signed URL.
  // Let's generate a path here.
  const filePath = `${Date.now()}_${file.name}`;

  // 1. Get Presigned URL
  const urlRes = await client.api.documents["upload-url"].$post({
    json: { filePath, fileType },
  });

  if (!urlRes.ok) throw new Error("Failed to get upload URL");
  const { url } = await urlRes.json();

  // 2. Upload to S3
  const uploadRes = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  if (!uploadRes.ok) throw new Error("Failed to upload file to storage");

  // 3. Insert into DB via API
  const res = await client.api.documents.$post({
    json: {
      title,
      filePath,
      fileType: fileType as string,
      subject,
      uploaderName: userFullName || undefined,
      uploaderAvatar: userAvatar || undefined,
    },
  });

  if (!res.ok) throw new Error("Failed to create document record");
  return { title };
};

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadFile,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded successfully!");
      // window.location.reload();
    },
    onError: (error: Error) => {
      toast.error("Upload failed: " + error.message);
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      const res = await client.api.documents[":id"].$delete({
        param: { id },
        json: { filePath },
      });
      if (!res.ok) throw new Error("Failed to delete");
      return await res.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["userDocuments"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Document deleted.");
    },
    onError: (error: Error) => {
      toast.error("Delete failed: " + error.message);
    },
  });
}
