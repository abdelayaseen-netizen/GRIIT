export const CONCEPT_SECURED = "Day secured: every task done.";
export const CONCEPT_FREEZE =
  "A freeze keeps your streak when you miss a day. You earn one every 7 days in a row.";
export const CONCEPT_SELF = "Self-reported: you mark it yourself.";

export type ConceptKind = "secured" | "freeze" | "self";

const LINES: Record<ConceptKind, string> = {
  secured: CONCEPT_SECURED,
  freeze: CONCEPT_FREEZE,
  self: CONCEPT_SELF,
};

export function conceptLine(kind: ConceptKind, seen: ReadonlySet<ConceptKind>): string | null {
  if (seen.has(kind)) return null;
  return LINES[kind];
}
