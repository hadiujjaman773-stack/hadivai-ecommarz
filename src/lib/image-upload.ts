import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  isCloudflareUploadConfigured,
  uploadToCloudflareImages,
} from "@/lib/cloudflare-images";
import { isImgBbConfigured, uploadToImgBb } from "@/lib/imgbb";

function safeFilename(name: string): string {
  const ext = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const base = path
    .basename(name, path.extname(name))
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  return `${Date.now()}_${base || "image"}${ext || ".jpg"}`;
}

export async function uploadToLocalStorage(file: File, filename: string) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const safeName = safeFilename(filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, safeName), buffer);

  return {
    id: safeName,
    url: `/uploads/${safeName}`,
    provider: "local" as const,
  };
}

export type UploadResult = {
  id: string;
  url: string;
  provider: "imgbb" | "cloudflare" | "local";
};

/** ImgBB first, then Cloudflare if configured, otherwise public/uploads. */
export async function uploadImage(
  file: File,
  filename: string
): Promise<UploadResult> {
  if (isImgBbConfigured()) {
    return uploadToImgBb(file, filename);
  }
  if (isCloudflareUploadConfigured()) {
    return uploadToCloudflareImages(file, filename);
  }
  return uploadToLocalStorage(file, filename);
}

export function getUploadMode(): "imgbb" | "cloudflare" | "local" {
  if (isImgBbConfigured()) return "imgbb";
  return isCloudflareUploadConfigured() ? "cloudflare" : "local";
}
