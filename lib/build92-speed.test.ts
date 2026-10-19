// Build 92 chunk 11: app open (splash on settle, Home from cache), profile images, startup trace.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { splashMayHide } from "@/lib/auth-redirect";
import { parseHomeBootstrap, serializeHomeBootstrap } from "@/lib/home-bootstrap-cache";
import { interactiveAt } from "@/lib/startup-trace";
import { proofCacheKey, proofSource } from "@/lib/proof-cache-key";
import { parseOnboardedUser, serializeOnboardedUser } from "@/lib/onboarded-user-cache";
import { getTodayDateKey } from "@/lib/date-utils";
import type { HomeBootstrap } from "@/lib/use-home-bootstrap";

const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");

function boot(over: Partial<HomeBootstrap> = {}): HomeBootstrap {
  return {
    profile: { user_id: "u1", timezone: "America/New_York" } as never,
    stats: { activeStreak: 3 } as never,
    activeChallenges: [{ id: "ac1" }],
    queuedChallenges: [],
    activeChallenge: null,
    todayCheckinsForUser: [{ task_id: "t1", status: "completed" }] as never,
    todayCheckins: [{ task_id: "t1", status: "completed" }] as never,
    securedDateKeys: ["2026-10-17"],
    freezeStatus: null,
    followCounts: null,
    failed: [],
    ...over,
  };
}

