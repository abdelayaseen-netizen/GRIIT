/**
 * Upload a profile avatar to Supabase Storage `avatars` bucket (public).
 * Native: FormData + Storage REST API (reliable MIME types on iOS/Android).
 * Web: fetch(uri).blob() + supabase-js upload.
 */
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

const BUCKET = "avatars";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export type UploadAvatarResult = { url: string } | { error: string };

function inferExtAndMime(uri: string): { ext: string; mimeType: string } {
  const raw = uri.split(".").pop()?.toLowerCase().split("?")[0] || "jpg";
  const ext = raw === "jpeg" ? "jpg" : ["png", "webp", "jpg"].includes(raw) ? raw : "jpg";
  const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return { ext, mimeType };
}

/** Prefer `expo-image-picker` asset `mimeType` — file URIs often lack a reliable extension on device. */
function extAndMimeFromHints(
  uri: string,
  hints?: { mimeType?: string | null; fileName?: string | null }
): { ext: string; mimeType: string } {
  const m = hints?.mimeType?.trim().toLowerCase() ?? "";
  if (m === "image/png") return { ext: "png", mimeType: "image/png" };
  if (m === "image/webp") return { ext: "webp", mimeType: "image/webp" };
  if (m === "image/jpeg" || m === "image/jpg") return { ext: "jpg", mimeType: "image/jpeg" };
  const fn = hints?.fileName?.trim().toLowerCase() ?? "";
  if (fn.endsWith(".png")) return { ext: "png", mimeType: "image/png" };
  if (fn.endsWith(".webp")) return { ext: "webp", mimeType: "image/webp" };
  if (fn.endsWith(".jpg") || fn.endsWith(".jpeg")) return { ext: "jpg", mimeType: "image/jpeg" };
  return inferExtAndMime(uri);
}

async function uploadAvatarFromUriWeb(uri: string, userId: string): Promise<UploadAvatarResult> {
  try {
    const response = await fetch(uri);
    if (!response.ok) return { error: "Could not read image file" };
    const blob = await response.blob();
    let contentType = blob.type?.trim() || "";
    if (!contentType || contentType === "application/octet-stream" || contentType === "image/jpg") {
      const { mimeType } = inferExtAndMime(uri);
      contentType = mimeType;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      return { error: "Invalid file format. Use JPEG, PNG, or WebP." };
    }
    if (blob.size > MAX_SIZE_BYTES) {
      return { error: "Image is too large. Maximum size is 5MB." };
    }
    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/avatar.${ext}`;
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType, upsert: true });
    if (error) return { error: error.message || "Upload failed" };
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return { url: urlData.publicUrl };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

async function uploadAvatarFromUriNative(
  uri: string,
  userId: string,
  hints?: { mimeType?: string | null; fileName?: string | null }
): Promise<UploadAvatarResult> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { error: "You must be signed in to upload" };
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: "Missing Supabase configuration" };
  }

  const { ext, mimeType } = extAndMimeFromHints(uri, hints);
  const filePath = `${userId}/avatar.${ext}`;

  const formData = new FormData();
  formData.append("file", { uri, name: `avatar.${ext}`, type: mimeType } as unknown as Blob);

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET}/${filePath}`;

  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
        "x-upsert": "true",
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { error: errText || `Upload failed (${res.status})` };
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${filePath}`;
    return { url: publicUrl };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function uploadAvatarFromUri(
  uri: string,
  hints?: { mimeType?: string | null; fileName?: string | null }
): Promise<UploadAvatarResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return { error: "You must be signed in to upload" };
  }

  if (Platform.OS === "web") {
    return uploadAvatarFromUriWeb(uri, user.id);
  }
  return uploadAvatarFromUriNative(uri, user.id, hints);
}
