import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

/**
 * Join challenge. On success invalidates challenge detail, home, profile, discover.
 */
export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { challengeId: string }) =>
      trpcMutate(TRPC.challenges.join, input),
    onSuccess: (_data, variables) => {
      const id = variables.challengeId;
      queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["discover"] });
    },
  });
}

/**
 * Leave challenge. On success invalidates challenge detail, home, profile, discover.
 */
export function useLeaveChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { challengeId: string }) =>
      trpcMutate(TRPC.challenges.leave, input),
    onSuccess: (_data, variables) => {
      const id = variables.challengeId;
      queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["discover"] });
    },
  });
}

/**
 * Secure day. On success invalidates home, profile, movement.
 */
export function useSecureDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { activeChallengeId: string }) =>
      trpcMutate(TRPC.checkins.secureDay, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["movement"] });
    },
  });
}

/**
 * Create challenge. On success invalidates discover, home, profile.
 */
export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      trpcMutate(TRPC.challenges.create, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discover"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
