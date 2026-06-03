import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../env.js";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
  throw new Error("Missing Cloudflare R2 environment variables");
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const R2_BUCKET_NAME = bucketName;
export const R2_PUBLIC_URL = publicUrl;

/** URL foto untuk browser — lewat proxy API (hindari timeout r2.dev). */
export function buildFileUrl(key) {
  const base = env.API_PUBLIC_URL.replace(/\/$/, "");
  return `${base}/files/${key}`;
}

/** Ubah URL R2 lama di DB menjadi URL proxy. */
export function toProxiedFileUrl(url, key) {
  if (key) {
    return buildFileUrl(key);
  }

  if (url && url.includes(".r2.dev/")) {
    const extractedKey = url.split(".r2.dev/")[1];
    if (extractedKey) {
      return buildFileUrl(extractedKey);
    }
  }

  return url;
}

export async function uploadBufferToR2({ key, buffer, contentType }) {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return buildFileUrl(key);
}

export async function getObjectFromR2(key) {
  return r2.send(
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}

export async function deleteFromR2(key) {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}