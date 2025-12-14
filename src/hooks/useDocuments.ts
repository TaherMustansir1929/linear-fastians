import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";

import { Document, Comment, FileType } from "@/types";
import { toast } from "sonner";
import { client } from "@/lib/hono";

export const documentsOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["documents", userId],
    queryFn: async () => {
      const res = await client.api.documents.$get({
        query: { userId: userId || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      return data as Document[];
    },
  });

export function useDocuments(userId?: string) {
  return useQuery(documentsOptions(userId));
}

export const documentOptions = (id: string) =>
  queryOptions({
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

// Deprecated or simple version
export function useDocument(id: string) {
  return useQuery(documentOptions(id));
}

export const documentDetailsOptions = (id: string) =>
  queryOptions({
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

export function useDocumentDetails(id: string) {
  return useQuery(documentDetailsOptions(id));
}

import { Subject } from "@/types";

interface UpdateVariables {
  id: string;
  title: string;
  subject: Subject;
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
  subject: Subject;
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

  // const userId = "temp"; // The backend determines exact path or we send only filename.
  // Actually, backend needs path to generate signed URL.
  // Let's generate a path here.
  // Sanitize function for S3 keys
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9-_]/g, "_");
  const cleanSubject = sanitize(subject);
  const cleanUser = sanitize(userFullName || "Anonymous");
  const cleanFileName = sanitize(file.name.split(".").slice(0, -1).join(".")); // Name without extension

  // Format: root/<subject>/<user>/<timestamp>_<filename>.<ext>
  const filePath = `root/${cleanSubject}/${cleanUser}/${Date.now()}_${cleanFileName}.${fileExt}`;

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
