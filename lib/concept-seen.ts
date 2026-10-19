/**
 * Build 90 06.1 / build 92 10.5: which one-line definitions this person has already seen.
 * Stored per user, so a second account on the same phone still gets each definition once.
 * Home, the task screens and Day secured all read this, so a definition is never repeated.
 */
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ConceptKind } from "@/lib/concept-once";

export function conceptSeenKey(userId: string): string {
  return `griit.concept.seen.v2:${userId}`;
}

export function parseConceptSeen(raw: string | null | undefined): Set<ConceptKind> {
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? (parsed.filter((k) => typeof k === "string") as ConceptKind[]) : []);
  } catch {
    return new Set();
  }
}

export async function readConceptSeen(userId: string): Promise<Set<ConceptKind>> {
  if (!userId) return new Set();
  try {
    return parseConceptSeen(await AsyncStorage.getItem(conceptSeenKey(userId)));
  } catch {
    return new Set();
  }
}

export async function markConceptSeen(userId: string, kind: ConceptKind): Promise<void> {
  if (!userId) return;
  try {
    const seen = await readConceptSeen(userId);
    if (seen.has(kind)) return;
    seen.add(kind);
    await AsyncStorage.setItem(conceptSeenKey(userId), JSON.stringify([...seen]));
  } catch {
    /* non-fatal: the line shows again next time */
  }
}

/**
 * `first` is null until the flag is read, then true the first time this concept is on
 * screen for this user (and it is marked seen as soon as it is), false afterwards.
 */
export function useFirstConcept(kind: ConceptKind, userId: string | null | undefined, enabled = true): boolean | null {
  const [first, setFirst] = useState<boolean | null>(null);
  const marked = useRef(false);
  const uid = userId ?? "";
  useEffect(() => {
    if (!enabled || !uid) return;
    let alive = true;
    void readConceptSeen(uid).then((seen) => {
      if (!alive) return;
      const isFirst = !seen.has(kind);
      setFirst(isFirst);
      if (isFirst && !marked.current) {
        marked.current = true;
        void markConceptSeen(uid, kind);
      }
    });
    return () => {
      alive = false;
    };
  }, [kind, uid, enabled]);
  return enabled ? first : false;
}
