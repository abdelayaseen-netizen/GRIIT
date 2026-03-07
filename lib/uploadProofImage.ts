/**
 * Upload a completion proof image to Supabase storage and return the public URL.
 * Used when a task requires photo proof (requires_photo_proof or photo task type).
 *
 * Requires a Supabase storage bucket named "proofs" with policy allowing
 * authenticated users to upload (e.g. INSERT for auth.uid()).
 */

import { supabase } from "@/lib/supabase";

const BUCKET = "proofs";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const UPLOAD_TIMEOUT_MS = 20000;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export type UploadProofResult = { url: string } | { error: string };

/**
 * Upload from base64 (e.g. from ImagePicker with base64: true).
 * contentType should be image/jpeg, image/png, or image/webp.
 */
export async function uploadProofImageFromBase64(
  base64: string,
  contentType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<UploadProofResult> {
  if (!base64 || base64.length === 0) {
    return { error: "No image data" };
  }
  const sizeEstimate = Math.ceil((base64.length * 3) / 4);
  if (sizeEstimate > MAX_SIZE_BYTES) {
    return { error: "Image is too large. Maximum size is 5MB." };
  }
  if (!ALLOWED_TYPES.includes(contentType)) {
    return { error: "Invalid file format. Use JPEG, PNG, or WebP." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return { error: "You must be signed in to upload" };
  }

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  let buffer: ArrayBuffer;
  try {
    buffer = base64ToArrayBuffer(base64);
  } catch {
    return { error: "Invalid image data" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    clearTimeout(timeout);
    if (error) {
      if (error.message?.includes("timeout") || error.message?.includes("abort")) {
        return { error: "Upload timed out. Please try again." };
      }
      if (error.message?.toLowerCase().includes("network")) {
        return { error: "Network error. Check your connection and try again." };
      }
      return { error: error.message || "Upload failed" };
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return { url: urlData.publicUrl };
  } catch (e: any) {
    clearTimeout(timeout);
    if (e?.name === "AbortError") return { error: "Upload timed out. Please try again." };
    return { error: e?.message || "Upload failed" };
  }
}

/**
 * Upload from a local file URI (e.g. from ImagePicker without base64).
 * Uses fetch to read the file; may not work on all React Native environments.
 * Prefer uploadProofImageFromBase64 when possible.
 */
export async function uploadProofImageFromUri(uri: string): Promise<UploadProofResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return { error: "You must be signed in to upload" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(uri, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return { error: "Could not read image file" };
    const blob = await response.blob();
    const contentType = blob.type || "image/jpeg";
    if (!ALLOWED_TYPES.includes(contentType)) {
      return { error: "Invalid file format. Use JPEG, PNG, or WebP." };
    }
    if (blob.size > MAX_SIZE_BYTES) {
      return { error: "Image is too large. Maximum size is 5MB." };
    }

    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType, upsert: false });

    if (error) {
      if (error.message?.toLowerCase().includes("network")) {
        return { error: "Network error. Check your connection and try again." };
      }
      return { error: error.message || "Upload failed" };
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return { url: urlData.publicUrl };
  } catch (e: any) {
    clearTimeout(timeout);
    if (e?.name === "AbortError") return { error: "Upload timed out. Please try again." };
    return { error: e?.message || "Network error. Please try again." };
  }
}
