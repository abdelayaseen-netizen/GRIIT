import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { requireNoError } from "../errors";
import { getTodayDateKey } from "../../lib/date-utils";
import { logger } from "../../lib/logger";

export const teamsRouter = createTRPCRouter({
  createTeam: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(30).trim() }))
    .mutation(async ({ input, ctx }) => {
      logger.info({ userId: ctx.userId, name: input.name }, "teams.createTeam");
      const inviteCode = Math.random().toString(36).slice(2, 10).toUpperCase();
      const { data: team, error: teamErr } = await ctx.supabase
        .from("teams")
        .insert({
          name: input.name.trim(),
          invite_code: inviteCode,
          created_by: ctx.userId,
          max_members: 5,
        })
        .select("id, name, invite_code, created_by, created_at, max_members")
        .single();
      requireNoError(teamErr, "Failed to create team.");
      const { error: memberErr } = await ctx.supabase
        .from("team_members")
        .insert({ team_id: team.id, user_id: ctx.userId, role: "owner" });
      requireNoError(memberErr, "Failed to add owner to team.");
      logger.info({ teamId: team.id, inviteCode }, "teams.createTeam done");
      return { ...team, invite_code: inviteCode };
    }),

  joinTeam: protectedProcedure
    .input(z.object({ inviteCode: z.string().length(8).transform((s) => s.toUpperCase()) }))
    .mutation(async ({ input, ctx }) => {
      logger.info({ userId: ctx.userId, inviteCode: input.inviteCode }, "teams.joinTeam");
      const { data: team, error: teamErr } = await ctx.supabase
        .from("teams")
        .select("id, max_members")
        .eq("invite_code", input.inviteCode)
        .maybeSingle();
      if (teamErr || !team) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Team not found." });
      }
      const { count } = await ctx.supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("team_id", team.id);
      const maxMembers = team.max_members ?? 5;
      if ((count ?? 0) >= maxMembers) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Team is full (${maxMembers}/${maxMembers} members).`,
        });
      }
      const { error: insertErr } = await ctx.supabase
        .from("team_members")
        .insert({ team_id: team.id, user_id: ctx.userId, role: "member" });
      if (insertErr) {
        const code = (insertErr as { code?: string }).code;
        if (code === "23505") throw new TRPCError({ code: "BAD_REQUEST", message: "You are already in this team." });
        requireNoError(insertErr, "Failed to join team.");
      }
      logger.info({ teamId: team.id }, "teams.joinTeam done");
      return { teamId: team.id };
    }),

  getMyTeam: protectedProcedure.query(async ({ ctx }) => {
    logger.info({ userId: ctx.userId }, "teams.getMyTeam");
    const { data: membership, error: memErr } = await ctx.supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", ctx.userId)
      .maybeSingle();
    if (memErr || !membership) return null;
    const { data: team, error: teamErr } = await ctx.supabase
      .from("teams")
      .select("id, name, invite_code, created_by, created_at, max_members")
      .eq("id", membership.team_id)
      .single();
    requireNoError(teamErr, "Failed to load team.");
    const { data: members, error: membersErr } = await ctx.supabase
      .from("team_members")
      .select("user_id, role, joined_at")
      .eq("team_id", team.id);
    requireNoError(membersErr, "Failed to load members.");
    
    const userIds = (members ?? []).map((m: { user_id: string }) => m.user_id);
    if (userIds.length === 0) {
      return { team, members: [] };
    }

    const dateKey = getTodayDateKey();
    
    const [profilesRes, activeChallengesRes, streaksRes] = await Promise.all([
      ctx.supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds),
      ctx.supabase
        .from("active_challenges")
        .select("id, user_id")
        .in("user_id", userIds)
        .eq("status", "active"),
      ctx.supabase
        .from("streaks")
        .select("user_id, active_streak_count")
        .in("user_id", userIds),
    ]);

    const profileMap = new Map(
      (profilesRes.data ?? []).map((p: { user_id: string; username?: string | null; display_name?: string | null; avatar_url?: string | null }) => [p.user_id, p])
    );
    const streakMap = new Map(
      (streaksRes.data ?? []).map((s: { user_id: string; active_streak_count?: number }) => [s.user_id, s.active_streak_count ?? 0])
    );

    const acIds = (activeChallengesRes.data ?? []).map((r: { id: string }) => r.id);
    const todayCountMap = new Map<string, number>();

    if (acIds.length > 0) {
      const { data: checkins } = await ctx.supabase
        .from("check_ins")
        .select("active_challenge_id")
        .in("active_challenge_id", acIds)
        .eq("date_key", dateKey)
        .eq("status", "completed");

      const acToUser = new Map(
        (activeChallengesRes.data ?? []).map((r: { id: string; user_id: string }) => [r.id, r.user_id])
      );

      for (const c of checkins ?? []) {
        const userId = acToUser.get(c.active_challenge_id);
        if (userId) {
          todayCountMap.set(userId, (todayCountMap.get(userId) ?? 0) + 1);
        }
      }
    }

    const membersWithProfile = (members ?? []).map((m: { user_id: string; role: string; joined_at: string }) => {
      const profile = profileMap.get(m.user_id);
      return {
        user_id: m.user_id,
        username: profile?.username ?? null,
        display_name: profile?.display_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        role: m.role,
        joined_at: m.joined_at,
        today_completion_count: todayCountMap.get(m.user_id) ?? 0,
        current_streak: streakMap.get(m.user_id) ?? 0,
      };
    });
    return { team, members: membersWithProfile };
  }),

  leaveTeam: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      logger.info({ userId: ctx.userId, teamId: input.teamId }, "teams.leaveTeam");
      const { error } = await ctx.supabase
        .from("team_members")
        .delete()
        .eq("team_id", input.teamId)
        .eq("user_id", ctx.userId);
      requireNoError(error, "Failed to leave team.");
      logger.info({ teamId: input.teamId }, "teams.leaveTeam done");
      return { success: true };
    }),

  getTeamFeed: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: membership } = await ctx.supabase
        .from("team_members")
        .select("team_id")
        .eq("team_id", input.teamId)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this team." });
      const { data: members } = await ctx.supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", input.teamId);
      const userIds = (members ?? []).map((m: { user_id: string }) => m.user_id);
      if (userIds.length === 0) return [];
      const { data: acList } = await ctx.supabase
        .from("active_challenges")
        .select("id, user_id")
        .in("user_id", userIds)
        .eq("status", "active");
      const acIds = (acList ?? []).map((r: { id: string }) => r.id);
      if (acIds.length === 0) return [];
      const { data: checkins, error } = await ctx.supabase
        .from("check_ins")
        .select("id, active_challenge_id, task_id, user_id, created_at")
        .in("active_challenge_id", acIds)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(20);
      requireNoError(error, "Failed to load team feed.");
      const acByUser = (acList ?? []).reduce((acc: Record<string, string>, r: { id: string; user_id: string }) => {
        acc[r.id] = r.user_id;
        return acc;
      }, {});
      const feed = await Promise.all(
        (checkins ?? []).map(async (c: { id: string; active_challenge_id: string; task_id: string; created_at: string }) => {
          const userId = acByUser[c.active_challenge_id];
          const { data: profile } = await ctx.supabase
            .from("profiles")
            .select("username, display_name")
            .eq("user_id", userId)
            .maybeSingle();
          const { data: task } = await ctx.supabase
            .from("challenge_tasks")
            .select("title")
            .eq("id", c.task_id)
            .maybeSingle();
          return {
            id: c.id,
            user_id: userId,
            username: (profile as { username?: string })?.username ?? "user",
            display_name: (profile as { display_name?: string })?.display_name ?? null,
            task_title: (task as { title?: string })?.title ?? "Task",
            created_at: c.created_at,
          };
        })
      );
      return feed;
    }),
});
