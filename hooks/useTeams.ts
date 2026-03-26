/**
 * Legacy hook — teams UI removed from this build; kept so imports don't break if reintroduced.
 * Do not add tRPC team calls here until squads ship.
 */
import { useMutation, useQuery } from "@tanstack/react-query";

export function useMyTeam() {
  return useQuery({
    queryKey: ["teams", "disabled"],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useTeamFeed(_teamId: string | null) {
  return useQuery({
    queryKey: ["teams", "feed", "disabled", _teamId],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateTeam() {
  return useMutation({ mutationFn: async () => ({}) });
}

export function useJoinTeam() {
  return useMutation({ mutationFn: async () => ({}) });
}

export function useLeaveTeam() {
  return useMutation({ mutationFn: async () => ({}) });
}
