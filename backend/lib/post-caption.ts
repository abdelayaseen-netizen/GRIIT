/**
 * Build 92 12b.2: a post's caption is public, a journal or note is not. The caption travels as its own
 * field (`caption` on checkins.complete) and lives only in `activity_events.metadata.caption`. Notes
 * stay in `check_ins.note_text` and are never read for a post, so nothing saved before this is shown.
 */
import { blockedPlainText } from "./content-moderation";

/** The post sheet's limit (FINISH_COPY.captionMax); a test keeps the two equal. */
export const CAPTION_MAX = 120;

/** The trimmed caption to store, or null for none. */
export function captionToStore(raw: string | null | undefined): string | null {
  const text = (raw ?? "").trim();
  return text ? text.slice(0, CAPTION_MAX) : null;
}

/** "Those words aren't allowed in a caption. Try different ones." for a blocked caption, else null. */
export function captionBlock(raw: string | null | undefined): string | null {
  const text = captionToStore(raw);
  return text ? blockedPlainText(text, "caption") : null;
}

/** The caption a post shows: metadata.caption only, never a note. */
export function postCaptionFromMetadata(md: { caption?: unknown } | null | undefined): string | null {
  const value = md?.caption;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
