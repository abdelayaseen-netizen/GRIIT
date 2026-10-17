import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { getSupabaseServer } from "../../lib/supabase-server";
import { dateKeyFromIsoInTimeZone, getProfileTimeZoneForUser, getTodayDateKey, getYesterdayDateKey } from "../../lib/date-utils";
import { freezeHoldCap } from "../../lib/freeze-grant";
import { profileTierForSecuredDays } from "../../lib/profile-tier";
import {
  STARTER_MAX,
  starterFreezeGrant,
  starterIsExpired,
  starterSource,
  starterTitleError,
} from "../../lib/starter-task";
import { logger } from "../../lib/logger";

const titleSchema = z.string().trim().min(1).max(STARTER_MAX);

type StarterRow = {
  user_id: string;
  title: string;
  source: "picked" | "written";
  status: "pending" | "done_now" | "later" | "expired";
  freeze_granted: boolean;
  created_at: string;
  completed_at: string | null;
};

async function secureStarterDay(userId: string): Promise<void> {
  const svc = serviceOrThrow();
  const tz = await getProfileTimeZoneForUser(svc, userId);
  const today = getTodayDateKey(tz);
  const { data: existing } = await svc
    .from("day_secures")
    .select("id")
    .eq("user_id", userId)
    .eq("date_key", today)
    .maybeSingle();
  if (existing) return;
  const { error: insertErr } = await svc.from("day_secures").insert({ user_id: userId, date_key: today } as never);
  if (insertErr) {
    if ((insertErr as { code?: string }).code !== "23505") {
      logger.error({ err: insertErr }, "[starterTask] day secure failed");
    }
    return;
  }
  const yesterday = getYesterdayDateKey(tz);
  const { data: streak } = await svc
    .from("streaks")
    .select("active_streak_count, longest_streak_count, last_completed_date_key")
    .eq("user_id", userId)
    .maybeSingle();
  const row = streak as {
    active_streak_count?: number | null;
    longest_streak_count?: number | null;
    last_completed_date_key?: string | null;
  } | null;
  const last = row?.last_completed_date_key ?? null;
  const next = last === yesterday || last === today ? Math.max(0, row?.active_streak_count ?? 0) + 1 : 1;
  const longest = Math.max(next, row?.longest_streak_count ?? 0);
  const patch = {
    active_streak_count: next,
    longest_streak_count: longest,
    last_completed_date_key: today,
  };
  if (row) {
    await svc.from("streaks").update(patch as never).eq("user_id", userId);
  } else {
    await svc.from("streaks").insert({ user_id: userId, ...patch } as never);
  }
  const { count } = await svc
    .from("day_secures")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (typeof count === "number") {
    await svc
      .from("profiles")
      .update({
        total_days_secured: count,
        tier: profileTierForSecuredDays(count),
        updated_at: new Date().toISOString(),
      } as never)
      .eq("user_id", userId);
  }
}

function serviceOrThrow() {
  const svc = getSupabaseServer();
  if (!svc) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't save the starter." });
  }
  return svc;
}

async function ownRow(userId: string): Promise<StarterRow | null> {
  const svc = serviceOrThrow();
  const { data, error } = await svc
    .from("starter_tasks")
    .select("user_id, title, source, status, freeze_granted, created_at, completed_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    logger.error({ err: error, userId }, "[starterTask] read failed");
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't load the starter." });
  }
  return (data as StarterRow | null) ?? null;
}

