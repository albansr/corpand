import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, AWS_BUCKET_NAME, AWS_FOLDER_PREFIX } from './aws-config';

/**
 * Build a cloud storage path (S3 key) under this app's folder prefix.
 * Valuation documents are stored under `uploads/valuations/`.
 */
export function buildStoragePath(fileName: string, subdir = 'uploads/valuations'): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${AWS_FOLDER_PREFIX}${subdir}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
}

/**
 * Generate a presigned URL the browser can PUT a file to directly.
 * Documents here are PRIVATE (no ContentDisposition set).
 */
export async function generatePresignedUploadUrl(
  cloudStoragePath: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: cloudStoragePath,
    ContentType: contentType || 'application/octet-stream',
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Generate a short-lived signed URL to read a private object.
 */
export async function getSignedDownloadUrl(
  cloudStoragePath: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: cloudStoragePath,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Fetch the raw bytes of a private object (server-side, for AI processing).
 */
export async function getObjectBuffer(cloudStoragePath: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: cloudStoragePath,
  });
  const response = await s3Client.send(command);
  const stream = response.Body as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function deleteFile(cloudStoragePath: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: cloudStoragePath,
  });
  await s3Client.send(command);
}
