/** Build 92 04.6: the owner's "…" menu. Copy table row "Owner menu". */
export const POST_MENU_WHO_SEES = "Who sees this";
export const POST_MENU_SHARE = "Share";
export const POST_MENU_DELETE = "Delete post";
export const POST_MENU_DELETE_NOTE =
  "Delete removes it from the feed only. The proof stays in your record and the day stays secured.";
export const POST_MENU_CANCEL = "Cancel";

/** Someone else's post. */
export const POST_MENU_REPORT = "Report";
export const POST_MENU_HIDE = "Hide post";

export const AUDIENCE_CHOICES = ["Friends", "Everyone", "Only me"] as const;
export const AUDIENCE_VALUES = ["friends", "everyone", "only_me"] as const;

/** Options for the owner's sheet, in order, with Cancel last. */
export function ownerMenuOptions(canRetarget: boolean): string[] {
  return canRetarget
    ? [POST_MENU_WHO_SEES, POST_MENU_SHARE, POST_MENU_DELETE, POST_MENU_CANCEL]
    : [POST_MENU_SHARE, POST_MENU_DELETE, POST_MENU_CANCEL];
}

export type OwnerMenuAction = "who_sees" | "share" | "delete" | null;

export function ownerMenuAction(canRetarget: boolean, index: number): OwnerMenuAction {
  const opts = ownerMenuOptions(canRetarget);
  const label = opts[index];
  if (label === POST_MENU_WHO_SEES) return "who_sees";
  if (label === POST_MENU_SHARE) return "share";
  if (label === POST_MENU_DELETE) return "delete";
  return null;
}
