import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { requireEnv, safeText } from "./env";
import { appContainer } from "./device";

export type SessionInfo = {
  userId: string;
  email: string;
  anonymous: boolean;
  accessToken: string;
  refreshToken: string;
};

export function agentClient(): SupabaseClient {
  return createClient(requireEnv("EXPO_PUBLIC_SUPABASE_URL"), requireEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function makeCredentials(personaId: string) {
  const stamp = Date.now().toString(36);
  const username = (`a${personaId}${stamp}`.replace(/[^a-z0-9]/g, "").slice(0, 20) || "agentuser1");
  const email = `${username}@griit.health`;
  const password = `Ag${stamp}7k`;
  return { username, email, password };
}

function parseSessionBlob(text: string): SessionInfo | null {
  const start = text.indexOf("{");
  if (start < 0 || !text.includes("access_token")) return null;
  const candidates = [text.slice(start)];
  const decoded = text.replace(/\\"/g, '"');
  candidates.push(decoded.slice(decoded.indexOf("{")));
  for (const candidate of candidates) {
    const end = candidate.lastIndexOf("}");
    if (end < 0) continue;
    try {
      const data = JSON.parse(candidate.slice(0, end + 1)) as {
        access_token?: string;
        refresh_token?: string;
        user?: { id?: string; email?: string; is_anonymous?: boolean };
      };
      if (!data.access_token || !data.refresh_token || !data.user?.id) continue;
      const email = data.user.email?.trim().toLowerCase() ?? "";
      return {
        userId: data.user.id,
        email,
        anonymous: data.user.is_anonymous === true || !email,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      };
    } catch {
      continue;
    }
  }
  return null;
}

/** Fresh signup must be signed out. A prepared agent must already be that exact email. */
export function sessionMatchesAgent(input: {
  fresh: boolean;
  expectedEmail: string;
  onDevice: { email: string; anonymous: boolean } | null;
}): "match" | "signed_out" | "missing" | "wrong_account" {
  const expected = input.expectedEmail.trim().toLowerCase();
  const onDevice = input.onDevice;
  if (!onDevice || onDevice.anonymous || !onDevice.email) {
    return input.fresh ? "signed_out" : "missing";
  }
  if (onDevice.email.trim().toLowerCase() === expected) return "match";
  return "wrong_account";
}

export function readContainerSession(container: string): SessionInfo | null {
  if (!container || !fs.existsSync(container)) return null;
  const stack = [container];
  while (stack.length) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "Caches") continue;
        stack.push(full);
        continue;
      }
      if (!entry.isFile()) continue;
      let stat: fs.Stats;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }
      if (stat.size > 2_000_000 || stat.size < 20) continue;
      let text = "";
      try {
        text = fs.readFileSync(full, "utf8");
      } catch {
        continue;
      }
      if (!text.includes("access_token")) continue;
      const session = parseSessionBlob(text);
      if (session) return session;
    }
  }
  return null;
}