export const starterTaskRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const row = await ownRow(ctx.userId);
    if (!row || row.status === "expired") return null;
    const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
    const today = getTodayDateKey(tz);
    const created = dateKeyFromIsoInTimeZone(row.created_at, tz);
    if (row.status !== "done_now" && starterIsExpired(created, today)) return null;
    return row;
  }),

  saveLater: protectedProcedure
    .input(z.object({ title: titleSchema }))
    .mutation(async ({ ctx, input }) => {
      const titleError = starterTitleError(input.title);
      if (titleError) throw new TRPCError({ code: "BAD_REQUEST", message: titleError });
      const existing = await ownRow(ctx.userId);
      if (existing?.status === "expired" || existing?.status === "done_now") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "That starter is over." });
      }
      if (existing) return existing;
      const svc = serviceOrThrow();
      const { data, error } = await svc
        .from("starter_tasks")
        .upsert(
          {
            user_id: ctx.userId,
            title: input.title.trim(),
            source: starterSource(input.title),
            status: "later",
          } as never,
          { onConflict: "user_id" },
        )
        .select("user_id, title, source, status, freeze_granted, created_at, completed_at")
        .single();
      if (error || !data) {
        logger.error({ err: error }, "[starterTask.saveLater] failed");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't save the starter." });
      }
      return data as StarterRow;
    }),

  completeNow: protectedProcedure
    .input(z.object({ title: titleSchema }))
    .mutation(async ({ ctx, input }) => {
      const titleError = starterTitleError(input.title);
      if (titleError) throw new TRPCError({ code: "BAD_REQUEST", message: titleError });
      const existing = await ownRow(ctx.userId);
      if (existing?.status === "done_now") {
        await secureStarterDay(ctx.userId);
        return { row: existing, freezeGranted: false };
      }
      if (existing?.status === "expired") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "That starter is over." });
      }
      const svc = serviceOrThrow();
      const now = new Date().toISOString();
      const { data, error } = await svc
        .from("starter_tasks")
        .upsert(
          {
            user_id: ctx.userId,
            title: input.title.trim(),
            source: starterSource(input.title),
            status: "done_now",
            completed_at: now,
          } as never,
          { onConflict: "user_id" },
        )
        .select("user_id, title, source, status, freeze_granted, created_at, completed_at")
        .single();
      if (error || !data) {
        logger.error({ err: error }, "[starterTask.completeNow] failed");
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't save the starter." });
      }
      const row = data as StarterRow;
      await secureStarterDay(ctx.userId);
      if (row.freeze_granted) return { row, freezeGranted: false };

      const { data: profile } = await svc
        .from("profiles")
        .select("is_premium, streak_freezes_remaining")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const prof = profile as { is_premium?: boolean; streak_freezes_remaining?: number | null } | null;
      const cap = freezeHoldCap(!!prof?.is_premium);
      const decision = starterFreezeGrant({
        alreadyGranted: false,
        held: prof?.streak_freezes_remaining ?? 0,
        cap,
      });
      if (!decision.grant) return { row, freezeGranted: false };

      const { error: holdErr } = await svc
        .from("profiles")
        .update({ streak_freezes_remaining: decision.nextHeld, updated_at: now } as never)
        .eq("user_id", ctx.userId);
      if (holdErr) {
        logger.error({ err: holdErr }, "[starterTask.completeNow] freeze hold failed");
        return { row, freezeGranted: false };
      }
      await svc
        .from("starter_tasks")
        .update({ freeze_granted: true } as never)
        .eq("user_id", ctx.userId);
      return { row: { ...row, freeze_granted: true }, freezeGranted: true };
    }),

  expire: protectedProcedure.mutation(async ({ ctx }) => {
    const row = await ownRow(ctx.userId);
    if (!row || row.status === "done_now" || row.status === "expired") return { expired: false };
    const tz = await getProfileTimeZoneForUser(ctx.supabase, ctx.userId);
    const today = getTodayDateKey(tz);
    const created = dateKeyFromIsoInTimeZone(row.created_at, tz);
    if (!starterIsExpired(created, today)) return { expired: false };
    const svc = serviceOrThrow();
    const { error } = await svc
      .from("starter_tasks")
      .update({ status: "expired" } as never)
      .eq("user_id", ctx.userId);
    if (error) {
      logger.error({ err: error }, "[starterTask.expire] failed");
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't update the starter." });
    }
    return { expired: true };
  }),
});
