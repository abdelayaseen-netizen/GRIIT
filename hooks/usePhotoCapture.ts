import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";
import { captureError } from "@/lib/sentry";
import {
  createCameraCaptureMeta,
  createLibraryCaptureMeta,
  isLibraryBlocked,
  type PhotoCaptureMeta,
} from "@/lib/photo-capture-meta";

interface UsePhotoCaptureOptions {
  requireCameraOnly: boolean;
  onError: (msg: string) => void;
}

interface UsePhotoCaptureReturn {
  photoUri: string | null;
  photoUrl: string | null;
  photoUploading: boolean;
  /** Local proof meta — shutter time + captured_in_app. Null until a capture succeeds. */
  captureMeta: PhotoCaptureMeta | null;
  handleTakePhoto: () => Promise<void>;
  handlePickImage: () => Promise<void>;
  clearPhoto: () => void;
}

export function usePhotoCapture({ requireCameraOnly, onError }: UsePhotoCaptureOptions): UsePhotoCaptureReturn {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [captureMeta, setCaptureMeta] = useState<PhotoCaptureMeta | null>(null);

  const upload = useCallback(async (
    asset: ImagePicker.ImagePickerAsset,
    meta: PhotoCaptureMeta
  ) => {
    setPhotoUri(asset.uri);
    setCaptureMeta(meta);
    setPhotoUploading(true);
    try {
      const contentType = asset.uri.toLowerCase().includes(".png") ? "image/png" : "image/jpeg";
      const result = await uploadProofImageFromBase64(asset.base64 ?? "", contentType);
      if ("error" in result) {
        onError(result.error);
        setPhotoUri(null);
        setCaptureMeta(null);
      } else {
        setPhotoUrl(result.url);
      }
    } catch (err) {
      captureError(err, "PhotoCaptureUpload");
      const detail = err instanceof Error ? err.message : String(err);
      onError(`Upload failed: ${detail.slice(0, 140)}`);
      setPhotoUri(null);
      setCaptureMeta(null);
    } finally {
      setPhotoUploading(false);
    }
  }, [onError]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        onError("Allow camera access to submit photo proof.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, base64: true });
      if (result.canceled || !result.assets[0]) return;
      if (!result.assets[0].base64 || result.assets[0].base64.length === 0) {
        onError("Camera returned no image data. Try again.");
        return;
      }
      // Record shutter time + in-app flag at successful camera return (before upload).
      const meta = createCameraCaptureMeta();
      await upload(result.assets[0], meta);
    } catch (err) {
      captureError(err, "PhotoCaptureTakePhoto");
      const detail = err instanceof Error ? err.message : String(err);
      onError(`Camera failed: ${detail.slice(0, 140)}`);
    }
  }, [onError, upload]);

  const handlePickImage = useCallback(async () => {
    if (isLibraryBlocked(requireCameraOnly)) {
      onError("This task requires a live camera photo. Use Take photo.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      onError("Allow gallery access to choose a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: false,
      base64: true,
      mediaTypes: ["images"],
    });
    if (result.canceled || !result.assets[0]) return;
    const meta = createLibraryCaptureMeta();
    await upload(result.assets[0], meta);
  }, [requireCameraOnly, onError, upload]);

  const clearPhoto = useCallback(() => {
    setPhotoUri(null);
    setPhotoUrl(null);
    setCaptureMeta(null);
  }, []);

  return { photoUri, photoUrl, photoUploading, captureMeta, handleTakePhoto, handlePickImage, clearPhoto };
}