function restHeaders(accessToken: string): Record<string, string> {
  return {
    apikey: requireEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

/** Patches with the access token only, so the app's refresh token is not rotated. */
export async function markTestAccount(_client: SupabaseClient, session: SessionInfo): Promise<{ ok: boolean; detail: string }> {
  const { spawnSync } = await import("child_process");
  const marked = spawnSync(
    "railway",
    ["run", "--service", "grit-backend", "npx", "tsx", "scripts/mark-is-test.ts", session.userId],
    { cwd: "/Users/yaseenabdela/Developer/GRIIT-build87", encoding: "utf8" },
  );
  if (marked.status !== 0) return { ok: false, detail: safeText(marked.stderr || marked.stdout || "railway mark failed") };
  const base = requireEnv("EXPO_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const read = await fetch(`${base}/rest/v1/profiles?user_id=eq.${session.userId}&select=is_test`, {
    headers: restHeaders(session.accessToken),
  });
  if (!read.ok) return { ok: false, detail: safeText(await read.text()) };
  const rows = (await read.json()) as { is_test?: boolean }[];
  if (!rows.length) return { ok: false, detail: "profile row not found yet" };
  if (rows[0]?.is_test !== true) return { ok: false, detail: "profiles.is_test did not stay true" };
  return { ok: true, detail: "is_test true" };
}

export async function signInAgent(client: SupabaseClient, email: string, password: string): Promise<SessionInfo | null> {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) return null;
  return {
    userId: data.user.id,
    email: (data.user.email ?? email).toLowerCase(),
    anonymous: data.user.is_anonymous === true,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

/** One throwaway signup to prove this process can mark is_test before any UI run. */
export async function probeIsTestWrite(): Promise<{ ok: boolean; detail: string }> {
  const client = agentClient();
  const creds = makeCredentials("probe");
  const { data, error } = await client.auth.signUp({ email: creds.email, password: creds.password });
  if (error) return { ok: false, detail: safeText(error.message) };
  let session = data.session;
  let user = data.user;
  if (!session && user) {
    const signed = await client.auth.signInWithPassword({ email: creds.email, password: creds.password });
    if (signed.error || !signed.data.session || !signed.data.user) {
      return { ok: false, detail: safeText(signed.error?.message || "Sign-in after signup returned no session. Email confirmation may be required.") };
    }
    session = signed.data.session;
    user = signed.data.user;
  }
  if (!session || !user) return { ok: false, detail: "Signup returned no session." };
  let marked = { ok: false, detail: "profile row not found yet" };
  for (let attempt = 0; attempt < 5 && !marked.ok; attempt++) {
    marked = await markTestAccount(client, {
      userId: user.id,
      email: creds.email,
      anonymous: false,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    });
    if (!marked.ok && marked.detail.includes("not found yet")) await new Promise((resolve) => setTimeout(resolve, 400));
    else break;
  }
  if (!marked.ok) return marked;
  await client.from("profiles").update({ username: creds.username, display_name: "Agent Probe" }).eq("user_id", user.id);
  return { ok: true, detail: "Probe account is_test=true. It stays hidden from real viewers." };
}

/** Creates an is_test account with onboarding finished, so the agent can log in onto Home. */
export async function prepareAgentAccount(
  personaId: string,
  displayName: string,
): Promise<{
  ok: boolean;
  detail: string;
  creds?: { email: string; password: string; username: string };
  userId?: string;
  session?: Record<string, unknown>;
}> {
  const client = agentClient();
  const creds = makeCredentials(personaId);
  const { data, error } = await client.auth.signUp({ email: creds.email, password: creds.password });
  if (error) return { ok: false, detail: safeText(error.message) };
  let session = data.session;
  let user = data.user;
  if (!session && user) {
    const signed = await client.auth.signInWithPassword({ email: creds.email, password: creds.password });
    if (signed.error || !signed.data.session || !signed.data.user) {
      return { ok: false, detail: safeText(signed.error?.message || "Sign-in after signup returned no session.") };
    }
    session = signed.data.session;
    user = signed.data.user;
  }
  if (!session || !user) return { ok: false, detail: "Signup returned no session." };
  const info: SessionInfo = {
    userId: user.id,
    email: creds.email,
    anonymous: false,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
  let marked = { ok: false, detail: "profile row not found yet" };
  for (let attempt = 0; attempt < 6 && !marked.ok; attempt++) {
    marked = await markTestAccount(client, info);
    if (!marked.ok && marked.detail.includes("not found yet")) await new Promise((resolve) => setTimeout(resolve, 400));
    else break;
  }
  if (!marked.ok) return marked;
  const base = requireEnv("EXPO_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const profile = await fetch(`${base}/rest/v1/profiles?user_id=eq.${user.id}`, {
    method: "PATCH",
    headers: { ...restHeaders(session.access_token), Prefer: "return=representation" },
    body: JSON.stringify({
      username: creds.username,
      display_name: displayName.slice(0, 40),
      onboarding_completed: true,
    }),
  });
  if (!profile.ok) return { ok: false, detail: safeText(await profile.text()) };
  const rows = (await profile.json()) as { username?: string; onboarding_completed?: boolean; is_test?: boolean }[];
  const row = rows[0];
  if (!row?.onboarding_completed || row.username !== creds.username || row.is_test !== true) {
    return { ok: false, detail: "Prepared profile did not save onboarding, username, and is_test." };
  }
  return {
    ok: true,
    detail: "Prepared is_test account with onboarding done.",
    creds,
    userId: user.id,
    session: session as unknown as Record<string, unknown>,
  };
}

/** Build 92 12.4: log in as an account an earlier run saved (Day 2 users, a social partner, the History account). */
export async function savedAccountSession(file: string): Promise<{
  ok: boolean;
  detail: string;
  creds?: { email: string; password: string; username: string };
  session?: Record<string, unknown>;
}> {
  if (!fs.existsSync(file)) return { ok: false, detail: "account file missing" };
  const saved = JSON.parse(fs.readFileSync(file, "utf8")) as { email?: string; password?: string; username?: string; anonymous?: boolean };
  if (!saved.email || !saved.password || saved.anonymous) return { ok: false, detail: "no password login in the account file" };
  const { data, error } = await agentClient().auth.signInWithPassword({ email: saved.email, password: saved.password });
  if (error || !data.session) return { ok: false, detail: safeText(error?.message || "no session") };
  return {
    ok: true,
    detail: "signed in",
    creds: { email: saved.email, password: saved.password, username: saved.username ?? "" },
    session: data.session as unknown as Record<string, unknown>,
  };
}

export type DbSnapshot = {
  enrollments: { id: string; challenge_id: string; status: string; current_day: number | null; last_secured_date_key?: string | null; title: string; duration_days: number | null }[];
  checkins: { id: string; active_challenge_id: string; task_id: string | null; date_key: string | null; status: string | null; proof_url: string | null }[];
  shares: { id: string; share_state: string | null; event_type: string | null; challenge_id: string | null }[];
  created: { id: string; title: string | null }[];
  error: string;
};

export async function readOwnRows(client: SupabaseClient, userId: string): Promise<DbSnapshot> {
  const empty: DbSnapshot = { enrollments: [], checkins: [], shares: [], created: [], error: "" };
  const { data: enrollments, error: enrErr } = await client
    .from("active_challenges")
    .select("id, challenge_id, status, current_day, last_secured_date_key")
    .eq("user_id", userId)
    .limit(20);
  if (enrErr) empty.error = safeText(enrErr.message);
  const rows = (enrollments ?? []) as { id: string; challenge_id: string; status: string; current_day: number | null; last_secured_date_key: string | null }[];
  const challengeIds = [...new Set(rows.map((row) => row.challenge_id).filter(Boolean))];
  let titles = new Map<string, { title: string; duration_days: number | null }>();
  if (challengeIds.length) {
    const { data: challenges } = await client.from("challenges").select("id, title, duration_days").in("id", challengeIds).limit(20);
    titles = new Map(
      ((challenges ?? []) as { id: string; title: string | null; duration_days: number | null }[]).map((ch) => [
        ch.id,
        { title: ch.title ?? "", duration_days: ch.duration_days },
      ]),
    );
  }
  empty.enrollments = rows.map((row) => ({
    ...row,
    title: titles.get(row.challenge_id)?.title ?? "",
    duration_days: titles.get(row.challenge_id)?.duration_days ?? null,
  }));
  const { data: checkins, error: checkErr } = await client
    .from("check_ins")
    .select("id, active_challenge_id, task_id, date_key, status, proof_url")
    .eq("user_id", userId)
    .limit(40);
  if (checkErr) empty.error = empty.error || safeText(checkErr.message);
  empty.checkins = (checkins ?? []) as DbSnapshot["checkins"];
  const { data: shares, error: shareErr } = await client
    .from("activity_events")
    .select("id, share_state, event_type, challenge_id")
    .eq("user_id", userId)
    .limit(40);
  if (shareErr) empty.error = empty.error || safeText(shareErr.message);
  empty.shares = (shares ?? []) as DbSnapshot["shares"];
  const { data: created, error: createErr } = await client.from("challenges").select("id, title").eq("creator_id", userId).limit(10);
  if (createErr) empty.error = empty.error || safeText(createErr.message);
  empty.created = (created ?? []) as DbSnapshot["created"];
  return empty;
}

export async function deleteEnrollments(client: SupabaseClient, userId: string): Promise<string> {
  const { error, count } = await client.from("active_challenges").delete({ count: "exact" }).eq("user_id", userId);
  if (error) return safeText(error.message);
  return `removed ${count ?? 0} enrollments`;
}

/** Writes the Supabase session into the simulator so the app opens already signed in. */
export async function installAppSession(session: Record<string, unknown>): Promise<void> {
  const container = await appContainer();
  const dir = path.join(container, "Library", "Application Support", "app.griit.challenge-tracker", "RCTAsyncLocalStorage_V1");
  fs.mkdirSync(dir, { recursive: true });
  const manifestPath = path.join(dir, "manifest.json");
  let manifest: Record<string, string> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Record<string, string>;
      if (parsed && typeof parsed === "object") manifest = parsed;
    } catch {
      manifest = {};
    }
  }
  const host = new URL(requireEnv("EXPO_PUBLIC_SUPABASE_URL")).hostname.split(".")[0] ?? "local";
  manifest[`sb-${host}-auth-token`] = JSON.stringify(session);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
}
