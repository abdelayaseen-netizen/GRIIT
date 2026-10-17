/**
 * Build 90 07.3: report a comment. Same route family as a reported post
 * (`reports.reportUser` with the thing in `details`), and the comment is hidden for the
 * reporter at once. Pure helpers shared by the server route and the two comment lists;
 * the AsyncStorage side lives in lib/hidden-comments.ts.
 */

export const REPORT_COMMENT_LABEL = "Report comment";
export const CANCEL_REPORT_LABEL = "Cancel";
export const REPORT_COMMENT_PROMPT = "Report this comment?";
export const COMMENT_REPORTED = "Reported. The comment is hidden for you.";
export const COMMENT_REPORT_FAILED = "Couldn't send the report. Try again.";
export const OWN_COMMENT_REPORT = "You can't report your own comment.";

const DETAILS_PREFIX = "comment:";
const EXCERPT_MAX = 120;

/** `details` for user_reports: the comment id first, then a short excerpt for the moderator. */
export function commentReportDetails(commentId: string, text: string): string {
  const excerpt = text.replace(/\s+/g, " ").trim().slice(0, EXCERPT_MAX);
  return excerpt ? `${DETAILS_PREFIX}${commentId} ${excerpt}` : `${DETAILS_PREFIX}${commentId}`;
}

/** The comment id a `details` string names, or null for post and user reports. */
export function commentIdFromReportDetails(details: string | null | undefined): string | null {
  if (!details || !details.startsWith(DETAILS_PREFIX)) return null;
  const id = details.slice(DETAILS_PREFIX.length).split(" ")[0] ?? "";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null;
}

export function withoutComments<T extends { id: string }>(rows: readonly T[], hidden: ReadonlySet<string>): T[] {
  if (hidden.size === 0) return [...rows];
  return rows.filter((row) => !hidden.has(row.id));
}

/** What a long press on a comment offers: delete your own, report someone else's. */
export function commentLongPressAction(viewerId: string | null | undefined, authorId: string): "delete" | "report" | null {
  if (!viewerId) return null;
  return viewerId === authorId ? "delete" : "report";
}
