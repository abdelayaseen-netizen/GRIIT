import type { SupabaseClient } from "@supabase/supabase-js";
import { ACHIEVEMENTS } from "./achievement-definitions";

export async function checkAndUnlockAchievements(
  supabase: SupabaseClient,
  userId: string,
  currentStreak: number,
  totalDaysSecured: number,
  challengeCompleted: boolean
): Promise<{ unlockedKeys: string[]; newUnlockKeys: string[] }> {
  const toUnlock: string[] = [];

  for (const ach of [
    ACHIEVEMENTS.STREAK_7,
    ACHIEVEMENTS.STREAK_14,
    ACHIEVEMENTS.STREAK_30,
    ACHIEVEMENTS.STREAK_75,
  ]) {
    if (currentStreak >= ach.threshold) toUnlock.push(ach.key);
  }

  if (totalDaysSecured >= 1) toUnlock.push(ACHIEVEMENTS.FIRST_SECURE.key);
  if (challengeCompleted) toUnlock.push(ACHIEVEMENTS.FIRST_CHALLENGE.key);

  if (toUnlock.length === 0) return { unlockedKeys: [], newUnlockKeys: [] };

  const { data: existing } = await supabase
    .from("user_achievements")
    .select("achievement_key")
    .eq("user_id", userId)
    .in("achievement_key", toUnlock);
  const existingSet = new Set((existing ?? []).map((r: { achievement_key: string }) => r.achievement_key));
  const toInsert = toUnlock.filter((k) => !existingSet.has(k));
  const newUnlockKeys = toInsert.length > 0 ? [...toInsert] : [];

  if (toInsert.length > 0) {
    const rows = toInsert.map((key) => ({ user_id: userId, achievement_key: key }));
    await supabase.from("user_achievements").upsert(rows, { onConflict: "user_id,achievement_key" });
  }

  return { unlockedKeys: toUnlock, newUnlockKeys };
}

export function getLabelForKey(key: string): string {
  const entry = Object.values(ACHIEVEMENTS).find((a) => a.key === key);
  return entry?.label ?? key;
}
