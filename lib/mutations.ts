import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

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
