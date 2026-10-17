/**
 * Build 90 06.1: which one-line definitions this phone has already shown.
 * Same key and shape Home reads (`app/(tabs)/index.tsx`, "griit.concept.seen"),
 * so a definition shown on a task screen is not repeated on Home and vice versa.
 */
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ConceptKind } from "@/lib/concept-once";

export const CONCEPT_SEEN_KEY = "griit.concept.seen";

export function parseConceptSeen(raw: string | null | undefined): Set<ConceptKind> {
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? (parsed.filter((k) => typeof k === "string") as ConceptKind[]) : []);
  } catch {
    return new Set();
  }
}

export async function readConceptSeen(): Promise<Set<ConceptKind>> {
  try {
    return parseConceptSeen(await AsyncStorage.getItem(CONCEPT_SEEN_KEY));
  } catch {
    return new Set();
  }
}

export async function markConceptSeen(kind: ConceptKind): Promise<void> {
  try {
    const seen = await readConceptSeen();
    if (seen.has(kind)) return;
    seen.add(kind);
    await AsyncStorage.setItem(CONCEPT_SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* non-fatal: the line shows again next time */
  }
}

/**
 * `first` is null until the flag is read, then true the first time this concept is on
 * screen (and it is marked seen as soon as it is), false afterwards.
 */
export function useFirstConcept(kind: ConceptKind, enabled = true): boolean | null {
  const [first, setFirst] = useState<boolean | null>(null);
  const marked = useRef(false);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    void readConceptSeen().then((seen) => {
      if (!alive) return;
      const isFirst = !seen.has(kind);
      setFirst(isFirst);
      if (isFirst && !marked.current) {
        marked.current = true;
        void markConceptSeen(kind);
      }
    });
    return () => {
      alive = false;
    };
  }, [kind, enabled]);
  return enabled ? first : false;
}
