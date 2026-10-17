/**
 * Build 90 07.1: the one message a blocked public text field returns, named by field,
 * so the server can say *which* field and the client can put it under that field.
 * Shared by backend/lib/content-moderation.ts and the client forms. No imports.
 */

export const BLOCKED_FIELDS = [
  "username",
  "display name",
  "bio",
  "challenge title",
  "challenge description",
  "task title",
  "journal prompt",
  "location name",
  "routine",
  "caption",
  "comment",
] as const;

export type BlockedField = (typeof BLOCKED_FIELDS)[number];

/** Legacy generic message; kept for callers that do not name a field. */
export const BLOCKED_TEXT = "That isn't allowed. Try different words.";

const PREFIX = "Those words aren't allowed in a ";
const SUFFIX = ". Try different ones.";

export function blockedTextFor(field: BlockedField): string {
  return `${PREFIX}${field}${SUFFIX}`;
}

/** The field a server message names, or null when it is not a blocked-text message. */
export function blockedFieldFromMessage(message: string | null | undefined): BlockedField | null {
  if (!message || !message.startsWith(PREFIX) || !message.endsWith(SUFFIX)) return null;
  const field = message.slice(PREFIX.length, message.length - SUFFIX.length);
  return (BLOCKED_FIELDS as readonly string[]).includes(field) ? (field as BlockedField) : null;
}

/** True for the generic message or any field message. */
export function isBlockedTextMessage(message: string | null | undefined): boolean {
  return message === BLOCKED_TEXT || blockedFieldFromMessage(message) != null;
}
