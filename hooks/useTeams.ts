import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

export function useMyTeam() {
  return useQuery({
    queryKey: ["myTeam"],
    queryFn: () => trpcQuery(TRPC.teams.getMyTeam) as Promise<{
      team: { id: string; name: string; invite_code: string; created_by: string; created_at: string; max_members: number };
      members: { user_id: string; username: string | null; display_name: string | null; avatar_url: string | null; role: string; joined_at: string; today_completion_count: number; current_streak: number }[];
    } | null>,
    staleTime: 60 * 1000,
  });
}

export function useTeamFeed(teamId: string | null) {
  return useQuery({
    queryKey: ["teamFeed", teamId],
    queryFn: () => trpcQuery(TRPC.teams.getTeamFeed, { teamId: teamId! }) as Promise<
      { id: string; user_id: string; username: string; display_name: string | null; task_title: string; created_at: string }[]
    >,
    enabled: !!teamId,
    staleTime: 30 * 1000,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => trpcMutate(TRPC.teams.createTeam, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTeam"] });
    },
  });
}

export function useJoinTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => trpcMutate(TRPC.teams.joinTeam, { inviteCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTeam"] });
    },
  });
}

export function useLeaveTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => trpcMutate(TRPC.teams.leaveTeam, { teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTeam"] });
    },
  });
}
