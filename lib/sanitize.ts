/**
 * Input sanitization for user-facing text. Strip HTML and enforce max length.
 */

const HTML_TAG_REGEX = /<[^>]*>/g;

/**
 * Strip HTML tags from a string. Use for challenge title, description, username, bio.
 */
export function stripHtml(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(HTML_TAG_REGEX, "").trim();
}

/** Max lengths for DB/API. Keep in sync with backend. */
export const MAX_LENGTHS = {
  CHALLENGE_TITLE: 120,
  CHALLENGE_DESCRIPTION: 2000,
  USERNAME: 30,
  BIO: 500,
  DISPLAY_NAME: 80,
} as const;

/**
 * Sanitize and truncate to max length. Strips HTML first.
 */
export function sanitizeText(
  input: string,
  maxLength: number = 1000
): string {
  const stripped = stripHtml(input);
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength);
}

export function sanitizeChallengeTitle(input: string): string {
  return sanitizeText(input, MAX_LENGTHS.CHALLENGE_TITLE);
}

export function sanitizeChallengeDescription(input: string): string {
  return sanitizeText(input, MAX_LENGTHS.CHALLENGE_DESCRIPTION);
}

export function sanitizeUsername(input: string): string {
  return sanitizeText(input, MAX_LENGTHS.USERNAME);
}

export function sanitizeBio(input: string): string {
  return sanitizeText(input, MAX_LENGTHS.BIO);
}

export function sanitizeDisplayName(input: string): string {
  return sanitizeText(input, MAX_LENGTHS.DISPLAY_NAME);
}
