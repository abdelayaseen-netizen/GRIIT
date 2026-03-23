/**
 * Upload a profile avatar to Supabase Storage `avatars` bucket (public).
 */
import { supabase } from "@/lib/supabase";

const BUCKET = "avatars";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export type UploadAvatarResult = { url: string } | { error: string };

export async function uploadAvatarFromUri(uri: string): Promise<UploadAvatarResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return { error: "You must be signed in to upload" };
  }

  try {
    const response = await fetch(uri);
    if (!response.ok) return { error: "Could not read image file" };
    const blob = await response.blob();
    const contentType = blob.type || "image/jpeg";
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      return { error: "Invalid file format. Use JPEG, PNG, or WebP." };
    }
    if (blob.size > MAX_SIZE_BYTES) {
      return { error: "Image is too large. Maximum size is 5MB." };
    }

    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const { data, error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType, upsert: false });
    if (error) {
      return { error: error.message || "Upload failed" };
    }
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return { url: urlData.publicUrl };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}
