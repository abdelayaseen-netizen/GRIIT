/**
 * Create + display taxonomy. Discover chips stay on their own list this chunk.
 *
 * Distinct stored values (run by hand, read-only):
 *   SELECT DISTINCT category FROM challenges WHERE category IS NOT NULL ORDER BY 1;
 */
export const CREATE_CATEGORIES = [
  { id: "fitness", label: "Fitness" },
  { id: "faith", label: "Faith" },
  { id: "mind", label: "Mind" },
  { id: "health", label: "Health" },
  { id: "discipline", label: "Discipline" },
  { id: "learning", label: "Learning" },
] as const;

export type WizardCategory = (typeof CREATE_CATEGORIES)[number]["id"];

/** Stored slugs / Discover leftovers that are not on the create chips. */
const LEGACY_CATEGORY_DISPLAY: Record<string, string> = {
  body: "Body",
  focus: "Focus",
  other: "Other",
};

function titleCaseWords(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Title-case a stored category so legacy rows still render. */
export function displayCategory(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "Other";
  const key = raw.toLowerCase();
  const known = CREATE_CATEGORIES.find((c) => c.id === key);
  if (known) return known.label;
  if (LEGACY_CATEGORY_DISPLAY[key]) return LEGACY_CATEGORY_DISPLAY[key];
  return titleCaseWords(raw);
}

export function isWizardCategory(value: string | null | undefined): value is WizardCategory {
  const key = (value ?? "").trim().toLowerCase();
  return CREATE_CATEGORIES.some((c) => c.id === key);
}
