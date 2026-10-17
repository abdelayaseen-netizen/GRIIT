/**
 * Build 90 04.7: one finish must not spend the per-user request budget.
 * Before: completeTask().then fired three aliases of refetchBootstrap plus an invalidate,
 * each cancelling the in-flight bootstrap fetch and starting another (the cancelled HTTP
 * request still reaches the server); Day secured then fetched listMyActive and
 * getTodayCheckinsForUser although the bootstrap payload carries both; FinalizeEndedGate
 * re-ran on every route change. Ten home.bootstrap requests after one finish → 429.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

const trpcMutate = vi.fn();
const trpcQuery = vi.fn();
const invalidateQueries = vi.fn();
vi.mock("@/lib/trpc", () => ({
  trpcMutate: (...args: unknown[]) => trpcMutate(...args),
  trpcQuery: (...args: unknown[]) => trpcQuery(...args),
}));
vi.mock("@/lib/sentry", () => ({ captureError: vi.fn() }));
vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
vi.mock("@/lib/g2a-notification-schedule", () => ({ applyG2aPlan: vi.fn(async () => undefined) }));
vi.mock("@/lib/notifications", () => ({
  cancelLegacyDailyReminders: vi.fn(async () => undefined),
  scheduleLapsedUserReminders: vi.fn(async () => undefined),
  scheduleWeeklySummary: vi.fn(async () => undefined),
  cancelWeeklySummary: vi.fn(async () => undefined),
  scheduleChallengeCountdowns: vi.fn(async () => undefined),
}));
vi.mock("@/lib/query-client", () => ({
  queryClient: {
    invalidateQueries: (...args: unknown[]) => invalidateQueries(...args),
  },
}));

import { homeBootstrapQueryKey } from "@/lib/home-bootstrap-key";
import {
  bootstrapDayOpenInput,
  bootstrapG2aInput,
  fetchReminderSettings,
  invalidateReminderSettings,
  refreshHomeBootstrap,
} from "@/lib/home-bootstrap-refresh";
import { checkUnseenEndingsOnHome, runFinalizeEndedOnForeground } from "@/lib/finalize-ended-foreground";
import { scheduleG2aForUser } from "@/lib/g2a-refresh";
import { schedulerSignature } from "@/hooks/useNotificationScheduler";

const root = resolve(__dirname, "..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function liveBootstrap() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let fetches = 0;
  const queryFn = async () => {
    fetches += 1;
    await sleep(25);
    return { fetches };
  };
  const observer = new QueryObserver(qc, { queryKey: homeBootstrapQueryKey("u1"), queryFn, staleTime: 60_000 });
  const unsubscribe = observer.subscribe(() => {});
  return { qc, observer, unsubscribe, count: () => fetches };
}

describe("04.7 one bootstrap request per finish", () => {
  it("four refreshes in one tick share one request (the old invalidate + refetch pairs made seven)", async () => {
    const live = liveBootstrap();
    await live.observer.refetch();
    expect(live.count()).toBe(1);
    await Promise.all([
      refreshHomeBootstrap(live.qc),
      refreshHomeBootstrap(live.qc),
      refreshHomeBootstrap(live.qc),
      refreshHomeBootstrap(live.qc),
    ]);
    expect(live.count()).toBe(2);
    live.unsubscribe();
  });

  it("a refresh still fetches when nothing is in flight, and when no observer is mounted", async () => {
    const live = liveBootstrap();
    await live.observer.refetch();
    await refreshHomeBootstrap(live.qc);
    expect(live.count()).toBe(2);
    live.unsubscribe();
    await refreshHomeBootstrap(live.qc);
    expect(live.count()).toBe(3);
  });

  it("Day secured reads its task count from the bootstrap payload, not from two more procedures", () => {
    const data = {
      activeChallenges: [{ id: "ac-1" }],
      todayCheckinsForUser: [{ active_challenge_id: "ac-1", task_id: "t-1", status: "completed" }],
      failed: [],
    };
    expect(bootstrapDayOpenInput(data)).toEqual({
      enrollments: [{ id: "ac-1" }],
      completed: [{ active_challenge_id: "ac-1", task_id: "t-1", status: "completed" }],
    });
    expect(() => bootstrapDayOpenInput({ ...data, failed: ["activeChallenges"] })).toThrow();
    expect(() => bootstrapDayOpenInput({ ...data, failed: ["todayCheckinsForUser"] })).toThrow();
    expect(() => bootstrapDayOpenInput(undefined)).toThrow();
    const secured = read("app/task/secured.tsx");
    expect(secured).toContain("bootstrapDayOpenInput<");
    expect(secured).not.toContain("TRPC.challenges.listMyActive");
    expect(secured).not.toContain("TRPC.checkins.getTodayCheckinsForUser");
  });

  it("the finish path refreshes the bootstrap once and never cancels an in-flight fetch", () => {
    const mutations = read("hooks/useAppChallengeMutations.ts");
    const thenBlock = mutations.slice(mutations.indexOf(".then(async (data) => {"), mutations.indexOf("const tasks = (challenge?.challenge_tasks"));
    expect(thenBlock).toContain("refreshHomeBootstrap(queryClient)");
    expect(thenBlock).not.toContain("fetchTodayCheckins(");
    expect(thenBlock).not.toContain("fetchActiveChallenge()");
    expect(thenBlock).not.toContain("fetchStats()");
    expect(thenBlock).not.toContain('invalidateQueries({ queryKey: ["home", "bootstrap"] })');
    expect(mutations).not.toContain('refetchQueries({ queryKey: ["profiles", "getRecord"] })');
    expect(mutations).not.toContain('refetchQueries({ queryKey: ["home", "bootstrap"] })');
    const context = read("contexts/AppContext.tsx");
    expect(context).toContain("refreshHomeBootstrap(queryClient)");
    expect(context).not.toContain("refetchQueries({ queryKey: homeBootstrapQueryKey(user.id) })");
    const flow = read("components/task-v2/useTaskFlowV2.ts");
    expect(flow).toContain("refreshHomeBootstrap(queryClient, { freshAfter: finishStartedAt })");
    expect(flow).not.toContain('refetchQueries({ queryKey: ["home", "bootstrap"] })');
    const home = read("app/(tabs)/index.tsx");
    expect(home).toContain("refreshHomeBootstrap(queryClient, { freshAfter: Date.now() - HOME_FOCUS_FRESH_MS })");
    expect(home).not.toContain("void refetchBootstrap();");
  });
});

describe("04.7 the second and third refresh of one finish make no request", () => {
  it("a refresh with freshAfter returns without fetching when the payload landed after the finish began", async () => {
    const live = liveBootstrap();
    await live.observer.refetch();
    const finishStartedAt = Date.now() - 1;
    await refreshHomeBootstrap(live.qc);
    expect(live.count()).toBe(2);
    await refreshHomeBootstrap(live.qc, { freshAfter: finishStartedAt });
    expect(live.count()).toBe(2);
    await refreshHomeBootstrap(live.qc, { freshAfter: Date.now() + 1 });
    expect(live.count()).toBe(3);
    live.unsubscribe();
  });

  it("a disabled guest key with no data does not defeat the freshness rule", async () => {
    const live = liveBootstrap();
    // AppContext's useHomeBootstrap(userId ?? "") leaves this key behind from before sign-in.
    const guest = new QueryObserver(live.qc, { queryKey: homeBootstrapQueryKey(""), queryFn: async () => ({}), enabled: false });
    const stop = guest.subscribe(() => {});
    await live.observer.refetch();
    expect(live.count()).toBe(1);
    await refreshHomeBootstrap(live.qc, { freshAfter: Date.now() - 10_000 });
    expect(live.count()).toBe(1);
    stop();
    live.unsubscribe();
  });

  it("the timing write and the Home focus use the freshness rule", () => {
    const flow = read("components/task-v2/useTaskFlowV2.ts");
    expect(flow).toContain("refreshHomeBootstrap(queryClient, { freshAfter: finishStartedAt })");
    const home = read("app/(tabs)/index.tsx");
    expect(home).toContain("refreshHomeBootstrap(queryClient, { freshAfter: Date.now() - HOME_FOCUS_FRESH_MS })");
    expect(home).not.toContain("refetchBootstrap({ cancelRefetch: false })");
  });
});

describe("04.7 the notification planner reads the bootstrap instead of four more procedures", () => {
  const enrollments = [{ id: "ac-1", start_at: "2026-10-16T00:00:00Z", challenges: { duration_days: 7, title: "7K Steps", challenge_tasks: [{ id: "t-1" }] } }];
  const todayCheckins = [{ task_id: "t-1", status: "completed" }];

  beforeEach(() => {
    trpcQuery.mockReset();
    trpcQuery.mockResolvedValue([]);
  });

  it("scheduleG2aForUser makes no request when given the enrollments and today's check-ins", async () => {
    await scheduleG2aForUser({ timezone: "UTC", streakCount: 1, enrollments, todayCheckins });
    expect(trpcQuery).not.toHaveBeenCalled();
    await scheduleG2aForUser({ timezone: "UTC", streakCount: 1 });
    const paths = trpcQuery.mock.calls.map((c) => c[0]);
    expect(paths).toEqual(["challenges.listMyActive", "checkins.getTodayCheckinsForUser"]);
  });

  it("bootstrapG2aInput hands both lists over, and nothing when a section failed", () => {
    expect(bootstrapG2aInput({ activeChallenges: enrollments, todayCheckinsForUser: todayCheckins, failed: [] })).toEqual({ enrollments, todayCheckins });
    expect(bootstrapG2aInput({ activeChallenges: enrollments, todayCheckinsForUser: todayCheckins, failed: ["todayCheckinsForUser"] })).toBeUndefined();
    expect(bootstrapG2aInput(undefined)).toBeUndefined();
  });

  it("reminder settings are read once per five minutes, and a save empties the cache", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    trpcQuery.mockResolvedValue({ weekly_summary_enabled: true });
    await fetchReminderSettings(qc);
    await fetchReminderSettings(qc);
    expect(trpcQuery).toHaveBeenCalledTimes(1);
    await invalidateReminderSettings(qc);
    await fetchReminderSettings(qc);
    expect(trpcQuery).toHaveBeenCalledTimes(2);
    trpcQuery.mockRejectedValueOnce(new Error("429"));
    await invalidateReminderSettings(qc);
    expect(await fetchReminderSettings(qc)).toBeNull();
  });

  it("the planner's signature ignores object identity and changes with the planned values", () => {
    const base = { userId: "u1", stats: { lastCompletedDateKey: "2026-10-16", activeStreak: 1 } as never, timezone: "UTC", activeChallengeId: "ac-1", challengeTitle: "7K Steps", enrollments, securedDateKeys: ["2026-10-16"], todayCheckins };
    const again = { ...base, enrollments: JSON.parse(JSON.stringify(enrollments)), todayCheckins: [...todayCheckins] };
    expect(schedulerSignature(again)).toBe(schedulerSignature(base));
    expect(schedulerSignature({ ...base, todayCheckins: [] })).not.toBe(schedulerSignature(base));
    expect(schedulerSignature({ ...base, stats: { lastCompletedDateKey: "2026-10-17", activeStreak: 2 } as never })).not.toBe(schedulerSignature(base));
  });

  it("the scheduler, the finish and the secure pass the bootstrap lists; the feed asks for a page once", () => {
    const scheduler = read("hooks/useNotificationScheduler.ts");
    expect(scheduler).toContain("fetchReminderSettings(queryClient)");
    expect(scheduler).not.toContain("trpcQuery(TRPC.notifications.getReminderSettings)");
    expect(scheduler).toContain("}, [user, stats ? signature : null, queryClient]);");
    const context = read("contexts/AppContext.tsx");
    expect(context).toContain("enrollments: Array.isArray(bootstrap.data?.activeChallenges)");
    expect(context).toContain("securedDateKeys: Array.isArray(bootstrap.data?.securedDateKeys)");
    expect(context).toContain("todayCheckins: Array.isArray(bootstrap.data?.todayCheckinsForUser)");
    const mutations = read("hooks/useAppChallengeMutations.ts");
    expect(mutations.match(/bootstrapG2aInput\(readHomeBootstrap\(queryClient, user\?\.id\)\)/g)?.length).toBe(2);
    const feed = read("components/LiveFeedSection.tsx");
    expect(feed).not.toContain("maybeFetchMore");
    expect(feed).toContain("onEndReached={fetchNextFeedPage}");
    expect(feed).toContain("fetchNextPage({ cancelRefetch: false })");
    expect(feed).toContain("enabled: !!user?.id && !!startedPreview");
    const settings = read("app/settings/notifications.tsx");
    expect(settings).toContain("invalidateReminderSettings(queryClient)");
  });
});

describe("04.7 the finalize gate runs on foreground and on arrival at Home, not on every route", () => {
  const USER = "11111111-1111-4111-8111-111111111111";
  const UNSEEN = [{ id: "ac-1", challenge_id: "ch-1", status: "completed" }];

  beforeEach(() => {
    trpcMutate.mockReset();
    trpcQuery.mockReset();
    invalidateQueries.mockReset();
    trpcMutate.mockResolvedValue({ ok: true });
    trpcQuery.mockResolvedValue(UNSEEN);
  });

  it("a run away from Home leaves the unseen check pending; reaching Home does only that check", async () => {
    const openEnd = vi.fn();
    await runFinalizeEndedOnForeground({ userId: USER, pathname: "/onboarding", openEnd });
    expect(trpcMutate).toHaveBeenCalledTimes(1);
    expect(trpcQuery).not.toHaveBeenCalled();
    expect(openEnd).not.toHaveBeenCalled();
    await checkUnseenEndingsOnHome({ pathname: "/task/secured", openEnd });
    expect(trpcQuery).not.toHaveBeenCalled();
    await checkUnseenEndingsOnHome({ pathname: "/(tabs)", openEnd });
    expect(trpcMutate).toHaveBeenCalledTimes(1);
    expect(trpcQuery).toHaveBeenCalledTimes(1);
    expect(openEnd).toHaveBeenCalledTimes(1);
    // The next Home arrival does nothing until the next foreground run.
    await checkUnseenEndingsOnHome({ pathname: "/(tabs)", openEnd });
    expect(trpcQuery).toHaveBeenCalledTimes(1);
  });

  it("a run on Home checks right away and leaves nothing pending", async () => {
    // 01b.3: the bootstrap refetch is tied to a run actually ending (see build90-signup-requests).
    trpcMutate.mockResolvedValue({ finalized: ["ac-1"], eventsEmitted: 1 });
    const openEnd = vi.fn();
    await runFinalizeEndedOnForeground({ userId: USER, pathname: "/(tabs)", openEnd });
    expect(trpcQuery).toHaveBeenCalledTimes(1);
    await checkUnseenEndingsOnHome({ pathname: "/(tabs)", openEnd });
    expect(trpcQuery).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith(expect.anything(), { cancelRefetch: false });
  });

  it("the layout runs finalize on [user, nav] and the Home check on pathname", () => {
    const layout = read("app/_layout.tsx");
    const gate = layout.slice(layout.indexOf("function FinalizeEndedGate"), layout.indexOf("function ThemeAwareStatusBar"));
    const finalizeEffect = gate.slice(0, gate.indexOf("checkUnseenEndingsOnHome("));
    expect(finalizeEffect).toContain("run();");
    expect(finalizeEffect).toContain("}, [user, nav]);");
    expect(finalizeEffect).not.toContain("pathname]);");
    expect(gate).toContain("checkUnseenEndingsOnHome(");
  });
});
