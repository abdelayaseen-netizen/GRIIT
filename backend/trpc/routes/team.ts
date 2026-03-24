import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { generateTeamCode } from "../../../lib/team-code";

const createTeamSchema = z.object({
  name: z.string().min(3).max(30).trim(),
  challenge_id: z.string().uuid(),
  max_members: z.number().int().min(2).max(5).default(5),
  goal_mode: z.enum(["individual", "shared"]),
});

const joinByCodeSchema = z.object({
  team_code: z.string().length(6).regex(/^[A-Z0-9]+$/, "Invalid team code format"),
});

const joinByLinkSchema = z.object({
  team_id: z.string().uuid(),
  invite_id: z.string().uuid().optional(),
});

const teamIdSchema = z.object({
  team_id: z.string().uuid(),
});

const kickSchema = z.object({
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

const challengeIdSchema = z.object({
  challenge_id: z.string().uuid(),
});

type TeamRow = {
  id: string;
  name: string;
  challenge_id: string;
  creator_id: string;
  team_code: string;
  max_members: number;
  goal_mode: "individual" | "shared";
  status: "active" | "completed" | "abandoned";
  created_at: string;
  updated_at: string;
};

type MemberRow = {
  id: string;
  team_id: string;
  user_id: string;
  role: "creator" | "member";
  joined_at: string;
  profiles?: { display_name?: string | null; avatar_url?: string | null; username?: string | null } | null;
};

async function getTeamMemberCount(ctx: { supabase: any }, teamId: string): Promise<number> {
  const { count, error } = await ctx.supabase
    .from("team_members")
    .select("id", { head: true, count: "exact" })
    .eq("team_id", teamId);
  if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
  return count ?? 0;
}

async function getTeamWithMembers(ctx: { supabase: any }, teamId: string) {
  const { data: team, error: teamError } = await ctx.supabase
    .from("teams")
    .select("id, name, challenge_id, creator_id, team_code, max_members, goal_mode, status, created_at, updated_at")
    .eq("id", teamId)
    .maybeSingle();
  if (teamError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: teamError.message });
  if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Team not found or no longer active" });

  const { data: members, error: membersError } = await ctx.supabase
    .from("team_members")
    .select("id, team_id, user_id, role, joined_at, profiles(display_name, avatar_url, username)")
    .eq("team_id", teamId)
    .order("joined_at", { ascending: true });
  if (membersError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: membersError.message });

  return {
    ...(team as TeamRow),
    members: (members ?? []) as MemberRow[],
    member_count: (members ?? []).length,
  };
}

type MemberWithStats = MemberRow & {
  tasks_completed: number;
  current_streak: number;
  completion_pct: number;
};

async function getMembersWithStats(ctx: { supabase: any; userId: string }, teamId: string): Promise<MemberWithStats[]> {
  const { data: me, error: meError } = await ctx.supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", ctx.userId)
    .maybeSingle();
  if (meError && meError.code !== "PGRST116") {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: meError.message });
  }
  if (!me) throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this team" });

  const { data: team, error: teamError } = await ctx.supabase
    .from("teams")
    .select("challenge_id")
    .eq("id", teamId)
    .single();
  if (teamError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: teamError.message });

  const [membersRes, activeRes] = await Promise.all([
    ctx.supabase
      .from("team_members")
      .select("id, team_id, user_id, role, joined_at, profiles(display_name, avatar_url, username)")
      .eq("team_id", teamId),
    ctx.supabase
      .from("active_challenges")
      .select("id, user_id")
      .eq("challenge_id", team.challenge_id),
  ]);
  if (membersRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: membersRes.error.message });
  if (activeRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: activeRes.error.message });

  const members = (membersRes.data ?? []) as MemberRow[];
  const activeRows = (activeRes.data ?? []) as { id: string; user_id: string }[];
  const activeIds = activeRows.map((r) => r.id);
  const activeByUser = new Map(activeRows.map((r) => [r.user_id, r.id]));

  const [checkinsRes, streaksRes, tasksRes] = await Promise.all([
    activeIds.length
      ? ctx.supabase
          .from("check_ins")
          .select("active_challenge_id")
          .in("active_challenge_id", activeIds)
          .eq("status", "completed")
      : Promise.resolve({ data: [], error: null } as any),
    ctx.supabase
      .from("streaks")
      .select("user_id, active_streak_count")
      .in("user_id", members.map((m) => m.user_id)),
    ctx.supabase
      .from("challenge_tasks")
      .select("id")
      .eq("challenge_id", team.challenge_id),
  ]);
  if (checkinsRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: checkinsRes.error.message });
  if (streaksRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: streaksRes.error.message });
  if (tasksRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tasksRes.error.message });

  const totalTasks = Math.max(1, (tasksRes.data ?? []).length);
  const completedByActive = new Map<string, number>();
  for (const row of (checkinsRes.data ?? []) as { active_challenge_id: string }[]) {
    completedByActive.set(row.active_challenge_id, (completedByActive.get(row.active_challenge_id) ?? 0) + 1);
  }
  const streakByUser = new Map(
    ((streaksRes.data ?? []) as { user_id: string; active_streak_count?: number | null }[]).map((s) => [s.user_id, s.active_streak_count ?? 0])
  );

  return members
    .map((m) => {
      const activeId = activeByUser.get(m.user_id);
      const tasksCompleted = activeId ? completedByActive.get(activeId) ?? 0 : 0;
      return {
        ...m,
        tasks_completed: tasksCompleted,
        current_streak: streakByUser.get(m.user_id) ?? 0,
        completion_pct: Math.round((tasksCompleted / totalTasks) * 100),
      };
    })
    .sort((a, b) => {
      if (a.role === "creator" && b.role !== "creator") return -1;
      if (b.role === "creator" && a.role !== "creator") return 1;
      return (b.current_streak ?? 0) - (a.current_streak ?? 0);
    });
}

