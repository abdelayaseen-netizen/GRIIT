import { WORDS, type Word } from "@/lib/words";

export type ConceptKind = "secured" | "freeze" | "self" | "verified";

export const CONCEPT_WORD: Record<ConceptKind, Word> = {
  secured: "Secured",
  freeze: "Freeze",
  self: "Self-reported",
  verified: "Verified",
};

/** Build 92 10.5: "Self-reported: you marked it done yourself, with no photo or app proof." */
export function conceptSentence(kind: ConceptKind): string {
  const word = CONCEPT_WORD[kind];
  const def = WORDS[word];
  return `${word}: ${def.charAt(0).toLowerCase()}${def.slice(1)}`;
}

export const CONCEPT_SECURED = conceptSentence("secured");
export const CONCEPT_FREEZE = conceptSentence("freeze");
export const CONCEPT_SELF = conceptSentence("self");

export function conceptLine(kind: ConceptKind, seen: ReadonlySet<ConceptKind>): string | null {
  if (seen.has(kind)) return null;
  return conceptSentence(kind);
}
