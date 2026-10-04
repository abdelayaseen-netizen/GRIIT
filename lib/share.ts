import { Share, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import RNShare, { Social } from "react-native-share";
import { challengeDeepLink, inviteDeepLink, profileDeepLink } from "@/lib/deep-links";
import { facebookAppId } from "@/lib/config";
import { instagramStoriesShareInput, type SavePhotosResult } from "@/lib/share-sticker";
import { trackEvent } from "@/lib/analytics";
import { groupInviteShareMessage } from "@/lib/group-ui";
import {
  challengeCompleteShareText,
  challengeShareText,
  defaultInviteShareText,
  profileShareText,
} from "@/lib/share-copy";

export {
  challengeCompleteShareText,
  challengeShareText,
  defaultInviteShareText,
  profileShareText,
} from "@/lib/share-copy";

async function shareOrCopy(message: string, title?: string, url?: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: title ?? "GRIIT", text: message });
      } else {
        await navigator.clipboard.writeText(message);
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError" && Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    return;
  }
  await Share.share(url ? { message, title: title ?? "GRIIT", url } : { message, title: title ?? "GRIIT" });
}

/** Invite-style share for leaderboards and similar (web + native). */
export async function shareInvite(message?: string, title?: string): Promise<void> {
  await shareOrCopy(message ?? defaultInviteShareText(), title ?? "Join GRIIT");
}

/** Arbitrary share text via the same path as other GRIIT shares. */
export async function sharePlainMessage(message: string, title?: string): Promise<void> {
  await shareOrCopy(message, title);
}

export async function shareChallenge(
  challenge: {
    name: string;
    duration: number;
    id: string;
    tasksPerDay?: number;
  },
  refUserId?: string | null
): Promise<void> {
  const url = challengeDeepLink(challenge.id, refUserId);
  await shareOrCopy(challengeShareText(challenge), challenge.name, url);
}

export async function inviteToChallenge(
  challenge: {
    name: string;
    id: string;
    inviteCode?: string;
  },
  refUserId?: string | null
): Promise<void> {
  const inviteCode = challenge.inviteCode ?? challenge.id;
  const url = inviteDeepLink(inviteCode, refUserId);
  await shareOrCopy(groupInviteShareMessage(challenge.name, inviteCode), "Join my challenge", url);
}

export async function shareProfile(
  profile: {
    username: string;
    streak: number;
    totalDaysSecured: number;
    tier: string;
  }
): Promise<void> {
  const url = profileDeepLink(profile.username);
  await shareOrCopy(profileShareText(profile), "My discipline stats", url);
}

/**
 * Share an image (e.g. captured ShareCard) via system share sheet.
 * Falls back to sharing message only if image share fails.
 */
export async function shareProgressImage(imageUri: string, message: string): Promise<void> {
  if (Platform.OS === "web") {
    await shareOrCopy(message, "GRIIT");
    return;
  }
  try {
    const available = await Sharing.isAvailableAsync();
    if (available) {
      await Sharing.shareAsync(imageUri, { mimeType: "image/png", dialogTitle: "Share your progress" });
      try {
        trackEvent("share_completed", { content_type: "proof_image" });
      } catch {
        /* non-fatal */
      }
    } else {
      await shareOrCopy(message, "GRIIT");
    }
  } catch {
    await shareOrCopy(message, "GRIIT");
  }
}

/**
 * Save the captured PNG to Photos. Add-only permission.
 * Denied does not throw — the sheet shows the Settings copy.
 */
/** PNG only on the pasteboard. Never a caption — Instagram would paste the text. */
export async function copyStickerPngToPasteboard(imageUri: string): Promise<void> {
  const raw = imageUri.trim();
  if (!raw) return;
  const base64 = raw.includes("base64,")
    ? raw.slice(raw.indexOf("base64,") + "base64,".length)
    : await FileSystem.readAsStringAsync(raw, { encoding: FileSystem.EncodingType.Base64 });
  await Clipboard.setImageAsync(base64);
}

export async function saveStickerToPhotos(imageUri: string): Promise<SavePhotosResult> {
  if (Platform.OS === "web") {
    return "denied";
  }
  try {
    const perm = await MediaLibrary.requestPermissionsAsync(true);
    if (perm.status !== "granted") {
      return "denied";
    }
    await MediaLibrary.saveToLibraryAsync(imageUri);
    return "saved";
  } catch {
    return "denied";
  }
}

/**
 * Instagram Stories via pasteboard (stickerImage / backgroundImage).
 * App ID from config only. Does not put the image in a URL.
 */
export async function shareToInstagramStory(
  imageUri: string,
  opts?: { asSticker?: boolean },
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }
  const input = instagramStoriesShareInput({
    imageUri,
    asSticker: opts?.asSticker === true,
    appId: facebookAppId(),
  });
  if (!input) return;
  try {
    await RNShare.shareSingle({
      social: Social.InstagramStories,
      appId: input.appId,
      stickerImage: input.stickerImage,
      backgroundImage: input.backgroundImage,
    });
    try {
      trackEvent("share_completed", { content_type: "instagram_story" });
    } catch {
      /* non-fatal */
    }
  } catch {
    /* Instagram missing or share cancelled — do not URL-pass the image. */
  }
}

export async function shareChallengeComplete(data: {
  name: string;
  duration: number;
  daysCompleted: number;
  isHardMode?: boolean;
}): Promise<void> {
  await shareOrCopy(challengeCompleteShareText(data), "Challenge Complete");
}
