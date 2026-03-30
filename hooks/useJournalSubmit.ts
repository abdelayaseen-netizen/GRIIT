import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";
type CompleteTaskFn = (args: {
  activeChallengeId: string;
  taskId: string;
  noteText: string;
  proofUrl?: string;
}) => Promise<unknown>;

export type JournalSubmitParams = {
  activeChallenge: { id: string };
  taskId: string;
  entryText: string;
  requirePhotoProof: boolean;
  photoUri: string | null;
  photoBase64: string | null;
  draftKey: string;
  completeTask: CompleteTaskFn;
  setUploading: (v: boolean) => void;
};

/** Uploads optional proof, completes the task, clears draft. Caller runs success animation. */
export async function submitJournalEntry(params: JournalSubmitParams): Promise<void> {
  const {
    activeChallenge,
    taskId,
    entryText,
    requirePhotoProof,
    photoUri,
    photoBase64,
    draftKey,
    completeTask,
    setUploading,
  } = params;

  let proofUrl: string | undefined;
  if (requirePhotoProof && (photoUri || photoBase64)) {
    setUploading(true);
    if (photoBase64) {
      const contentType = photoUri?.toLowerCase().includes(".png") ? "image/png" : "image/jpeg";
      const result = await uploadProofImageFromBase64(photoBase64, contentType);
      if ("error" in result) {
        setUploading(false);
        throw new Error(result.error);
      }
      proofUrl = result.url;
    } else if (photoUri) {
      const { uploadProofImageFromUri } = await import("@/lib/uploadProofImage");
      const result = await uploadProofImageFromUri(photoUri);
      if ("error" in result) {
        setUploading(false);
        throw new Error(result.error);
      }
      proofUrl = result.url;
    }
    setUploading(false);
  }

  await completeTask({
    activeChallengeId: activeChallenge.id,
    taskId,
    noteText: entryText.trim(),
    proofUrl,
  });

  await AsyncStorage.removeItem(draftKey);
}
