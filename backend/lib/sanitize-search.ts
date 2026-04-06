import { TRPCError } from "@trpc/server";

/**
 * Escape special characters for PostgREST filter strings.
 * Prevents filter injection when user input is interpolated into .or() / .filter() calls.
 *
 * PostgREST filter syntax characters: , . ( ) are structural delimiters.
 * LIKE/ILIKE wildcards: % matches any sequence, _ matches any single character.
 */

const UUID_FOR_OR_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Auth user ids only — safe to embed in PostgREST `.or()` filter strings after validation. */
export function requireUuidForPostgrestOr(id: string): string {
  const t = id.trim();
  const safeId = t.replace(/[^a-f0-9-]/gi, "");
  if (safeId !== t || !UUID_FOR_OR_RE.test(safeId)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid user ID" });
  }
  return safeId;
}

/** Escape PostgREST filter-syntax chars so user input cannot break out of a filter value. */
export function escapePostgrestFilter(input: string): string {
  // Remove characters that are structural in PostgREST filter syntax
  return input.replace(/[,.()"'\\]/g, "");
}

/** Escape SQL LIKE/ILIKE wildcard characters (% and _) so they are matched literally. */
export function escapeLikeWildcards(input: string): string {
  return input.replace(/[%_\\]/g, (ch) => `\\${ch}`);
}

/** Full sanitization for search queries used in .or() with ilike: escape both filter syntax and wildcards. */
export function sanitizeSearchQuery(input: string): string {
  return escapeLikeWildcards(escapePostgrestFilter(input));
}
