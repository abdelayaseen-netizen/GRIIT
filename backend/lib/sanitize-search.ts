/**
 * Escape special characters for PostgREST filter strings.
 * Prevents filter injection when user input is interpolated into .or() / .filter() calls.
 *
 * PostgREST filter syntax characters: , . ( ) are structural delimiters.
 * LIKE/ILIKE wildcards: % matches any sequence, _ matches any single character.
 */

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
