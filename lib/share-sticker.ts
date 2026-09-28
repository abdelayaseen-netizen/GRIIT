/**
 * Frame 97–99 / v37.1 share stickers. Pure — no I/O.
 * Meta App ID is read from config only. Never hardcoded.
 */
export type StickerBackground = "clear" | "card" | "photo";
export type ProofKind = "camera" | "camera_place" | "self";
export type StickerVariant = "day" | "text" | "consistency" | "badge";
export type PhotoBackground = "ok" | "absent" | "private";

export const STICKER_W = 300;
export const FINISH_TEXT_CARD_H = 252;
export const STICKER_EXPORT_PX = 900;

export const SHARE_SHEET = "Share";
export const SHARE_BG_CLEAR = "Clear";
export const SHARE_BG_CARD = "Card";
export const SHARE_BG_PHOTO = "Photo";
export const SHARE_BG_ITEMS = [SHARE_BG_CLEAR, SHARE_BG_CARD, SHARE_BG_PHOTO] as const;
export const SHARE_CLEAR_CAPTION =
  "Clear is a transparent sticker. Lay it over your own photo in Instagram.";
export const SHARE_PHOTO_PRIVATE = "This photo is private, so it can't be used here.";
export const SHARE_STORY = "Instagram Story";
export const SHARE_COPY = "Copy";
export const SHARE_SAVE = "Save";
export const SHARE_MORE = "More";
export const SHARE_EMPTY = "Nothing to share yet.";
export const SHARE_EMPTY_HINT = "Secure one day and it can go here.";
export const STICKER_SECURED = "Secured.";
export const STICKER_SELF = "Self-reported";
export const STICKER_CAMERA = "Camera";
export const STICKER_CAMERA_PLACE = "Camera · Place";
export const STICKER_CONSISTENCY = "Consistency";
export const STICKER_ALL_SELF = "All self-reported";
export const STICKER_WORDMARK = "GRIIT";

export const BADGE_TIERS = [
  { count: 1, name: "First day", border: 1.5, rings: 0, fill: "none" as const },
  { count: 7, name: "One week", border: 2, rings: 1, fill: "none" as const },
  { count: 21, name: "Three weeks", border: 2.5, rings: 1, fill: "tint" as const },
  { count: 30, name: "Thirty", border: 3, rings: 2, fill: "tint" as const },
  { count: 75, name: "Seventy five", border: 3, rings: 2, fill: "solid" as const },
] as const;

/** SF Pro Display Heavy is wider: shrink the numeral, never wrap. */
export function fitNumeral(n: number): number {
  return n >= 100 ? 46 : n >= 10 ? 58 : 64;
}

export function proofLabel(proof: ProofKind): string {
  if (proof === "self") return STICKER_SELF;
  return proof === "camera_place" ? STICKER_CAMERA_PLACE : STICKER_CAMERA;
}

export function badgeTier(count: number): (typeof BADGE_TIERS)[number] {
  return BADGE_TIERS.find((b) => b.count === count) ?? BADGE_TIERS[0];
}

export function badgeHeadline(count: number): string {
  const name = badgeTier(count).name;
  return count === 1 ? `${name} secured day` : `${name} secured days`;
}

export function consistencyProofLine(args: { secured: number; cameraSecured: number }): string {
  if (args.cameraSecured <= 0) return STICKER_ALL_SELF;
  if (args.cameraSecured === args.secured) return `Camera, all ${args.secured}`;
  return `Camera, ${args.cameraSecured} of ${args.secured}`;
}

export function photoBackgroundAllowed(args: {
  hasPhoto: boolean;
  photoShared: boolean;
}): PhotoBackground {
  if (!args.hasPhoto) return "absent";
  if (!args.photoShared) return "private";
  return "ok";
}

export function stickerBackgrounds(photo: PhotoBackground): StickerBackground[] {
  if (photo === "absent") return ["clear", "card"];
  return ["clear", "card", "photo"];
}

export function defaultStickerBackground(photo: PhotoBackground): StickerBackground {
  return photo === "ok" ? "photo" : "card";
}

export function backgroundFromSegment(label: string): StickerBackground {
  if (label === SHARE_BG_PHOTO) return "photo";
  if (label === SHARE_BG_CLEAR) return "clear";
  return "card";
}

export function segmentFromBackground(bg: StickerBackground): string {
  if (bg === "photo") return SHARE_BG_PHOTO;
  if (bg === "clear") return SHARE_BG_CLEAR;
  return SHARE_BG_CARD;
}

export function dayStickerCaption(args: {
  challenge: string;
  day: number;
  durationDays: number;
}): string {
  return `${args.challenge} · Day ${args.day} of ${args.durationDays}`;
}

/**
 * Facebook / Meta App ID for Instagram Stories. Env or Expo extra only.
 * An empty string means Stories share falls back to the system sheet.
 */
export function facebookAppId(env: Record<string, string | undefined> = process.env as Record<
  string,
  string | undefined
>): string {
  return (env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? env.FACEBOOK_APP_ID ?? "").trim();
}

export function instagramStoriesUrl(args: {
  imageUri: string;
  asSticker?: boolean;
  appId?: string;
}): string {
  const params = new URLSearchParams();
  if (args.asSticker) params.set("stickerImage", args.imageUri);
  else params.set("backgroundImage", args.imageUri);
  const appId = (args.appId ?? "").trim();
  if (appId) params.set("source_application", appId);
  return `instagram-stories://share?${params.toString()}`;
}

/** Installed vs missing native modules for B4. Do not add packages here. */
export function shareNativeModules(deps: Record<string, string>): {
  viewShot: boolean;
  expoSharing: boolean;
  mediaLibrary: boolean;
  reactNativeShare: boolean;
} {
  return {
    viewShot: Boolean(deps["react-native-view-shot"]),
    expoSharing: Boolean(deps["expo-sharing"]),
    mediaLibrary: Boolean(deps["expo-media-library"]),
    reactNativeShare: Boolean(deps["react-native-share"]),
  };
}
