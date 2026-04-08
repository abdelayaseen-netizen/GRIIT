import type { SupabaseClient } from "@supabase/supabase-js";
import { ACHIEVEMENTS } from "./achievement-definitions";

export async function checkAndUnlockAchievements(
  supabase: SupabaseClient,
  userId: string,
  currentStreak: number,
  totalDaysSecured: number,
  challengeCompleted: boolean,
  isHardModeTask?: boolean
): Promise<{ unlockedKeys: string[]; newUnlockKeys: string[] }> {
  const { data: streakRow } = await supabase
    .from("streaks")
    .select("longest_streak_count")
    .eq("user_id", userId)
    .maybeSingle();
  const longestStreak = (streakRow as { longest_streak_count?: number } | null)?.longest_streak_count ?? currentStreak;

  const toUnlock: string[] = [];

  const streakBadges = [
    ACHIEVEMENTS.STREAK_3,
    ACHIEVEMENTS.STREAK_7,
    ACHIEVEMENTS.STREAK_14,
    ACHIEVEMENTS.STREAK_30,
    ACHIEVEMENTS.STREAK_60,
    ACHIEVEMENTS.STREAK_75,
    ACHIEVEMENTS.STREAK_100,
  ];
  for (const ach of streakBadges) {
    if (ach.threshold && longestStreak >= ach.threshold) toUnlock.push(ach.key);
  }

  if (totalDaysSecured >= 1) toUnlock.push(ACHIEVEMENTS.FIRST_SECURE.key);
  if (challengeCompleted) toUnlock.push(ACHIEVEMENTS.FIRST_CHALLENGE.key);
  if (totalDaysSecured >= 50) toUnlock.push(ACHIEVEMENTS.TOTAL_DAYS_50.key);
  if (totalDaysSecured >= 100) toUnlock.push(ACHIEVEMENTS.TOTAL_DAYS_100.key);
  if (isHardModeTask) toUnlock.push(ACHIEVEMENTS.HARD_MODE_FIRST.key);

  if (challengeCompleted) {
    const { count } = await supabase
      .from("activity_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "completed_challenge");
    if ((count ?? 0) >= 5) toUnlock.push(ACHIEVEMENTS.FIVE_CHALLENGES.key);
  }

  try {
    const { data: completedEvents } = await supabase
      .from("activity_events")
      .select("challenge_id")
      .eq("user_id", userId)
      .eq("event_type", "completed_challenge");
    if (completedEvents && completedEvents.length > 0) {
      const challengeIds = [...new Set(completedEvents.map((e: { challenge_id: string | null }) => e.challenge_id).filter(Boolean))] as string[];
      if (challengeIds.length > 0) {
        const { data: challenges } = await supabase.from("challenges").select("category").in("id", challengeIds);
        const categories = new Set((challenges ?? []).map((c: { category?: string | null }) => c.category).filter(Boolean));
        if (categories.size >= 3) toUnlock.push(ACHIEVEMENTS.THREE_CATEGORIES.key);
      }
    }
  } catch {
    /* non-fatal */
  }

  try {
    const { count: followingCount } = await supabase
      .from("user_follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", userId)
      .eq("status", "accepted");
    if ((followingCount ?? 0) >= 1) toUnlock.push(ACHIEVEMENTS.FIRST_FOLLOW.key);

    const { count: followerCount } = await supabase
      .from("user_follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", userId)
      .eq("status", "accepted");
    if ((followerCount ?? 0) >= 10) toUnlock.push(ACHIEVEMENTS.TEN_FOLLOWERS.key);

    const { count: respectCount } = await supabase
      .from("respects")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId);
    if ((respectCount ?? 0) >= 1) toUnlock.push(ACHIEVEMENTS.FIRST_RESPECT.key);
    if ((respectCount ?? 0) >= 50) toUnlock.push(ACHIEVEMENTS.FIFTY_RESPECTS.key);

    const { count: commentCount } = await supabase
      .from("feed_comments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((commentCount ?? 0) >= 1) toUnlock.push(ACHIEVEMENTS.FIRST_COMMENT.key);

    const { count: partnerCount } = await supabase
      .from("accountability_pairs")
      .select("id", { count: "exact", head: true })
      .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
      .eq("status", "accepted");
    if ((partnerCount ?? 0) >= 1) toUnlock.push(ACHIEVEMENTS.ACCOUNTABILITY_PARTNER.key);
  } catch {
    /* non-fatal */
  }

  try {
    const { count: createdCount } = await supabase
      .from("challenges")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", userId)
      .eq("status", "published");
    if ((createdCount ?? 0) >= 1) toUnlock.push(ACHIEVEMENTS.FIRST_CHALLENGE_CREATED.key);
    if ((createdCount ?? 0) >= 5) toUnlock.push(ACHIEVEMENTS.FIVE_CHALLENGES_CREATED.key);

    if ((createdCount ?? 0) >= 1) {
      const { data: createdChallenges } = await supabase
        .from("challenges")
        .select("id, participants_count")
        .eq("creator_id", userId)
        .eq("status", "published");
      const hasPopular = (createdChallenges ?? []).some(
        (c: { participants_count?: number | null }) => (c.participants_count ?? 0) >= 10
      );
      if (hasPopular) toUnlock.push(ACHIEVEMENTS.CHALLENGE_10_PARTICIPANTS.key);
    }
  } catch {
    /* non-fatal */
  }

  if (toUnlock.length === 0) return { unlockedKeys: [], newUnlockKeys: [] };

  const uniqueToUnlock = [...new Set(toUnlock)];

  const { data: existing } = await supabase
    .from("user_achievements")
    .select("achievement_key")
    .eq("user_id", userId)
    .in("achievement_key", uniqueToUnlock);
  const existingSet = new Set((existing ?? []).map((r: { achievement_key: string }) => r.achievement_key));
  const toInsert = uniqueToUnlock.filter((k) => !existingSet.has(k));
  const newUnlockKeys = toInsert.length > 0 ? [...toInsert] : [];

  if (toInsert.length > 0) {
    const rows = toInsert.map((key) => ({ user_id: userId, achievement_key: key }));
    await supabase.from("user_achievements").upsert(rows, { onConflict: "user_id,achievement_key" });
  }

  return { unlockedKeys: uniqueToUnlock, newUnlockKeys };
}

export function getLabelForKey(key: string): string {
  const entry = Object.values(ACHIEVEMENTS).find((a) => a.key === key);
  return entry?.label ?? key;
}

export function getDescriptionForKey(key: string): string {
  const entry = Object.values(ACHIEVEMENTS).find((a) => a.key === key);
  return entry?.description ?? "Keep grinding to unlock this badge.";
}
