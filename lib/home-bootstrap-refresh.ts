/**
 * Build 90 04.7: one home.bootstrap refresh that joins an in-flight fetch instead of
 * cancelling it. React Query's default `cancelRefetch: true` aborts the running fetch and
 * starts another, but `trpcQuery` never reads the abort signal, so the cancelled request
 * still reaches the server. After a finish, four callers in one tick made seven requests;
 * with `cancelRefetch: false` they share one.
 */
import type { QueryClient } from "@tanstack/react-query";
import { HOME_BOOTSTRAP_QUERY_KEY, homeBootstrapQueryKey } from "@/lib/home-bootstrap-key";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

export type RefreshHomeBootstrapOptions = {
  /**
   * Skip the request when the payload was already written at or after this time (ms epoch)
   * and nothing is in flight. A finish's second and third refresh (timing write, Home focus)
   * land after the first one resolved, so without this each one was another request.
   */
  freshAfter?: number;
};

export function homeBootstrapIsFreshSince(queryClient: QueryClient, freshAfter: number): boolean {
  // Only queries that hold data: the disabled guest key (`["home","bootstrap",""]`) never
  // fetched and would otherwise keep this false forever.
  const states = queryClient
    .getQueryCache()
    .findAll({ queryKey: [...HOME_BOOTSTRAP_QUERY_KEY] })
    .filter((q) => q.state.data !== undefined);
  if (states.length === 0) return false;
  return states.every((q) => q.state.fetchStatus === "idle" && q.state.dataUpdatedAt >= freshAfter);
}

export async function refreshHomeBootstrap(
  queryClient: QueryClient,
  options: RefreshHomeBootstrapOptions = {},
): Promise<void> {
  const queryKey = [...HOME_BOOTSTRAP_QUERY_KEY];
  if (typeof options.freshAfter === "number" && homeBootstrapIsFreshSince(queryClient, options.freshAfter)) return;
  // One call: mark stale and refetch, including a cached query with no observer mounted
  // (refetchType "all"). `cancelRefetch` is the second argument; in the filters object
  // React Query ignores it. A fetch already in flight is joined, not restarted.
  await queryClient.invalidateQueries({ queryKey, refetchType: "all" }, { cancelRefetch: false });
}

type DayOpenBootstrap = {
  activeChallenges?: unknown;
  todayCheckinsForUser?: unknown;
  failed?: unknown;
};

/** The cached bootstrap payload for a user, or undefined when nothing has loaded. */
export function readHomeBootstrap<T extends DayOpenBootstrap = DayOpenBootstrap>(
  queryClient: QueryClient,
  userId: string | undefined,
): T | undefined {
  if (!userId) return undefined;
  return queryClient.getQueryData<T>(homeBootstrapQueryKey(userId));
}

/**
 * Day secured's task count comes from the bootstrap payload. listMyActive and
 * getTodayCheckinsForUser are both inside it; fetching them again was two more requests
 * (the first of which took the 429). A payload that failed either section is an error,
 * the same as a failed direct call.
 */
export function bootstrapDayOpenInput<E, C>(data: DayOpenBootstrap | null | undefined): { enrollments: E[]; completed: C[] } {
  if (!data || typeof data !== "object") throw new Error("home.bootstrap is empty");
  const failed = Array.isArray(data.failed) ? (data.failed as string[]) : [];
  if (failed.includes("activeChallenges") || failed.includes("todayCheckinsForUser")) {
    throw new Error(`home.bootstrap failed: ${failed.join(", ")}`);
  }
  return {
    enrollments: Array.isArray(data.activeChallenges) ? (data.activeChallenges as E[]) : [],
    completed: Array.isArray(data.todayCheckinsForUser) ? (data.todayCheckinsForUser as C[]) : [],
  };
}

/**
 * Same rule for the notification planner: when the bootstrap already holds the enrollments
 * and today's check-ins, hand them over instead of letting `scheduleG2aForUser` fetch
 * `listMyActive` and `getTodayCheckinsForUser` again. Undefined when a section failed, so
 * the planner falls back to its own requests.
 */
export function bootstrapG2aInput<E, C>(
  data: DayOpenBootstrap | null | undefined,
): { enrollments: E[]; todayCheckins: C[] } | undefined {
  try {
    const { enrollments, completed } = bootstrapDayOpenInput<E, C>(data);
    return { enrollments, todayCheckins: completed };
  } catch {
    return undefined;
  }
}

export const REMINDER_SETTINGS_QUERY_KEY = ["notifications", "reminderSettings"] as const;
export const REMINDER_SETTINGS_STALE_MS = 5 * 60 * 1000;

export type ReminderSettings = {
  reminder_time?: string;
  enabled?: boolean;
  last_call_enabled?: boolean;
  friend_activity_enabled?: boolean;
  weekly_summary_enabled?: boolean;
  morning_kickoff_enabled?: boolean;
};

/**
 * The planner read `notifications.getReminderSettings` on every run (seven times in one
 * minute of the finish flow). Settings change only on the settings screen, which calls
 * `invalidateReminderSettings` after a save; between saves one read per five minutes is enough.
 */
export function fetchReminderSettings(queryClient: QueryClient): Promise<ReminderSettings | null> {
  return queryClient
    .fetchQuery({
      queryKey: [...REMINDER_SETTINGS_QUERY_KEY],
      queryFn: () => trpcQuery<ReminderSettings>(TRPC.notifications.getReminderSettings),
      staleTime: REMINDER_SETTINGS_STALE_MS,
    })
    .catch(() => null);
}

export function invalidateReminderSettings(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: [...REMINDER_SETTINGS_QUERY_KEY], refetchType: "none" });
}
