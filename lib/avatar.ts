import * as ImagePicker from "expo-image-picker";
import { DS_COLORS } from "@/lib/design-system";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { uploadAvatarFromUri } from "@/lib/uploadAvatar";

/** Deterministic avatar colors from user id (design tokens only). */
export const AVATAR_COLORS = [
  { bg: DS_COLORS.ACCENT_TINT, letter: DS_COLORS.DISCOVER_CORAL },
  { bg: DS_COLORS.GREEN_BG, letter: DS_COLORS.GREEN },
  { bg: DS_COLORS.purpleTintLight, letter: DS_COLORS.CATEGORY_MIND },
  { bg: DS_COLORS.DISCOVER_DIFF_TINT_MED, letter: DS_COLORS.DISCOVER_BLUE },
  { bg: DS_COLORS.difficultyMediumBg, letter: DS_COLORS.WARNING },
] as const;

export function getAvatarColor(userId: string): { bg: string; letter: string } {
  const idx = (userId.codePointAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] ?? AVATAR_COLORS[0];
}

/**
 * Image picker + upload to `avatars` bucket (upsert) + `profiles.avatar_url` update.
 * Returns public URL with cache-bust query, or null on cancel/deny/failure.
 */
export async function pickAndUploadAvatar(userId: string): Promise<string | null> {
  if (!userId) return null;
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  const uri = result.assets[0].uri;
  const uploadResult = await uploadAvatarFromUri(uri);
  if ("error" in uploadResult) {
    if (__DEV__) console.warn("[Avatar] Upload failed:", uploadResult.error);
    return null;
  }

  const baseUrl = uploadResult.url.split("?")[0];
  const publicUrl = `${baseUrl}?t=${Date.now()}`;

  try {
    await trpcMutate(TRPC.profiles.update, { avatar_url: publicUrl });
  } catch (e) {
    if (__DEV__) console.warn("[Avatar] Profile update failed:", e instanceof Error ? e.message : e);
    return null;
  }

  return publicUrl;
}
