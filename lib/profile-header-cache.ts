// Build 92 chunk 07.6 · the profile header renders from a cached snapshot while the network loads.
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { profileHeaderCacheKey, type ProfileHeaderSnapshot } from "@/lib/profile-header";

const NUMBER_KEYS = [
  "streak",
  "best",
  "secured",
  "verified",
  "followers",
  "following",
  "running",
  "finished",
  "badges",
  "savedAt",
] as const;

/** Strict parse: a snapshot with any missing or non-numeric field is dropped (never a half header). */
export function parseHeaderSnapshot(raw: string | null | undefined): ProfileHeaderSnapshot | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    if (!v || typeof v !== "object") return null;
    if (typeof v.displayName !== "string" || typeof v.username !== "string") return null;
    for (const k of NUMBER_KEYS) {
      if (typeof v[k] !== "number" || !Number.isFinite(v[k] as number)) return null;
    }
    return {
      displayName: v.displayName,
      username: v.username,
      avatarUrl: typeof v.avatarUrl === "string" ? v.avatarUrl : null,
      bio: typeof v.bio === "string" ? v.bio : null,
      streak: v.streak as number,
      best: v.best as number,
      secured: v.secured as number,
      verified: v.verified as number,
      followers: v.followers as number,
      following: v.following as number,
      running: v.running as number,
      finished: v.finished as number,
      badges: v.badges as number,
      savedAt: v.savedAt as number,
    };
  } catch {
    return null;
  }
}

export function snapshotChanged(a: ProfileHeaderSnapshot | null, b: ProfileHeaderSnapshot): boolean {
  if (!a) return true;
  const { savedAt: _a, ...ra } = a;
  const { savedAt: _b, ...rb } = b;
  void _a;
  void _b;
  return JSON.stringify(ra) !== JSON.stringify(rb);
}

/**
 * Reads the cached header for `userId` once, and writes `live` whenever the live header changes.
 * `cached` is null until the read finishes or when nothing was stored.
 */
export function useProfileHeaderCache(
  userId: string | null | undefined,
  live: Omit<ProfileHeaderSnapshot, "savedAt"> | null,
): { cached: ProfileHeaderSnapshot | null; ready: boolean } {
  const [cached, setCached] = useState<ProfileHeaderSnapshot | null>(null);
  const [ready, setReady] = useState(false);
  const last = useRef<ProfileHeaderSnapshot | null>(null);

  useEffect(() => {
    let alive = true;
    setReady(false);
    if (!userId) {
      setCached(null);
      setReady(true);
      return;
    }
    void AsyncStorage.getItem(profileHeaderCacheKey(userId))
      .then((raw) => {
        if (!alive) return;
        const parsed = parseHeaderSnapshot(raw);
        last.current = parsed;
        setCached(parsed);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !live) return;
    const next: ProfileHeaderSnapshot = { ...live, savedAt: Date.now() };
    if (!snapshotChanged(last.current, next)) return;
    last.current = next;
    void AsyncStorage.setItem(profileHeaderCacheKey(userId), JSON.stringify(next)).catch(() => undefined);
  }, [userId, live]);

  return { cached, ready };
}
