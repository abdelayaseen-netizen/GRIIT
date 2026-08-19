/**
 * Phase 2C — verify anon-session RLS after B policies + anonymous sign-in enabled.
 * Usage: node scripts/phase2-anon-rls-verify.mjs
 * Requires: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { randomUUID } from "crypto";

config({ path: ".env" });

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!url || !anonKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

function client() {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function assert(cond, msg) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const out = {};

  // ——— Anon session ———
  const anon = client();
  const { data: anonAuth, error: anonErr } = await anon.auth.signInAnonymously();
  if (anonErr) {
    console.error("signInAnonymously failed:", anonErr.message, anonErr.code);
    process.exit(2);
  }
  const anonUid = anonAuth.user.id;
  out.anon_uid = anonUid;
  out.anon_is_anonymous = anonAuth.user.is_anonymous === true;
  assert(out.anon_is_anonymous, "expected is_anonymous true");

  const username = `anon_${anonUid.replace(/-/g, "").slice(0, 12)}`;
  const { error: profInsErr } = await anon.from("profiles").upsert({
    user_id: anonUid,
    username,
    display_name: "Anon Verify",
  });
  out.anon_profile_upsert_error = profInsErr?.message ?? null;
  assert(!profInsErr, `profile upsert: ${profInsErr?.message}`);

  const { data: anonProfiles, error: anonProfErr } = await anon
    .from("profiles")
    .select("user_id, username");
  out.anon_profiles_select = {
    error: anonProfErr?.message ?? null,
    count: anonProfiles?.length ?? 0,
    user_ids: (anonProfiles ?? []).map((r) => r.user_id),
  };
  assert(!anonProfErr, anonProfErr?.message);
  assert(out.anon_profiles_select.count === 1, `anon profiles count=${out.anon_profiles_select.count}`);
  assert(out.anon_profiles_select.user_ids[0] === anonUid, "anon profile not own row");

  const { data: anonEventsBefore, error: anonEvErr } = await anon
    .from("activity_events")
    .select("id, user_id");
  out.anon_activity_select_before_insert = {
    error: anonEvErr?.message ?? null,
    count: anonEventsBefore?.length ?? 0,
  };
  assert(!anonEvErr, anonEvErr?.message);
  assert(
    (anonEventsBefore ?? []).every((e) => e.user_id === anonUid),
    "anon saw another user's activity_events"
  );

  const { data: ownEvent, error: evInsErr } = await anon
    .from("activity_events")
    .insert({ user_id: anonUid, event_type: "joined_challenge", metadata: { phase2: true } })
    .select("id, user_id")
    .single();
  out.anon_activity_insert_error = evInsErr?.message ?? null;
  assert(!evInsErr, `activity insert: ${evInsErr?.message}`);

  const { data: anonEventsAfter } = await anon.from("activity_events").select("id, user_id");
  out.anon_activity_select_after_insert = {
    count: anonEventsAfter?.length ?? 0,
    all_own: (anonEventsAfter ?? []).every((e) => e.user_id === anonUid),
  };
  assert(out.anon_activity_select_after_insert.count >= 1, "expected own activity row");
  assert(out.anon_activity_select_after_insert.all_own, "activity select leaked other users");

  // Catalogue: anon must see published challenges (onboarding picker)
  const { data: catalog, error: catalogErr } = await anon
    .from("challenges")
    .select("id, title, status")
    .eq("status", "published")
    .limit(50);
  out.anon_challenges_catalog = {
    error: catalogErr?.message ?? null,
    count: catalog?.length ?? 0,
  };
  assert(!catalogErr, `challenges catalog: ${catalogErr?.message}`);
  assert(
    out.anon_challenges_catalog.count > 0,
    "anon SELECT published challenges returned 0 rows — picker would be empty"
  );

  // Join challenge (onboard-water still published)
  const { data: ch, error: chErr } = await anon
    .from("challenges")
    .select("id, title, duration_days")
    .eq("source_starter_id", "onboard-water")
    .eq("status", "published")
    .maybeSingle();
  out.join_challenge = { error: chErr?.message ?? null, id: ch?.id, title: ch?.title };
  assert(ch?.id, "onboard-water challenge not found published");

  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(7, ch.duration_days ?? 7));
  const { data: ac, error: acErr } = await anon
    .from("active_challenges")
    .insert({
      user_id: anonUid,
      challenge_id: ch.id,
      status: "active",
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      current_day: 0,
      progress_percent: 0,
    })
    .select("id")
    .single();
  out.join_active_challenge = { error: acErr?.message ?? null, id: ac?.id };
  assert(!acErr && ac?.id, `active_challenges insert: ${acErr?.message}`);

  const { data: task, error: taskErr } = await anon
    .from("challenge_tasks")
    .select("id")
    .eq("challenge_id", ch.id)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();
  out.task = { error: taskErr?.message ?? null, id: task?.id };
  assert(task?.id, "no task on onboard-water");

  const dateKey = new Date().toISOString().slice(0, 10);
  const { data: ci, error: ciErr } = await anon
    .from("check_ins")
    .insert({
      user_id: anonUid,
      active_challenge_id: ac.id,
      task_id: task.id,
      date_key: dateKey,
      status: "completed",
    })
    .select("id")
    .single();
  out.check_in = { error: ciErr?.message ?? null, id: ci?.id };
  assert(!ciErr && ci?.id, `check_ins insert: ${ciErr?.message}`);

  const proofPath = `${anonUid}/phase2-verify-${randomUUID()}.txt`;
  const { data: up, error: upErr } = await anon.storage
    .from("task-proofs")
    .upload(proofPath, Buffer.from("phase2-anon-verify"), {
      contentType: "text/plain",
      upsert: false,
    });
  out.task_proofs_upload = { error: upErr?.message ?? null, path: up?.path ?? null };
  assert(!upErr, `task-proofs upload: ${upErr?.message}`);

  // Cleanup anon artifacts (best-effort)
  await anon.from("check_ins").delete().eq("id", ci.id);
  await anon.from("active_challenges").delete().eq("id", ac.id);
  if (ownEvent?.id) await anon.from("activity_events").delete().eq("id", ownEvent.id);
  await anon.storage.from("task-proofs").remove([proofPath]);
  await anon.from("profiles").delete().eq("user_id", anonUid);
  await anon.auth.signOut();

  // ——— Normal authenticated (non-anonymous) via email signUp ———
  const normal = client();
  const email = `phase2_verify_${Date.now()}@griit.test`;
  const password = `Verify_${randomUUID().slice(0, 12)}!aA1`;
  const { data: signUpData, error: signUpErr } = await normal.auth.signUp({ email, password });
  out.normal_signup = {
    error: signUpErr?.message ?? null,
    user_id: signUpData.user?.id ?? null,
    is_anonymous: signUpData.user?.is_anonymous ?? null,
    has_session: !!signUpData.session,
  };
  assert(!signUpErr && signUpData.session, `signUp: ${signUpErr?.message ?? "no session"}`);
  assert(signUpData.user?.is_anonymous !== true, "expected non-anonymous user");

  const normalUid = signUpData.user.id;
  await normal.from("profiles").upsert({
    user_id: normalUid,
    username: `norm_${normalUid.replace(/-/g, "").slice(0, 12)}`,
    display_name: "Normal Verify",
  });

  const { data: normalProfiles, error: npErr } = await normal.from("profiles").select("user_id");
  out.normal_profiles_select = {
    error: npErr?.message ?? null,
    count: normalProfiles?.length ?? 0,
  };
  assert(!npErr, npErr?.message);
  assert(
    out.normal_profiles_select.count > 1,
    `normal user should see all profiles, got ${out.normal_profiles_select.count}`
  );

  await normal.from("profiles").delete().eq("user_id", normalUid);
  await normal.auth.signOut();

  console.log(JSON.stringify(out, null, 2));
  console.log("\nOK — all Phase 2C assertions passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
