/** Create writes PUBLIC | PRIVATE only. Group is always invite-only. */

export const VISIBILITY_PUBLIC_LABEL = "Anyone can find and join";
export const VISIBILITY_INVITE_LABEL = "Only people you invite";
export const VISIBILITY_PUBLIC_TITLE = "Anyone";
export const VISIBILITY_INVITE_TITLE = "Invite";
export const VISIBILITY_PUBLIC_CAPTION = "Shows on Discover. Anyone can join.";
export const VISIBILITY_INVITE_CAPTION =
  "Only people with your link can join. Check-ins show only to members.";
export const REVIEW_PHOTOS_LINE = "You choose Share or Keep for each one";

export type CreateVisibility = "PUBLIC" | "PRIVATE";

export function createVisibility(
  participationType: string | undefined,
  requested?: string | null,
): CreateVisibility {
  const pt = (participationType ?? "solo").toLowerCase();
  if (pt === "team") return "PRIVATE";
  const vis = String(requested ?? "PRIVATE").toUpperCase();
  return vis === "PUBLIC" ? "PUBLIC" : "PRIVATE";
}

/** @deprecated Use createVisibility. Kept so existing imports keep compiling. */
export function soloCreateVisibility(
  participationType: string | undefined,
  requested?: string | null,
): string {
  return createVisibility(participationType, requested);
}

export function visibilityLabel(visibility: string | null | undefined): string {
  return String(visibility ?? "").toUpperCase() === "PUBLIC"
    ? VISIBILITY_PUBLIC_LABEL
    : VISIBILITY_INVITE_LABEL;
}
