// lib/storage.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// This client works with MinIO, Supabase S3, AWS, or Cloudflare R2
const s3 = new S3Client({
  region: "auto", // MinIO and Supabase usually ignore this, but 'auto' or 'us-east-1' is safe
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // REQUIRED for MinIO and often helpful for self-hosted setups
});

export async function getUploadUrl(fileKey: string, fileType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  // Generates a temporary URL your frontend can upload to directly
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function getFileUrl(fileKey: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
  });

  // URL valid for 1 hour
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function deleteFile(fileKey: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
  });

  await s3.send(command);
}
