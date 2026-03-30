import * as ImagePicker from "expo-image-picker";
import { DS_COLORS } from "@/lib/design-system";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { uploadAvatarFromUri } from "@/lib/uploadAvatar";
import { captureError } from "@/lib/sentry";

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

export type PickAvatarOutcome =
  | { status: "ok"; url: string }
  | { status: "cancelled" }
  | { status: "denied" }
  | { status: "failed"; message: string };

/**
 * Image picker + FormData upload to `avatars` + `profiles.update` with `avatar_url`.
 * Uses picker `mimeType` / `fileName` on native so Storage gets a correct Content-Type.
 */
export async function pickAndUploadAvatar(userId: string): Promise<PickAvatarOutcome> {
  if (!userId) return { status: "failed", message: "Not signed in." };

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.status !== "granted") {
    return { status: "denied" };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return { status: "cancelled" };
  }

  const asset = result.assets[0];
  const uri = asset.uri;
  const uploadResult = await uploadAvatarFromUri(uri, {
    mimeType: asset.mimeType,
    fileName: asset.fileName,
  });

  if ("error" in uploadResult) {
    return { status: "failed", message: uploadResult.error || "Upload failed." };
  }

  const baseUrl = uploadResult.url.split("?")[0];
  const publicUrl = `${baseUrl}?t=${Date.now()}`;

  try {
    await trpcMutate(TRPC.profiles.update, { avatar_url: publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not save profile.";
    captureError(e, "avatar profile update");
    return { status: "failed", message: msg };
  }

  return { status: "ok", url: publicUrl };
}
