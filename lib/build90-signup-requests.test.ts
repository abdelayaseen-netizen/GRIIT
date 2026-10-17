/**
 * Build 90 01b.3: a fresh-user flow (Welcome → join → first task → post) must stay
 * under 50 tRPC requests in its busiest minute. Before: 78 (home.bootstrap ×11,
 * profiles.update ×4, challenge-page listMyActive + getSecuredDateKeys, join
 * double-refresh, reconcile on an empty history, expire+get on every Home focus,
 * getComments per feed card).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { reconcileStreakNeeded } from "./reconcile-needed";
import { timezoneHealSkipped, timezoneWriteSkipped, noteWrittenDeviceTimezone } from "./timezone-heal";

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

  it("FinalizeEnded refreshes bootstrap only when it is stale", () => {
    const src = read("lib/finalize-ended-foreground.ts");
    expect(src).toContain("refreshHomeBootstrap(queryClient, { freshAfter:");
    expect(src).not.toContain("homeBootstrapQueryKey(input.userId)");
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

  it("onboarding join invalidates only the bootstrap", () => {
    const src = read("lib/onboarding-v2-invalidate.ts");
    expect(src).toContain('["home", "bootstrap"]');
    expect(src).not.toContain('["challenge", "listMyActive"]');
    expect(src).not.toContain('["profiles", "getStats"]');
    expect(src).not.toContain('["profiles", "getRecord"]');
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

  it("the live feed does not fetch comments for every card on the page", () => {
    const src = read("components/LiveFeedSection.tsx");
    expect(src).toContain('queryKey: ["feedCommentPreview"');
    expect(src).toMatch(/feedCommentPreview[\s\S]{0,900}enabled: false/);
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

  it("bootstrap and the live feed do not refetch on window focus", () => {
    const boot = read("lib/use-home-bootstrap.ts");
    expect(boot).toContain("refetchOnWindowFocus: false");
    const feed = read("components/LiveFeedSection.tsx");
    expect(feed).not.toContain("void postersQuery.refetch()");
    expect(feed).toContain("refetchOnWindowFocus: false");
  });
});