export const teamRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTeamSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: challenge, error: challengeError } = await ctx.supabase
        .from("challenges")
        .select("id")
        .eq("id", input.challenge_id)
        .maybeSingle();
      if (challengeError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: challengeError.message });
      if (!challenge) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });

      const { data: alreadyInTeam, error: alreadyInTeamError } = await ctx.supabase
        .from("team_members")
        .select("id, teams!inner(challenge_id)")
        .eq("user_id", ctx.userId)
        .eq("teams.challenge_id", input.challenge_id)
        .maybeSingle();
      if (alreadyInTeamError && alreadyInTeamError.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: alreadyInTeamError.message });
      }
      if (alreadyInTeam?.id) throw new TRPCError({ code: "BAD_REQUEST", message: "You are already in a team for this challenge" });

      let createdTeam: TeamRow | null = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const teamCode = generateTeamCode();
        const { data: team, error } = await ctx.supabase
          .from("teams")
          .insert({
            name: input.name.trim(),
            challenge_id: input.challenge_id,
            creator_id: ctx.userId,
            team_code: teamCode,
            max_members: input.max_members,
            goal_mode: input.goal_mode,
            status: "active",
          })
          .select("id, name, challenge_id, creator_id, team_code, max_members, goal_mode, status, created_at, updated_at")
          .single();
        if (error) {
          if (error.code === "23505") continue;
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
        }
        createdTeam = team as TeamRow;
        break;
      }
      if (!createdTeam) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate unique team code" });
      }

      const { error: memberError } = await ctx.supabase.from("team_members").insert({
        team_id: createdTeam.id,
        user_id: ctx.userId,
        role: "creator",
      });
      if (memberError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: memberError.message });

      return createdTeam;
    }),

  joinByCode: protectedProcedure
    .input(joinByCodeSchema)
    .mutation(async ({ input, ctx }) => {
      const normalized = input.team_code.trim().toUpperCase();
      if (!/^[A-Z0-9]{6}$/.test(normalized)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid team code" });
      }

      const { data: team, error: teamError } = await ctx.supabase
        .from("teams")
        .select("id, name, challenge_id, creator_id, team_code, max_members, goal_mode, status, created_at, updated_at")
        .eq("team_code", normalized)
        .eq("status", "active")
        .maybeSingle();
      if (teamError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: teamError.message });
      if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Team not found or no longer active" });

      const currentCount = await getTeamMemberCount(ctx, team.id);
      if (currentCount >= (team.max_members ?? 5)) throw new TRPCError({ code: "BAD_REQUEST", message: "This team is full" });

      const { data: exists, error: existsError } = await ctx.supabase
        .from("team_members")
        .select("id")
        .eq("team_id", team.id)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (existsError && existsError.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: existsError.message });
      }
      if (exists?.id) throw new TRPCError({ code: "BAD_REQUEST", message: "You are already in this team" });

      const { error: insertError } = await ctx.supabase.from("team_members").insert({
        team_id: team.id,
        user_id: ctx.userId,
        role: "member",
      });
      if (insertError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: insertError.message });

      const { error: inviteError } = await ctx.supabase.from("team_invites").insert({
        team_id: team.id,
        invited_by: team.creator_id,
        invited_user_id: ctx.userId,
        invite_type: "code",
        status: "accepted",
      });
      if (inviteError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: inviteError.message });

      return getTeamWithMembers(ctx, team.id);
    }),

  joinByLink: protectedProcedure
    .input(joinByLinkSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: team, error: teamError } = await ctx.supabase
        .from("teams")
        .select("id, name, challenge_id, creator_id, team_code, max_members, goal_mode, status, created_at, updated_at")
        .eq("id", input.team_id)
        .eq("status", "active")
        .maybeSingle();
      if (teamError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: teamError.message });
      if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Team not found or no longer active" });

      const currentCount = await getTeamMemberCount(ctx, team.id);
      if (currentCount >= (team.max_members ?? 5)) throw new TRPCError({ code: "BAD_REQUEST", message: "This team is full" });

      const { data: exists, error: existsError } = await ctx.supabase
        .from("team_members")
        .select("id")
        .eq("team_id", team.id)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (existsError && existsError.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: existsError.message });
      }
      if (exists?.id) throw new TRPCError({ code: "BAD_REQUEST", message: "You are already in this team" });

      const { error: joinError } = await ctx.supabase.from("team_members").insert({
        team_id: team.id,
        user_id: ctx.userId,
        role: "member",
      });
      if (joinError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: joinError.message });

      if (input.invite_id) {
        const { error: inviteUpdateError } = await ctx.supabase
          .from("team_invites")
          .update({ status: "accepted", invited_user_id: ctx.userId })
          .eq("id", input.invite_id)
          .eq("team_id", team.id);
        if (inviteUpdateError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: inviteUpdateError.message });
      } else {
        const { error: inviteCreateError } = await ctx.supabase.from("team_invites").insert({
          team_id: team.id,
          invited_by: team.creator_id,
          invited_user_id: ctx.userId,
          invite_type: "link",
          status: "accepted",
        });
        if (inviteCreateError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: inviteCreateError.message });
      }

      return getTeamWithMembers(ctx, team.id);
    }),

  leave: protectedProcedure
    .input(teamIdSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: me, error: meError } = await ctx.supabase
        .from("team_members")
        .select("id, role, joined_at")
        .eq("team_id", input.team_id)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (meError && meError.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: meError.message });
      }
      if (!me) throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this team" });

      const { data: others, error: othersError } = await ctx.supabase
        .from("team_members")
        .select("user_id, joined_at")
        .eq("team_id", input.team_id)
        .neq("user_id", ctx.userId)
        .order("joined_at", { ascending: true });
      if (othersError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: othersError.message });

      if (me.role === "creator") {
        if ((others ?? []).length > 0) {
          const nextCreator = others?.[0];
          if (nextCreator?.user_id) {
            const { error: promoteError } = await ctx.supabase
              .from("team_members")
              .update({ role: "creator" })
              .eq("team_id", input.team_id)
              .eq("user_id", nextCreator.user_id);
            if (promoteError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: promoteError.message });
          }
        } else {
          const { error: abandonError } = await ctx.supabase
            .from("teams")
            .update({ status: "abandoned" })
            .eq("id", input.team_id);
          if (abandonError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: abandonError.message });
        }
      }

      const { error: leaveError } = await ctx.supabase
        .from("team_members")
        .delete()
        .eq("team_id", input.team_id)
        .eq("user_id", ctx.userId);
      if (leaveError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: leaveError.message });
      return { success: true as const };
    }),

  kick: protectedProcedure
    .input(kickSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: me, error: meError } = await ctx.supabase
        .from("team_members")
        .select("role")
        .eq("team_id", input.team_id)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (meError && meError.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: meError.message });
      }
      if (me?.role !== "creator") throw new TRPCError({ code: "FORBIDDEN", message: "Only the team creator can remove members" });
      if (input.user_id === ctx.userId) throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot remove yourself — use leave instead" });

      const { data: target, error: targetError } = await ctx.supabase
        .from("team_members")
        .select("id, role")
        .eq("team_id", input.team_id)
        .eq("user_id", input.user_id)
        .maybeSingle();
      if (targetError && targetError.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: targetError.message });
      }
      if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "User is not a member of this team" });
      if (target.role === "creator") throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot remove yourself — use leave instead" });

      const { error: deleteError } = await ctx.supabase
        .from("team_members")
        .delete()
        .eq("team_id", input.team_id)
        .eq("user_id", input.user_id);
      if (deleteError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: deleteError.message });
      return getTeamWithMembers(ctx, input.team_id);
    }),

  getMembers: protectedProcedure
    .input(teamIdSchema)
    .query(async ({ input, ctx }) => getMembersWithStats(ctx as any, input.team_id)),

  getLeaderboard: protectedProcedure
    .input(teamIdSchema)
    .query(async ({ input, ctx }) => {
      const { data: me, error: meError } = await ctx.supabase
        .from("team_members")
        .select("id")
        .eq("team_id", input.team_id)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (meError && meError.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: meError.message });
      }
      if (!me) throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this team" });

      const { data: team, error: teamError } = await ctx.supabase
        .from("teams")
        .select("goal_mode")
        .eq("id", input.team_id)
        .single();
      if (teamError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: teamError.message });

      const members: MemberWithStats[] = await getMembersWithStats(ctx as any, input.team_id);
      const sorted: MemberWithStats[] = [...members].sort((a, b) => {
        if (team.goal_mode === "shared") {
          return (b.tasks_completed ?? 0) - (a.tasks_completed ?? 0);
        }
        if ((b.current_streak ?? 0) !== (a.current_streak ?? 0)) {
          return (b.current_streak ?? 0) - (a.current_streak ?? 0);
        }
        return (b.tasks_completed ?? 0) - (a.tasks_completed ?? 0);
      });

      return sorted.map((member: MemberWithStats, idx: number) => ({ ...member, rank: idx + 1 }));
    }),

  generateInviteLink: protectedProcedure
    .input(teamIdSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: member, error: memberError } = await ctx.supabase
        .from("team_members")
        .select("id")
        .eq("team_id", input.team_id)
        .eq("user_id", ctx.userId)
        .maybeSingle();
      if (memberError && memberError.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: memberError.message });
      }
      if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this team" });

      const { data: team, error: teamError } = await ctx.supabase
        .from("teams")
        .select("team_code")
        .eq("id", input.team_id)
        .single();
      if (teamError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: teamError.message });

      const { data: invite, error: inviteError } = await ctx.supabase
        .from("team_invites")
        .insert({
          team_id: input.team_id,
          invited_by: ctx.userId,
          invite_type: "link",
          status: "pending",
        })
        .select("id")
        .single();
      if (inviteError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: inviteError.message });

      const deepLink = `griit://join-team?team_id=${input.team_id}&invite_id=${invite.id}`;
      const webLink = `https://griit.fit/join-team?team_id=${input.team_id}&invite_id=${invite.id}`;
      return { deepLink, webLink, teamCode: team.team_code };
    }),

  getMyTeams: protectedProcedure
    .query(async ({ ctx }) => {
      const { data: memberships, error: membershipError } = await ctx.supabase
        .from("team_members")
        .select("team_id, joined_at")
        .eq("user_id", ctx.userId)
        .order("joined_at", { ascending: false });
      if (membershipError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: membershipError.message });

      const teamIds = (memberships ?? []).map((m: { team_id: string }) => m.team_id);
      if (teamIds.length === 0) return [];

      const { data: teams, error: teamsError } = await ctx.supabase
        .from("teams")
        .select("id, name, challenge_id, creator_id, team_code, max_members, goal_mode, status, created_at, updated_at, challenges(title)")
        .in("id", teamIds)
        .eq("status", "active");
      if (teamsError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: teamsError.message });

      const { data: counts, error: countsError } = await ctx.supabase
        .from("team_members")
        .select("team_id")
        .in("team_id", teamIds);
      if (countsError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: countsError.message });
      const countMap = new Map<string, number>();
      for (const row of (counts ?? []) as { team_id: string }[]) {
        countMap.set(row.team_id, (countMap.get(row.team_id) ?? 0) + 1);
      }

      const joinedMap = new Map((memberships ?? []).map((m: { team_id: string; joined_at: string }) => [m.team_id, m.joined_at]));
      return ((teams ?? []) as any[])
        .map((team) => ({
          ...(team as TeamRow),
          challenge_title: team.challenges?.title ?? "Challenge",
          member_count: countMap.get(team.id) ?? 0,
          joined_at: joinedMap.get(team.id) ?? team.created_at,
        }))
        .sort((a, b) => (a.joined_at < b.joined_at ? 1 : -1));
    }),

  getForChallenge: protectedProcedure
    .input(challengeIdSchema)
    .query(async ({ input, ctx }) => {
      const { data: teamMembership, error } = await ctx.supabase
        .from("team_members")
        .select("team_id, teams!inner(id, challenge_id)")
        .eq("user_id", ctx.userId)
        .eq("teams.challenge_id", input.challenge_id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      if (!teamMembership?.team_id) return null;
      return getTeamWithMembers(ctx, teamMembership.team_id);
    }),
});
