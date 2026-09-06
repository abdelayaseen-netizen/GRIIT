import * as ImagePicker from "expo-image-picker";

/**
 * iOS square cropper — same picker as the onboarding name-step.
 * `allowsEditing: true`, `aspect: [1, 1]`.
 */
export async function pickProfilePhoto(): Promise<
  | { status: "ok"; uri: string; mimeType?: string | null; fileName?: string | null }
  | { status: "cancelled" }
  | { status: "denied" }
> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { status: "denied" };
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]?.uri) return { status: "cancelled" };
  const asset = result.assets[0];
  return {
    status: "ok",
    uri: asset.uri,
    mimeType: asset.mimeType,
    fileName: asset.fileName,
  };
}
