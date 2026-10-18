/**
 * Build 90 chunk 08: the invite code is the challenge id. This reads one out of whatever
 * someone pastes into Discover search: the bare uuid, an older scheme link, a web link ending
 * in `/i/<uuid>` or `/challenge/<uuid>`, or "Join me on GRIIT · code <uuid>".
 * No imports: shared by the app and the backend.
 */

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function parseInviteCode(text: string | null | undefined): string | null {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const match = UUID_RE.exec(trimmed);
  if (!match) return null;
  // A bare code, or a link / sentence that carries one. Anything else with a uuid buried in
  // a longer word (e.g. a username) is not a code.
  const before = trimmed.slice(0, match.index);
  const after = trimmed.slice(match.index + match[0].length);
  if (/[0-9a-z]$/i.test(before)) return null;
  if (/^[0-9a-z]/i.test(after)) return null;
  return match[0].toLowerCase();
}

/** Discover search sends a title query only when it is not a code. */
export function searchKind(text: string | null | undefined): "empty" | "code" | "title" {
  if (parseInviteCode(text)) return "code";
  const trimmed = (text ?? "").trim();
  return trimmed.length >= 2 ? "title" : "empty";
}
