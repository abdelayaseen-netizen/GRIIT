import * as z from "zod";
import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { joinChallengeDirect } from "../../lib/join-challenge";
import { getSupabaseServer } from "../../lib/supabase-server";
import { sendPushToProfile } from "../../lib/sendPush";
import { logger } from "../../lib/logger";
import {
  GROUP_FULL_MESSAGE,
  GROUP_MAX_MEMBERS,
  computeGroupStreak,
  dateKeyFromJoinedAt,
  groupStreakBrokeBy,
  memberSecuredFromCheckIns,
  memberYesterdayState,
} from "../../lib/group-challenges";
import { addCalendarDaysToDateKey, getTodayDateKey } from "../../lib/date-utils";
import { canViewChallenge, PRIVATE_CHALLENGE_MESSAGE } from "../../lib/can-view-challenge";

type ChallengeInviteRow = {
  id: string;
  challenge_id: string;
  invited_by: string;
  invited_user_id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
};

type ChallengeRow = {
  id: string;
  title?: string | null;
  creator_id: string;
  participation_type?: string | null;
  run_status?: string | null;
  visibility?: string | null;
  status?: string | null;
};

function challengeReader(userClient: SupabaseClient): SupabaseClient {
  return getSupabaseServer() ?? userClient;
}

async function loadTeamChallenge(
  supabase: SupabaseClient,
  challengeId: string
): Promise<ChallengeRow> {
  const { data, error } = await supabase
    .from("challenges")
    .select("id, title, creator_id, participation_type, run_status, visibility, status")
    .eq("id", challengeId)
    .maybeSingle();
  if (error || !data) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
  }
  const row = data as ChallengeRow;
  if (row.participation_type !== "team") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Not a group challenge." });
  }
  return row;
}

async function requireActiveMember(
  supabase: SupabaseClient,
  challengeId: string,
  userId: string
): Promise<void> {
  const { data } = await supabase
    .from("challenge_members")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (!data) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this group." });
  }
}

async function occupiedSeats(
  supabase: SupabaseClient,
  challengeId: string
): Promise<number> {
  const [{ count: enrolled }, { count: pending }] = await Promise.all([
    supabase
      .from("challenge_members")
      .select("id", { count: "exact", head: true })
      .eq("challenge_id", challengeId)
      .eq("status", "active"),
    supabase
      .from("challenge_invites")
      .select("id", { count: "exact", head: true })
      .eq("challenge_id", challengeId)
      .eq("status", "pending"),
  ]);
  return (enrolled ?? 0) + (pending ?? 0);
}

async function insertInviteNotification(
  supabase: SupabaseClient,
  input: {
    inviteeId: string;
    inviterId: string;
    inviterName: string;
    challengeId: string;
    challengeTitle: string;
    inviteId: string;
  }
): Promise<void> {
  const body = `${input.inviterName} invited you to ${input.challengeTitle}`;
  const payload = {
    user_id: input.inviteeId,
    type: "challenge_invite",
    title: "Group invite",
    body,
    read: false,
    data: {
      type: "challenge_invite",
      challengeId: input.challengeId,
      inviteId: input.inviteId,
      inviterId: input.inviterId,
    },
  };
  const { error } = await supabase.from("in_app_notifications").insert(payload);
  if (error) {
    logger.error({ err: error }, "[groups.invite] notification insert failed");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to send invite notification.",
    });
  }
}

async function enrollInvitee(
  supabase: SupabaseClient,
  userId: string,
  challengeId: string
): Promise<void> {
  const { data: existing } = await supabase
    .from("challenge_members")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!existing) {
    const { error } = await supabase.from("challenge_members").insert({
      challenge_id: challengeId,
      user_id: userId,
      role: "member",
      status: "active",
    });
    if (error && (error as { code?: string }).code !== "23505") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to join group." });
    }
  }
  try {
    await joinChallengeDirect(supabase, userId, challengeId);
  } catch (err) {
    if (
      err instanceof TRPCError &&
      (err.message === "You have already joined this challenge." ||
        err.message === "You're already in this challenge.")
    ) {
      return;
    }
    throw err;
  }
}

