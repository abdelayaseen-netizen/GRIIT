/** Law 12: letters from the display name, else the person glyph (null). Never user_. */
export function initialsFrom(displayName?: string | null): string | null {
  if (!displayName) return null;
  const trimmed = displayName.trim();
  if (!trimmed || /^user_/i.test(trimmed)) return null;
  const parts = trimmed.split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p.match(/\p{L}/u)?.[0] ?? "").join("");
  return letters ? letters.toUpperCase() : null;
}
