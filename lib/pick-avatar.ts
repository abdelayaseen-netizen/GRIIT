import { Platform } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { pickProfilePhoto } from "@/lib/pick-profile-photo";

export type PickAvatarResult =
  | { status: "ok"; uri: string; mimeType?: string | null; fileName?: string | null }
  | { status: "cancelled" }
  | { status: "denied" };

/**
 * Circular 800×800 crop. Web falls back to expo-image-picker (no crop-picker).
 */
export async function pickAvatar(): Promise<PickAvatarResult> {
  if (Platform.OS === "web") return pickProfilePhoto();
  try {
    const image = await ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true,
      cropperCircleOverlay: true,
      mediaType: "photo",
      compressImageQuality: 0.8,
    });
    if (!image.path) return { status: "cancelled" };
    const uri = image.path.startsWith("file://") ? image.path : `file://${image.path}`;
    return {
      status: "ok",
      uri,
      mimeType: image.mime ?? null,
      fileName: image.filename ?? null,
    };
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: unknown }).code) : "";
    const msg = e instanceof Error ? e.message : "";
    if (code === "E_PICKER_CANCELLED" || /cancel/i.test(msg)) return { status: "cancelled" };
    if (/permission|denied|access/i.test(msg) || code === "E_NO_LIBRARY_PERMISSION") {
      return { status: "denied" };
    }
    throw e;
  }
}