export const groupsRouter = createTRPCRouter({
  invite: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid(), userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Use the share link to invite yourself." });
      }
      const challenge = await loadTeamChallenge(challengeReader(ctx.supabase), input.challengeId);
      if (challenge.run_status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This group is not active." });
      }
      await requireActiveMember(ctx.supabase, input.challengeId, ctx.userId);

      const { data: alreadyMember } = await ctx.supabase
        .from("challenge_members")
        .select("id")
        .eq("challenge_id", input.challengeId)
        .eq("user_id", input.userId)
        .eq("status", "active")
        .maybeSingle();
      if (alreadyMember) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "That person is already in this group." });
      }

      const { data: inviteeRow } = await ctx.supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", input.userId)
        .maybeSingle();
      if (!inviteeRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      const { data: existingInvite } = await ctx.supabase
        .from("challenge_invites")
        .select("id, status")
        .eq("challenge_id", input.challengeId)
        .eq("invited_user_id", input.userId)
        .maybeSingle();
      const existing = existingInvite as { id: string; status: string } | null;
      if (existing?.status === "pending") {
        return { inviteId: existing.id, status: "pending" as const };
      }

      const seats = await occupiedSeats(ctx.supabase, input.challengeId);
      if (seats >= GROUP_MAX_MEMBERS) {
        throw new TRPCError({ code: "FORBIDDEN", message: GROUP_FULL_MESSAGE });
      }

      let invite: ChallengeInviteRow | null = null;
      if (existing) {
        // RLS only allows invitee accept/decline or inviter cancel — re-pending uses service role.
        const service = getSupabaseServer() ?? ctx.supabase;
        const { data, error } = await service
          .from("challenge_invites")
          .update({
            invited_by: ctx.userId,
            status: "pending",
            responded_at: null,
          })
          .eq("id", existing.id)
          .select("id, challenge_id, invited_by, invited_user_id, status, created_at, responded_at")
          .single();
        if (error || !data) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send invite." });
        }
        invite = data as ChallengeInviteRow;
      } else {
        const { data, error } = await ctx.supabase
          .from("challenge_invites")
          .insert({
            challenge_id: input.challengeId,
            invited_by: ctx.userId,
            invited_user_id: input.userId,
            status: "pending",
          })
          .select("id, challenge_id, invited_by, invited_user_id, status, created_at, responded_at")
          .single();
        if (error || !data) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send invite." });
        }
        invite = data as ChallengeInviteRow;
      }

      const { data: inviterRow } = await ctx.supabase
        .from("profiles")
        .select("display_name, username")
        .eq("user_id", ctx.userId)
        .maybeSingle();
      const inviter = inviterRow as { display_name?: string | null; username?: string | null } | null;
      const inviterName = inviter?.display_name ?? inviter?.username ?? "Someone";
      const title = challenge.title?.trim() || "a group challenge";
      await insertInviteNotification(ctx.supabase, {
        inviteeId: input.userId,
        inviterId: ctx.userId,
        inviterName,
        challengeId: input.challengeId,
        challengeTitle: title,
        inviteId: invite.id,
      });
      try {
        await sendPushToProfile(ctx.supabase, input.userId, {
          title: "GRIIT",
          body: `${inviterName} invited you to ${title}`,
          data: { type: "challenge_invite", challengeId: input.challengeId, inviteId: invite.id },
        });
      } catch (pushErr) {
        logger.error({ err: pushErr }, "[groups.invite] push failed");
      }

      return { inviteId: invite.id, status: "pending" as const };
    }),

  respond: protectedProcedure
    .input(z.object({ inviteId: z.string().uuid(), action: z.enum(["accept", "decline"]) }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("challenge_invites")
        .select("id, challenge_id, invited_by, invited_user_id, status, created_at, responded_at")
        .eq("id", input.inviteId)
        .maybeSingle();
      if (error || !data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found." });
      }
      const invite = data as ChallengeInviteRow;
      if (invite.invited_user_id !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the invitee can respond." });
      }
      if (invite.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This invite is no longer pending." });
      }

      const now = new Date().toISOString();
      if (input.action === "decline") {
        const { error: updErr } = await ctx.supabase
          .from("challenge_invites")
          .update({ status: "declined", responded_at: now })
          .eq("id", invite.id);
        if (updErr) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to decline invite." });
        }
        return { status: "declined" as const };
      }

      const reader = challengeReader(ctx.supabase);
      const challenge = await loadTeamChallenge(reader, invite.challenge_id);
      const mayView = await canViewChallenge(reader, ctx.userId, challenge);
      if (!mayView) {
        throw new TRPCError({ code: "FORBIDDEN", message: PRIVATE_CHALLENGE_MESSAGE });
      }
      if (challenge.run_status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This group is not active." });
      }
      const seats = await occupiedSeats(ctx.supabase, invite.challenge_id);
      const { data: already } = await ctx.supabase
        .from("challenge_members")
        .select("id")
        .eq("challenge_id", invite.challenge_id)
        .eq("user_id", ctx.userId)
        .eq("status", "active")
        .maybeSingle();
      if (!already && seats >= GROUP_MAX_MEMBERS) {
        throw new TRPCError({ code: "FORBIDDEN", message: GROUP_FULL_MESSAGE });
      }

      await enrollInvitee(ctx.supabase, ctx.userId, invite.challenge_id);
      const { error: accErr } = await ctx.supabase
        .from("challenge_invites")
        .update({ status: "accepted", responded_at: now })
        .eq("id", invite.id);
      if (accErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to accept invite." });
      }
      return { status: "accepted" as const };
    }),

  cancel: protectedProcedure
    .input(z.object({ inviteId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from("challenge_invites")
        .select("id, invited_by, status")
        .eq("id", input.inviteId)
        .maybeSingle();
      if (error || !data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invite not found." });
      }
      const invite = data as { id: string; invited_by: string; status: string };
      if (invite.invited_by !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the inviter can cancel." });
      }
      if (invite.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This invite is no longer pending." });
      }
      const { error: updErr } = await ctx.supabase
        .from("challenge_invites")
        .update({ status: "cancelled", responded_at: new Date().toISOString() })
        .eq("id", invite.id);
      if (updErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to cancel invite." });
      }
      return { status: "cancelled" as const };
    }),

  openLink: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const challenge = await loadTeamChallenge(challengeReader(ctx.supabase), input.challengeId);
      if (challenge.run_status !== "active") {
        return { state: "ended" as const };
      }

      const { data: alreadyMember } = await ctx.supabase
        .from("challenge_members")
        .select("id")
        .eq("challenge_id", input.challengeId)
        .eq("user_id", ctx.userId)
        .eq("status", "active")
        .maybeSingle();
      if (alreadyMember) {
        const { data: existing } = await ctx.supabase
          .from("challenge_invites")
          .select("id, challenge_id, invited_by, invited_user_id, status, created_at, responded_at")
          .eq("challenge_id", input.challengeId)
          .eq("invited_user_id", ctx.userId)
          .maybeSingle();
        return {
          invite: (existing as ChallengeInviteRow | null) ?? {
            id: "",
            challenge_id: input.challengeId,
            invited_by: challenge.creator_id,
            invited_user_id: ctx.userId,
            status: "accepted",
            created_at: new Date().toISOString(),
            responded_at: new Date().toISOString(),
          },
        };
      }

      const { data: existingInvite } = await ctx.supabase
        .from("challenge_invites")
        .select("id, challenge_id, invited_by, invited_user_id, status, created_at, responded_at")
        .eq("challenge_id", input.challengeId)
        .eq("invited_user_id", ctx.userId)
        .maybeSingle();
      const existing = existingInvite as ChallengeInviteRow | null;
      if (existing?.status === "pending") {
        return { invite: existing };
      }

      const seats = await occupiedSeats(ctx.supabase, input.challengeId);
      if (seats >= GROUP_MAX_MEMBERS) {
        return { state: "full" as const };
      }

      // RLS insert requires auth.uid() = invited_by and active membership.
      // A link self-invite is invited_by = creator, inserter = viewer (non-member).
      const service = getSupabaseServer();
      if (!service) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not open invite link.",
        });
      }
      const invites = service.from("challenge_invites") as unknown as {
        insert: (row: Record<string, unknown>) => {
          select: (cols: string) => {
            single: () => Promise<{ data: ChallengeInviteRow | null; error: { message?: string } | null }>;
          };
        };
        update: (row: Record<string, unknown>) => {
          eq: (col: string, val: string) => {
            select: (cols: string) => {
              single: () => Promise<{ data: ChallengeInviteRow | null; error: { message?: string } | null }>;
            };
          };
        };
      };

      if (existing) {
        const { data, error } = await invites
          .update({
            invited_by: challenge.creator_id,
            status: "pending",
            responded_at: null,
          })
          .eq("id", existing.id)
          .select("id, challenge_id, invited_by, invited_user_id, status, created_at, responded_at")
          .single();
        if (error || !data) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not open invite link." });
        }
        return { invite: data };
      }

      const { data, error } = await invites
        .insert({
          challenge_id: input.challengeId,
          invited_by: challenge.creator_id,
          invited_user_id: ctx.userId,
          status: "pending",
        })
        .select("id, challenge_id, invited_by, invited_user_id, status, created_at, responded_at")
        .single();
      if (error || !data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not open invite link." });
      }
      return { invite: data };
    }),

  members: protectedProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      await loadTeamChallenge(challengeReader(ctx.supabase), input.challengeId);
      await requireActiveMember(ctx.supabase, input.challengeId, ctx.userId);

      const { data: memberRows } = await ctx.supabase
        .from("challenge_members")
        .select("user_id, role, status, joined_at")
        .eq("challenge_id", input.challengeId)
        .eq("status", "active")
        .order("joined_at", { ascending: true })
        .limit(GROUP_MAX_MEMBERS);
      const members = (memberRows ?? []) as {
        user_id: string;
        role: string;
        status: string;
        joined_at: string;
      }[];

      const { data: pendingRows } = await ctx.supabase
        .from("challenge_invites")
        .select("id, invited_by, invited_user_id, status, created_at")
        .eq("challenge_id", input.challengeId)
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(GROUP_MAX_MEMBERS);
      const pending = (pendingRows ?? []) as {
        id: string;
        invited_by: string;
        invited_user_id: string;
        status: string;
        created_at: string;
      }[];

      const profileIds = [
        ...new Set([
          ...members.map((m) => m.user_id),
          ...pending.map((p) => p.invited_user_id),
          ...pending.map((p) => p.invited_by),
        ]),
      ];
      const { data: profiles } =
        profileIds.length > 0
          ? await ctx.supabase
              .from("profiles")
              .select("user_id, display_name, username, avatar_url, timezone, reminder_timezone")
              .in("user_id", profileIds)
              .limit(50)
          : { data: [] };
      const profileMap = new Map(
        ((profiles ?? []) as {
          user_id: string;
          display_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          reminder_timezone?: string | null;
        }[]).map((p) => [p.user_id, p])
      );

      const { data: streakRows } =
        members.length > 0
          ? await ctx.supabase
              .from("streaks")
              .select("user_id, active_streak_count")
              .in("user_id", members.map((m) => m.user_id))
              .limit(GROUP_MAX_MEMBERS)
          : { data: [] };
      const streakMap = new Map(
        ((streakRows ?? []) as { user_id: string; active_streak_count?: number | null }[]).map((s) => [
          s.user_id,
          s.active_streak_count ?? 0,
        ])
      );

      const { data: secureRows } =
        members.length > 0
          ? await ctx.supabase
              .from("day_secures")
              .select("user_id, date_key")
              .in(
                "user_id",
                members.map((m) => m.user_id)
              )
              .limit(4000)
          : { data: [] };
      const securedKeysByUser = new Map<string, Set<string>>();
      for (const row of (secureRows ?? []) as { user_id: string; date_key: string }[]) {
        if (!securedKeysByUser.has(row.user_id)) securedKeysByUser.set(row.user_id, new Set());
        securedKeysByUser.get(row.user_id)!.add(row.date_key);
      }

      const enrolledBase = members.map((m) => {
        const p = profileMap.get(m.user_id);
        const tz = p?.timezone ?? p?.reminder_timezone ?? "UTC";
        const todayKey = getTodayDateKey(tz);
        return {
          userId: m.user_id,
          displayName: p?.display_name ?? p?.username ?? "Member",
          avatar: p?.avatar_url ?? null,
          role: m.role,
          currentStreak: streakMap.get(m.user_id) ?? 0,
          todayKey,
          joinedAt: m.joined_at,
          joinedDateKey: dateKeyFromJoinedAt(m.joined_at, tz),
        };
      });

      const reader = challengeReader(ctx.supabase);
      const { data: taskRows } = await reader
        .from("challenge_tasks")
        .select("id")
        .eq("challenge_id", input.challengeId)
        .limit(50);
      const requiredTaskIds = ((taskRows ?? []) as { id: string }[]).map((t) => t.id);
      const { data: enrollmentRows } = await reader
        .from("active_challenges")
        .select("id, user_id")
        .eq("challenge_id", input.challengeId)
        .in("user_id", members.map((m) => m.user_id))
        .limit(GROUP_MAX_MEMBERS);
      const enrollmentByUser = new Map(
        ((enrollmentRows ?? []) as { id: string; user_id: string }[]).map((row) => [row.user_id, row.id]),
      );
      const enrollmentIds = [...enrollmentByUser.values()];
      const { data: checkRows } =
        enrollmentIds.length > 0
          ? await reader
              .from("check_ins")
              .select("active_challenge_id, task_id, date_key, status")
              .in("active_challenge_id", enrollmentIds)
              .eq("status", "completed")
              .limit(500)
          : { data: [] };
      const completedByEnrollment = new Map<string, Map<string, Set<string>>>();
      for (const row of (checkRows ?? []) as {
        active_challenge_id: string;
        task_id: string;
        date_key: string;
        status: string;
      }[]) {
        if (!completedByEnrollment.has(row.active_challenge_id)) {
          completedByEnrollment.set(row.active_challenge_id, new Map());
        }
        const byDate = completedByEnrollment.get(row.active_challenge_id)!;
        if (!byDate.has(row.date_key)) byDate.set(row.date_key, new Set());
        byDate.get(row.date_key)!.add(row.task_id);
      }

      const enrolled = enrolledBase.map((m) => {
        const enrollmentId = enrollmentByUser.get(m.userId);
        const completed = enrollmentId
          ? [...(completedByEnrollment.get(enrollmentId)?.get(m.todayKey) ?? [])]
          : [];
        const progress = memberSecuredFromCheckIns({
          requiredTaskIds,
          completedTaskIds: completed,
        });
        return {
          ...m,
          securedToday: progress.secured,
          tasksDone: progress.done,
          tasksTotal: progress.total,
        };
      });

      enrolled.sort((a, b) => {
        if (a.userId === ctx.userId) return -1;
        if (b.userId === ctx.userId) return 1;
        return a.displayName.localeCompare(b.displayName);
      });

      const pendingInvites = pending.map((inv) => {
        const invitee = profileMap.get(inv.invited_user_id);
        const inviter = profileMap.get(inv.invited_by);
        return {
          inviteId: inv.id,
          userId: inv.invited_user_id,
          displayName: invitee?.display_name ?? invitee?.username ?? "Invited",
          avatar: invitee?.avatar_url ?? null,
          inviter: {
            userId: inv.invited_by,
            displayName: inviter?.display_name ?? inviter?.username ?? "Member",
          },
          createdAt: inv.created_at,
        };
      });

      const viewer = profileMap.get(ctx.userId);
      const todayKey = getTodayDateKey(viewer?.timezone ?? viewer?.reminder_timezone ?? "UTC");
      const yesterdayKey = addCalendarDaysToDateKey(todayKey, -1);
      const groupMembers = enrolled.map((m) => ({
        userId: m.userId,
        joinedDateKey: m.joinedDateKey,
        displayName: m.displayName,
      }));
      const groupStreak = computeGroupStreak({
        todayKey,
        members: groupMembers,
        securedKeysByUser,
      });

      return {
        cap: GROUP_MAX_MEMBERS,
        groupStreak,
        groupStreakBrokeBy: groupStreakBrokeBy({
          todayKey,
          members: groupMembers,
          securedKeysByUser,
        }),
        members: enrolled.map(({ joinedDateKey: _joinedDateKey, todayKey: _todayKey, ...rest }) => ({
          ...rest,
          yesterdayState: memberYesterdayState(securedKeysByUser.get(rest.userId), yesterdayKey),
        })),
        pendingInvites,
      };
    }),
});
