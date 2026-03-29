import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import type { PgError } from "../../types/db";

const PUSH_TOKEN_MAX = 500;
const DEVICE_ID_MAX = 256;

const NOTIF_SELECT = "id, user_id, type, title, body, data, read, created_at";

type NotifType = "respect" | "comment" | "follow" | "rank" | "follow_request" | "general";

function parseDataObject(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

type DbNotifRow = {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  body: string | null;
  data: unknown;
  read: boolean;
  created_at: string;
};

function mapDbRow(r: DbNotifRow) {
  const dataObj = parseDataObject(r.data);
  const actorKey = "actor" + "_id";
  const rawActor = dataObj[actorKey];
  const reqId = dataObj["requesterId"];
  const actorId =
    typeof reqId === "string" ? reqId : typeof rawActor === "string" ? rawActor : null;
  const actorUsername =
    typeof dataObj["requesterUsername"] === "string"
      ? dataObj["requesterUsername"]
      : typeof dataObj["actor_username"] === "string"
        ? dataObj["actor_username"]
        : null;
  const actorDisplayName =
    typeof dataObj["requesterDisplayName"] === "string"
      ? dataObj["requesterDisplayName"]
      : typeof dataObj["actor_display_name"] === "string"
        ? dataObj["actor_display_name"]
        : null;
  const actorAvatarUrl =
    typeof dataObj["actor_avatar_url"] === "string" ? dataObj["actor_avatar_url"] : null;

  const allowed = new Set(["respect", "comment", "follow", "rank", "follow_request"]);
  const typeStr = String(r.type ?? "general");
  const type: NotifType = allowed.has(typeStr) ? (typeStr as NotifType) : "general";

  return {
    id: r.id,
    type,
    read: r.read,
    createdAt: r.created_at,
    title: r.title,
    body: r.body,
    actorId,
    actorUsername,
    actorDisplayName,
    actorAvatarUrl,
    metadata: dataObj,
  };
}

export const notificationsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data: unread, error: uErr } = await ctx.supabase
      .from("in_app_notifications")
      .select(NOTIF_SELECT)
      .eq("user_id", ctx.userId)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(100);
    if (uErr && (uErr as PgError).code !== "42P01") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: uErr.message });
    }

    const { data: earlier, error: eErr } = await ctx.supabase
      .from("in_app_notifications")
      .select(NOTIF_SELECT)
      .eq("user_id", ctx.userId)
      .eq("read", true)
      .order("created_at", { ascending: false })
      .limit(50);
    if (eErr && (eErr as PgError).code !== "42P01") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: eErr.message });
    }

    const uRows = (unread ?? []) as DbNotifRow[];
    const eRows = (earlier ?? []) as DbNotifRow[];

    return {
      unread: uRows.map(mapDbRow),
      earlier: eRows.map(mapDbRow),
    };
  }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase
      .from("in_app_notifications")
      .update({ read: true })
      .eq("user_id", ctx.userId)
      .eq("read", false);
    if (error && (error as PgError).code !== "42P01") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }
    return { success: true as const };
  }),

  registerToken: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1).max(PUSH_TOKEN_MAX),
        device_id: z.string().max(DEVICE_ID_MAX).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const token = input.token.trim();
      const { error } = await ctx.supabase.from("push_tokens").upsert(
        {
          user_id: ctx.userId,
          token,
          device_id: input.device_id?.trim().slice(0, DEVICE_ID_MAX) ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,token" }
      );

      if (error) {
        if ((error as PgError).code === "42P01") {
          return { success: true, message: "Push tokens table not yet migrated; token not stored." };
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to register push token." });
      }

      await ctx.supabase.from("profiles").update({ expo_push_token: token }).eq("user_id", ctx.userId);

      return { success: true };
    }),

  updateReminderSettings: protectedProcedure
    .input(
      z.object({
        reminder_time: z.string().max(16).optional(),
        timezone: z.string().max(64).optional(),
        enabled: z.boolean().optional(),
        last_call_enabled: z.boolean().optional(),
        friend_activity_enabled: z.boolean().optional(),
        morning_kickoff_enabled: z.boolean().optional(),
        weekly_summary_enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const update: Record<string, unknown> = {};
      if (input.reminder_time !== undefined) update.reminder_time = input.reminder_time;
      if (input.timezone !== undefined) update.reminder_timezone = input.timezone;
      if (input.enabled !== undefined) update.reminder_enabled = input.enabled;
      if (input.last_call_enabled !== undefined) update.last_call_enabled = input.last_call_enabled;
      if (input.friend_activity_enabled !== undefined) update.friend_activity_enabled = input.friend_activity_enabled;
      if (input.morning_kickoff_enabled !== undefined) update.morning_kickoff_enabled = input.morning_kickoff_enabled;
      if (input.weekly_summary_enabled !== undefined) update.weekly_summary_enabled = input.weekly_summary_enabled;
      if (Object.keys(update).length === 0) return { success: true };

      const { error } = await ctx.supabase.from("profiles").update(update).eq("user_id", ctx.userId);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update reminder settings." });
      return { success: true };
    }),

  getReminderSettings: protectedProcedure.query(async ({ ctx }) => {
    const defaults = {
      reminder_time: "09:00",
      enabled: true,
      timezone: "UTC",
      last_call_enabled: true,
      friend_activity_enabled: true,
      morning_kickoff_enabled: true,
      weekly_summary_enabled: true,
    };

    try {
      // Select only columns added in repo migrations — unknown columns make PostgREST fail the whole select.
      const { data, error } = await ctx.supabase
        .from("profiles")
        .select("reminder_time, last_call_enabled, friend_activity_enabled, morning_kickoff_enabled, weekly_summary_enabled")
        .eq("user_id", ctx.userId)
        .maybeSingle();

      if (error) return defaults;

      const row = data as {
        reminder_time?: string | null;
        last_call_enabled?: boolean | null;
        friend_activity_enabled?: boolean | null;
        morning_kickoff_enabled?: boolean | null;
        weekly_summary_enabled?: boolean | null;
      } | null;

      if (!row) return defaults;

      return {
        reminder_time: row.reminder_time ?? defaults.reminder_time,
        enabled: defaults.enabled,
        timezone: defaults.timezone,
        last_call_enabled: row.last_call_enabled !== false,
        friend_activity_enabled: row.friend_activity_enabled !== false,
        morning_kickoff_enabled: row.morning_kickoff_enabled !== false,
        weekly_summary_enabled: row.weekly_summary_enabled !== false,
      };
    } catch {
      return defaults;
    }
  }),
});