describe("11.2 splash comes down when routing settles", () => {
  it("waits while the session or profile check is loading, or a redirect is pending", () => {
    expect(splashMayHide({ overlayShown: true, action: "wait" })).toBe(false);
    expect(splashMayHide({ overlayShown: false, action: "replace" })).toBe(false);
    expect(splashMayHide({ overlayShown: false, action: "wait" })).toBe(false);
  });

  it("hides on stay or retry", () => {
    expect(splashMayHide({ overlayShown: false, action: "stay" })).toBe(true);
    expect(splashMayHide({ overlayShown: false, action: "retry" })).toBe(true);
  });

  it("the layout hides on settle and keeps the timer only as a maximum", () => {
    const src = read("app/_layout.tsx");
    expect(src).toMatch(/splashMayHide\(\{ overlayShown, action: decision\.action \}\)/);
    expect(src).toMatch(/requestAnimationFrame\(hideSplashOnce\)/);
    expect(src).toMatch(/setTimeout\(hideSplashOnce, SPLASH_MAX_MS\)/);
    expect(src).not.toMatch(/setTimeout\(\(\) => \{\s*SplashScreen\.hideAsync/);
  });
});

describe("11.2 a returning account routes without waiting on the profile fetch", () => {
  it("round-trips, and anything but a completed record is ignored", () => {
    const u = { username: "sam", createdAt: "2026-10-01T00:00:00Z" };
    expect(parseOnboardedUser(serializeOnboardedUser(u))).toEqual(u);
    expect(parseOnboardedUser(JSON.stringify({ completed: false, username: "sam" }))).toBeNull();
    expect(parseOnboardedUser("true")).toBeNull();
    expect(parseOnboardedUser(null)).toBeNull();
  });

  it("is written only when the fetch says onboarding is done (the routing rule), and a failed fetch keeps it", () => {
    const src = read("app/_layout.tsx");
    const fn = src.slice(src.indexOf("const runCheckProfile"), src.indexOf("useEffect(", src.indexOf("const runCheckProfile")));
    expect(fn).toMatch(/const known = await readOnboardedUser\(userId\);/);
    expect(fn).toMatch(/if \(known && outcome\.onboardingCompleted === null\) return;/);
    expect(fn).toMatch(/resolveOnboardingCompleted\(\{\s*sessionKind: kind,\s*dbCompleted: outcome\.onboardingCompleted,\s*username: outcome\.username,\s*\}\)\s*\)\s*\{\s*writeOnboardedUser/);
    expect(fn.indexOf("await readOnboardedUser")).toBeLessThan(fn.indexOf("await checkProfile"));
  });
});

describe("11.2 Home from cache, then refresh", () => {
  it("keeps only a complete bootstrap", () => {
    expect(serializeHomeBootstrap(boot({ failed: ["stats"] }))).toBeNull();
    expect(parseHomeBootstrap(serializeHomeBootstrap(boot()))).toEqual(boot());
  });

  it("a snapshot from an earlier day drops that day's check-ins, keeps the rest", () => {
    const raw = serializeHomeBootstrap(boot())!;
    const old = JSON.stringify({ ...JSON.parse(raw), dateKey: "2020-01-01" });
    const got = parseHomeBootstrap(old)!;
    expect(got.todayCheckins).toEqual([]);
    expect(got.todayCheckinsForUser).toEqual([]);
    expect(got.activeChallenges).toEqual([{ id: "ac1" }]);
    expect(got.securedDateKeys).toEqual(["2026-10-17"]);
    expect(JSON.parse(raw).dateKey).toBe(getTodayDateKey("America/New_York"));
  });

  it("rejects junk and partial snapshots", () => {
    expect(parseHomeBootstrap(null)).toBeNull();
    expect(parseHomeBootstrap("{")).toBeNull();
    expect(parseHomeBootstrap(JSON.stringify({ dateKey: "x" }))).toBeNull();
    expect(
      parseHomeBootstrap(JSON.stringify({ dateKey: "x", savedAt: 1, data: boot({ failed: ["profile"] }) }))
    ).toBeNull();
  });

  it("placeholder data paints without counting as fetched (effects wait for the live answer)", () => {
    const qc = new QueryClient();
    const obs = new QueryObserver<HomeBootstrap, Error, HomeBootstrap, HomeBootstrap, string[]>(qc, {
      queryKey: ["home", "bootstrap", "u1"],
      queryFn: () => new Promise<HomeBootstrap>(() => {}),
      placeholderData: () => boot(),
    });
    const r = obs.getOptimisticResult(qc.defaultQueryOptions(obs.options));
    expect(r.data).toEqual(boot());
    expect(r.isPlaceholderData).toBe(true);
    expect(r.isFetched).toBe(false);
  });

  it("only Home opts in, and reconcile waits for live data", () => {
    const home = read("app/(tabs)/index.tsx");
    expect(home).toMatch(/useHomeBootstrap\(isGuest \? undefined : user\?\.id, \{ fromCache: true \}\)/);
    expect(home).toMatch(/ready: bootstrap\.isSuccess && !bootstrap\.isPlaceholderData/);
    expect(read("contexts/AppContext.tsx")).toMatch(/useHomeBootstrap\(user\?\.id\);/);
    expect(read("lib/use-home-bootstrap.ts")).toMatch(/writeHomeBootstrapCache\(userId, data\)/);
  });
});

describe("11.3 proof photos keep their cache across re-signs", () => {
  const signed = (token: string) =>
    `https://x.supabase.co/storage/v1/object/sign/task-proofs/u1/2026-10-18/a.jpg?token=${token}`;

  it("two signed URLs for one object share a cache key", () => {
    expect(proofCacheKey(signed("aaa"))).toBe(proofCacheKey(signed("bbb")));
    expect(proofCacheKey(signed("aaa"))).toBe("x.supabase.co/storage/v1/object/sign/task-proofs/u1/2026-10-18/a.jpg");
  });

  it("other objects and non-storage URLs do not", () => {
    expect(proofCacheKey(signed("a"))).not.toBe(proofCacheKey(signed("a").replace("a.jpg", "b.jpg")));
    expect(proofCacheKey("https://example.com/a.jpg?x=1")).toBeUndefined();
    expect(proofCacheKey("file:///tmp/a.jpg")).toBeUndefined();
    expect(proofSource("file:///tmp/a.jpg")).toEqual({ uri: "file:///tmp/a.jpg" });
  });

  it("grid, feed, viewer and full-screen photo use it", () => {
    for (const p of [
      "components/profile/ProofsGrid.tsx",
      "components/ds/ProofImage.tsx",
      "components/profile/PostViewer.tsx",
      "app/post/[id]/photo.tsx",
      "components/profile/DayViewer.tsx",
    ]) {
      expect(read(p)).toMatch(/proofSource\(/);
    }
  });
});

describe("11.1 startup trace", () => {
  it("interactive is the last of splash, overlay and Home data", () => {
    expect(interactiveAt({ splash_hidden: 10, overlay_gone: 30, home_data: 20 })).toBe(30);
    expect(interactiveAt({ splash_hidden: 10, overlay_gone: 30 })).toBeNull();
  });
});
