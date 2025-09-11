import { promises as fs } from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const useS3 = !!(process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.S3_BUCKET);
let s3: S3Client | null = null;
if (useS3) {
  s3 = new S3Client({ region: process.env.AWS_REGION! });
}

export type StoredFile = { url: string; key: string };

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function saveBufferLocal(buffer: Buffer, folder: string, filename: string): Promise<StoredFile> {
  const relDir = path.join(folder);
  const absDir = path.join(process.cwd(), relDir);
  await ensureDir(absDir);
  const key = path.join(relDir, filename);
  const absPath = path.join(process.cwd(), key);
  await fs.writeFile(absPath, buffer);
  const url = `/${key.replace(/\\/g, "/")}`;
  return { url, key };
}

export async function saveBuffer(buffer: Buffer, contentType: string, folder: "uploads" | "reports", preferredName?: string): Promise<StoredFile> {
  const ext = contentType.split("/")[1] || "bin";
  const filename = `${preferredName || randomUUID()}.${ext}`;

  if (useS3 && s3) {
    const Bucket = process.env.S3_BUCKET!;
    const Key = `${folder}/${filename}`;
    await s3.send(
      new PutObjectCommand({ Bucket, Key, Body: buffer, ContentType: contentType, ACL: "public-read" as any })
    );
    const url = `https://${Bucket}.s3.amazonaws.com/${Key}`;
    return { url, key: Key };
  }

  return saveBufferLocal(buffer, folder, filename);
}
