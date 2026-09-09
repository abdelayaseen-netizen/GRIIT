export const NO_ACTIVE_CHALLENGE = "No active challenge";
export const TODAY_LOAD_ERROR = "Couldn't load today. Pull to retry.";

export type HomeTodayView = "loading" | "error" | "empty" | "ready";

export function homeTodayView(q: {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  enrollmentCount: number;
}): HomeTodayView {
  if (q.isError) return "error";
  if (q.isLoading || !q.isSuccess) return "loading";
  if (q.enrollmentCount === 0) return "empty";
  return "ready";
}

/** Copy that Home is allowed to paint for a given query state. */
export function homeTodayVisibleCopy(q: {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  enrollmentCount: number;
}): string[] {
  const view = homeTodayView(q);
  if (view === "error") return [TODAY_LOAD_ERROR];
  if (view === "empty") return [NO_ACTIVE_CHALLENGE];
  return [];
}
