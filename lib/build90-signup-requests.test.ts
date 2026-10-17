/**
 * Build 90 01b.3: a fresh-user flow (Welcome → join → first task → post) must stay
 * under 50 tRPC requests in its busiest minute. Before: 78 (home.bootstrap ×11,
 * profiles.update ×4, challenge-page listMyActive + getSecuredDateKeys, join
 * double-refresh, reconcile on an empty history, expire+get on every Home focus).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const trpcMutate = vi.fn();
const trpcQuery = vi.fn();
const invalidateQueries = vi.fn();
vi.mock("@/lib/trpc", () => ({
  trpcMutate: (...args: unknown[]) => trpcMutate(...args),
  trpcQuery: (...args: unknown[]) => trpcQuery(...args),
}));
vi.mock("@/lib/sentry", () => ({ captureError: vi.fn() }));
vi.mock("@/lib/query-client", () => ({
  queryClient: { invalidateQueries: (...args: unknown[]) => invalidateQueries(...args) },
}));

import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { runFinalizeEndedOnForeground } from "./finalize-ended-foreground";
import { homeBootstrapQueryKey } from "./home-bootstrap-key";
import { refreshHomeBootstrap } from "./home-bootstrap-refresh";
import { reconcileStreakNeeded } from "./reconcile-needed";
import { finishedAtFromSecuredParam, taskSecuredHref } from "./task-secured-nav";
import type { SubmitResult } from "./task-completion-result";

const BASE_RESULT: SubmitResult = {
  taskComplete: true,
  daySecured: false,
  daySecuredEarlier: false,
  requiredRemaining: 0,
  streakDays: 1,
  streakDaysBefore: 0,
  challengeDay: 1,
  challengeLength: 7,
  challengeName: "7K Steps",
  verificationKind: "self_report",
  challengeDone: false,
};
import { timezoneHealSkipped, timezoneWriteSkipped, noteWrittenDeviceTimezone } from "./timezone-heal";

beforeEach(() => {
  trpcMutate.mockReset();
  trpcQuery.mockReset();
  invalidateQueries.mockReset();
});

const root = resolve(__dirname, "..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

describe("01b.3 sign-up and join request budget", () => {
  it("AccountScreen writes timezone and display name in one profiles.update", () => {
    const src = read("components/onboarding/v2/screens/AccountScreen.tsx");
    expect(src).toMatch(/trpcMutate\(TRPC\.profiles\.update, \{[\s\S]*timezone[\s\S]*display_name/);
    // No paired writeDeviceTimezone + saveDerivedDisplayName on the email/apple create paths.
    expect(src).not.toMatch(/await writeDeviceTimezone\(\);\s*[\s\S]{0,250}await saveDerivedDisplayName/);
  });

  it("a timezone already written this session does not heal (no second update + bootstrap)", () => {
    noteWrittenDeviceTimezone("America/New_York");
    expect(timezoneHealSkipped({ profileTz: "", deviceTz: "America/New_York" })).toBe(true);
    expect(timezoneHealSkipped({ profileTz: "", deviceTz: "Europe/London" })).toBe(false);
    expect(timezoneHealSkipped({ profileTz: "America/New_York", deviceTz: "America/New_York" })).toBe(true);
    expect(timezoneHealSkipped({ profileTz: "UTC", deviceTz: "America/New_York" })).toBe(false);
    const ctx = read("contexts/AppContext.tsx");
    expect(ctx).toContain("timezoneHealSkipped(");
    expect(ctx).not.toMatch(/needsHeal && timezoneHealForDeviceRef/);
  });

  it("a finalize that ended nothing does not refetch the bootstrap", async () => {
    trpcMutate.mockResolvedValue({ finalized: [], eventsEmitted: 0 });
    trpcQuery.mockResolvedValue([]);
    await runFinalizeEndedOnForeground({ userId: "u1", pathname: "/(tabs)", openEnd: () => {} });
    expect(invalidateQueries).not.toHaveBeenCalled();
    trpcMutate.mockResolvedValue({ finalized: ["ac-1"], eventsEmitted: 1 });
    await runFinalizeEndedOnForeground({ userId: "u1", pathname: "/(tabs)", openEnd: () => {} });
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith(
      { queryKey: ["home", "bootstrap", "u1"] },
      { cancelRefetch: false },
    );
  });

  it("Secured skips its bootstrap refresh when the finish's own refresh already landed", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let fetches = 0;
    const observer = new QueryObserver(qc, {
      queryKey: homeBootstrapQueryKey("u1"),
      queryFn: async () => {
        fetches += 1;
        return { fetches };
      },
      staleTime: 60_000,
    });
    const stop = observer.subscribe(() => {});
    await observer.refetch();
    const finishStartedAt = Date.now() - 50;
    await refreshHomeBootstrap(qc); // the finish's refresh (04.7)
    expect(fetches).toBe(2);
    // The Secured screen, with the finish time from its route params.
    const href = taskSecuredHref(
      { ...BASE_RESULT, daySecured: true },
      undefined,
      "Walk",
      { finishedAt: finishStartedAt },
    );
    const finishedAt = finishedAtFromSecuredParam(href.params.finishedAt);
    expect(finishedAt).toBe(finishStartedAt);
    await refreshHomeBootstrap(qc, finishedAt ? { freshAfter: finishedAt } : undefined);
    expect(fetches).toBe(2);
    // Without the param (an older link) it still refreshes.
    expect(finishedAtFromSecuredParam("")).toBeUndefined();
    expect(finishedAtFromSecuredParam("abc")).toBeUndefined();
    await refreshHomeBootstrap(qc, undefined);
    expect(fetches).toBe(3);
    stop();
    const secured = read("app/task/secured.tsx");
    expect(secured).toContain("refreshHomeBootstrap(queryClient, finishedAt ? { freshAfter: finishedAt } : undefined)");
    const flow = read("components/task-v2/useTaskFlowV2.ts");
    expect(flow).toContain("finishedAt: finishStartedAt,");
  });

  it("a second Home focus in one transition joins the posters request instead of restarting it", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let fetches = 0;
    const observer = new QueryObserver(qc, {
      queryKey: ["feed", "todayPosters", "u1"],
      queryFn: async () => {
        fetches += 1;
        await new Promise((r) => setTimeout(r, 30));
        return { posters: [], firstEventId: null };
      },
      staleTime: 30_000,
    });
    const stop = observer.subscribe(() => {});
    await observer.refetch();
    expect(fetches).toBe(1);
    // The old call, twice in one transition with data already cached: the second refetch()
    // cancels the first request and starts another.
    void observer.refetch();
    void observer.refetch();
    await new Promise((r) => setTimeout(r, 80));
    expect(fetches).toBe(3);
    // cancelRefetch false: the second focus shares the request in flight.
    void observer.refetch({ cancelRefetch: false });
    void observer.refetch({ cancelRefetch: false });
    await new Promise((r) => setTimeout(r, 80));
    expect(fetches).toBe(4);
    stop();
    const feed = read("components/LiveFeedSection.tsx");
    expect(feed).toContain("void postersQuery.refetch({ cancelRefetch: false })");
  });

  it("a finish does not refetch follow counts (the only query under the [\"profile\"] prefix)", () => {
    const mutations = read("hooks/useAppChallengeMutations.ts");
    const thenBlock = mutations.slice(
      mutations.indexOf(".then(async (data) => {"),
      mutations.indexOf("const tasks = (challenge?.challenge_tasks"),
    );
    expect(thenBlock).not.toContain('invalidateQueries({ queryKey: ["profile"] })');
    // The record the Profile tab draws its challenge rows from still refreshes.
    expect(thenBlock).toContain('refetchQueries({ queryKey: ["profiles", "getRecord"] }, { cancelRefetch: false })');
    // Nothing else subscribes under ["profile"] but follow counts.
    const profile = read("app/(tabs)/profile.tsx");
    expect(profile).toContain('queryKey: ["profile", user?.id, "followCounts"]');
  });

  it("finishing onboarding does not refetch the bootstrap; the join already did", () => {
    const complete = read("components/onboarding/v2/completeOnboarding.ts");
    expect(complete).not.toContain("invalidateAfterOnboardingJoin");
    expect(complete).not.toContain("@/lib/query-client");
    const join = read("lib/onboarding-v2-join.ts");
    expect(join).toContain("await invalidateAfterOnboardingJoin(queryClient);");
  });

  it("the challenge page reads enrollments and secured keys from the bootstrap", () => {
    const src = read("app/challenge/[id].tsx");
    expect(src).toContain("useHomeBootstrap(");
    expect(src).toContain("bootstrap.data?.activeChallenges");
    expect(src).toContain("bootstrap.data?.securedDateKeys");
    expect(src).toMatch(/enabled:[\s\S]{0,120}activeChallengesFailed/);
    expect(src).not.toContain("void myActiveListQuery.refetch()");
    expect(src).not.toMatch(/void refetchAll\(\)[\s\S]{0,200}invalidateQueries\(\{ queryKey: \["home", "bootstrap"\] \}\)/);
  });

  it("a brand-new person with no secured days does not reconcile", () => {
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: { lastCompletedDateKey: null, effectiveMissedDays: 0 },
        securedDateKeys: [],
        yesterdayKey: "2026-10-16",
      }),
    ).toBe(false);
    expect(
      reconcileStreakNeeded({
        ready: true,
        stats: { lastCompletedDateKey: "2026-10-17", effectiveMissedDays: 0 },
        securedDateKeys: ["2026-10-17"],
        yesterdayKey: "2026-10-16",
      }),
    ).toBe(false);
  });

  it("StarterTodayRow loads once, not on every Home focus", () => {
    const src = read("components/home/StarterTodayRow.tsx");
    expect(src).not.toContain("useFocusEffect");
    expect(src).toContain("staleTime:");
  });

  it("a timezone already written this session is not POSTed again", () => {
    noteWrittenDeviceTimezone("America/New_York");
    expect(timezoneWriteSkipped("America/New_York")).toBe(true);
    expect(timezoneWriteSkipped("Europe/London")).toBe(false);
    const write = read("lib/write-device-timezone.ts");
    expect(write).toContain("timezoneWriteSkipped(");
    const noteAt = write.indexOf("noteWrittenDeviceTimezone(timezone)");
    const postAt = write.indexOf("await trpcMutate(TRPC.profiles.update");
    expect(noteAt).toBeGreaterThan(-1);
    expect(postAt).toBeGreaterThan(-1);
    expect(noteAt).toBeLessThan(postAt);
    const account = read("components/onboarding/v2/screens/AccountScreen.tsx");
    expect(account).toContain("writtenDeviceTimezone()");
  });

  it("AccountScreen reads the starter row from the Home query cache", () => {
    const src = read("components/onboarding/v2/screens/AccountScreen.tsx");
    expect(src).toContain("STARTER_TODAY_QUERY_KEY");
    expect(src).not.toContain("TRPC.starterTask.get");
  });

  it("join does not refetch the challenge page it is leaving", () => {
    const src = read("app/challenge/[id].tsx");
    const joinBlock = src.slice(src.indexOf("const onJoin"), src.indexOf("const resolveInviteId"));
    expect(joinBlock).not.toContain('queryKey: ["challenge", id]');
  });
});
