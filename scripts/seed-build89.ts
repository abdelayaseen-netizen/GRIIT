/**
 * One is_test account for the build 89 bug flows.
 * Service role only. Does not print secrets. Does not change schema.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { buildTaskInsertPayload } from "../backend/lib/challenge-tasks";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
const password = process.env.B89_SEED_PASSWORD?.trim() || "b89-seed-overnight";
const email = "b89seed@example.com";
const friendEmail = "b89friend@example.com";
const zone = "America/New_York";

if (!url || !key) {
  console.error("Missing Supabase URL or service role. Nothing was seeded.");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

function todayKey(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

async function ensureUser(addr: string): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email: addr,
    password,
    email_confirm: true,
  });
  if (created.data.user?.id) return created.data.user.id;
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found = listed.data.users.find((user) => user.email?.toLowerCase() === addr);
  if (!found) throw new Error(`Could not create ${addr}: ${created.error?.message ?? "unknown"}`);
  await admin.auth.admin.updateUserById(found.id, { password, email_confirm: true });
  return found.id;
}

async function must(label: string, error: { message?: string } | null) {
  if (error) throw new Error(`${label}: ${error.message ?? "failed"}`);
}

async function main() {
  const today = todayKey(zone);
  const userId = await ensureUser(email);
  const friendId = await ensureUser(friendEmail);

  for (const row of [
    { user_id: userId, username: "b89seed", display_name: "Build 89", timezone: "UTC", is_test: true },
    { user_id: friendId, username: "b89friend", display_name: "Build 89 Friend", timezone: zone, is_test: true },
  ]) {
    const { error } = await admin.from("profiles").update({
      username: row.username,
      display_name: row.display_name,
      timezone: row.timezone,
      is_test: true,
    } as never).eq("user_id", row.user_id);
    await must("profile", error);
  }

  async function challenge(title: string, days: number, startKey: string) {
    const { data, error } = await admin.from("challenges").insert({
      creator_id: userId,
      title,
      description: "",
      duration_type: "multi_day",
      duration_days: days,
      category: "faith",
      difficulty: "medium",
      status: "published",
      visibility: "PRIVATE",
      participation_type: "solo",
      team_size: 1,
      is_hard_mode: false,
    } as never).select("id").single();
    await must(`challenge ${title}`, error);
    const id = (data as { id: string }).id;
    const task = buildTaskInsertPayload({ title: "Show up", type: "check_off", required: true }, id, 0);
    const { data: taskRow, error: taskError } = await admin.from("challenge_tasks").insert(task as never).select("id").single();
    await must(`task ${title}`, taskError);
    const start = new Date(`${startKey}T12:00:00.000Z`);
    const end = new Date(start.getTime() + days * 86400000);
    const { data: active, error: activeError } = await admin.from("active_challenges").insert({
      user_id: userId,
      challenge_id: id,
      status: "active",
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      current_day: 1,
      progress_percent: 0,
    } as never).select("id").single();
    await must(`enroll ${title}`, activeError);
    return { challengeId: id, activeId: (active as { id: string }).id, taskId: (taskRow as { id: string }).id, startKey };
  }

  const { data: oldChallenges } = await admin.from("challenges").select("id").eq("creator_id", userId).in("title", ["Morning Prayer", "Thirty Days"]);
  const oldIds = ((oldChallenges ?? []) as { id: string }[]).map((row) => row.id);
  if (oldIds.length) {
    const { data: oldActive } = await admin.from("active_challenges").select("id").in("challenge_id", oldIds);
    const activeIds = ((oldActive ?? []) as { id: string }[]).map((row) => row.id);
    if (activeIds.length) {
      const { error } = await admin.from("check_ins").delete().in("active_challenge_id", activeIds);
      await must("clear check_ins", error);
    }
    const { error: eventError } = await admin.from("activity_events").delete().in("challenge_id", oldIds);
    await must("clear events", eventError);
    const { error: activeError } = await admin.from("active_challenges").delete().in("challenge_id", oldIds);
    await must("clear enrollments", activeError);
    const { error: taskError } = await admin.from("challenge_tasks").delete().in("challenge_id", oldIds);
    await must("clear tasks", taskError);
    const { error: challengeError } = await admin.from("challenges").delete().in("id", oldIds);
    await must("clear challenges", challengeError);
  }

  const prayerStart = addDays(today, -5);
  const longStart = addDays(today, -10);
  const prayer = await challenge("Morning Prayer", 7, prayerStart);
  const longer = await challenge("Thirty Days", 30, longStart);

  const secured: string[] = [];
  for (let i = 0; i <= 5; i++) secured.push(addDays(prayerStart, i));
  const freezeDay = addDays(prayerStart, 2);
  const securedWithoutFreeze = secured.filter((key) => key !== freezeDay);
  for (const date_key of securedWithoutFreeze) {
    const { error } = await admin.from("day_secures").upsert({ user_id: userId, date_key } as never, { onConflict: "user_id,date_key" });
    await must("day_secures", error);
  }
  const { error: freezeError } = await admin.from("freeze_uses").upsert({ user_id: userId, date_key: freezeDay } as never, { onConflict: "user_id,date_key" });
  await must("freeze", freezeError);

  const { error: streakError } = await admin.from("streaks").upsert({
    user_id: userId,
    active_streak_count: 5,
    longest_streak_count: 6,
    current_streak: 5,
    best_streak: 6,
    last_completed_date_key: today,
  } as never, { onConflict: "user_id" });
  await must("streaks", streakError);

  const photoDays: string[] = [];
  for (let i = 0; i < 18; i++) photoDays.push(addDays(today, -i));
  for (let i = 0; i < photoDays.length; i++) {
    const date_key = photoDays[i]!;
    const activeId = i % 2 === 0 ? prayer.activeId : longer.activeId;
    const taskId = i % 2 === 0 ? prayer.taskId : longer.taskId;
    const challengeId = i % 2 === 0 ? prayer.challengeId : longer.challengeId;
    const photo = `https://placehold.co/400x500/png?text=${i}`;
    const selfReported = i % 5 === 0;
    const { error: checkError } = await admin.from("check_ins").upsert({
      user_id: userId,
      active_challenge_id: activeId,
      task_id: taskId,
      date_key,
      status: "completed",
      photo_url: photo,
      proof_url: photo,
      completion_image_url: photo,
    } as never, { onConflict: "active_challenge_id,task_id,date_key" });
    await must("check_in", checkError);
    const created = new Date(`${date_key}T00:30:00.000Z`).toISOString();
    const { error: eventError } = await admin.from("activity_events").insert({
      user_id: userId,
      event_type: "task_completed",
      challenge_id: challengeId,
      share_state: "shared",
      shared: true,
      created_at: created,
      metadata: {
        task_id: taskId,
        date_key,
        photo_url: photo,
        verification_method: selfReported ? "self_reported" : "photo",
        challenge_name: i % 2 === 0 ? "Morning Prayer" : "Thirty Days",
        task_name: "Show up",
      },
    } as never);
    await must("event", eventError);
  }

  const { data: friendEvent, error: friendError } = await admin.from("activity_events").insert({
    user_id: friendId,
    event_type: "task_completed",
    challenge_id: prayer.challengeId,
    share_state: "shared",
    shared: true,
    metadata: {
      challenge_name: "Morning Prayer",
      task_name: "Show up",
      photo_url: "https://placehold.co/400x500/png?text=friend",
      verification_method: "photo",
      date_key: today,
    },
  } as never).select("id").single();
  await must("friend post", friendError);

  console.log(JSON.stringify({
    ok: true,
    email,
    userId,
    friendId,
    friendEventId: (friendEvent as { id: string }).id,
    today,
    prayerStart,
    freezeDay,
    photos: 18,
  }));
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : "seed failed";
  console.error(message);
  process.exit(1);
});
