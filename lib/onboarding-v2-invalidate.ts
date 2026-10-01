export const ONBOARDING_JOIN_QUERY_KEYS = [
  ["home", "bootstrap"],
  ["challenge", "listMyActive"],
  ["profiles", "getStats"],
  ["profiles", "getRecord"],
] as const;

export async function invalidateAfterOnboardingJoin(queryClient: {
  invalidateQueries: (opts: { queryKey: string[] }) => Promise<unknown> | unknown;
}): Promise<void> {
  await Promise.all(
    ONBOARDING_JOIN_QUERY_KEYS.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey: [...queryKey] }),
    ),
  );
}
