/** Proof post card v4 — caption hard cap. */
export const PHOTO_CAPTION_MAX = 120 as const;

/** Clamp caption to the hard cap. Never returns a string longer than MAX. */
export function clampPhotoCaption(raw: string): string {
  return raw.slice(0, PHOTO_CAPTION_MAX);
}

/** Live counter label: "{n} / 120". */
export function formatPhotoCaptionCounter(length: number): string {
  const n = Math.min(Math.max(0, length), PHOTO_CAPTION_MAX);
  return `${n} / ${PHOTO_CAPTION_MAX}`;
}
