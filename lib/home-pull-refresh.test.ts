import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homeFocusRefetchDeps, runHomePullRefresh } from "./home-pull-refresh";

/** Models React Navigation: a new callback while focused immediately re-invokes. */
function countFocusedRefetchInvocations(
  getDeps: (result: { refetch: () => void; generation: number }) => readonly unknown[],
  ticks = 3,
): number {
  let generation = 0;
  let invocations = 0;
  const refetch = () => {
    invocations += 1;
    generation += 1;
  };
  let prevDeps: readonly unknown[] | null = null;
  for (let i = 0; i < ticks; i += 1) {
    const deps = getDeps({ refetch, generation });
    const prev = prevDeps;
    const changed =
      prev == null ||
      prev.length !== deps.length ||
      deps.some((d, idx) => d !== prev[idx]);
    prevDeps = deps;
    if (changed) refetch();
  }
  return invocations;
}

describe("runHomePullRefresh", () => {
  it("is true only while the user-initiated work is in flight", async () => {
    const flags: boolean[] = [];
    let setPulling = (v: boolean) => {
      flags.push(v);
    };
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const done = runHomePullRefresh(() => gate, setPulling);
    expect(flags).toEqual([true]);
    release();
    await done;
    expect(flags).toEqual([true, false]);
  });

  it("clears pulling when the work rejects", async () => {
    const flags: boolean[] = [];
    await expect(
      runHomePullRefresh(
        () => Promise.reject(new Error("net")),
        (v) => {
          flags.push(v);
        },
      ),
    ).rejects.toThrow("net");
    expect(flags).toEqual([true, false]);
  });
});

describe("home focus refetch deps", () => {
  it("loops while focused if the whole query result is a dep", () => {
    const n = countFocusedRefetchInvocations((result) => [result]);
    expect(n).toBeGreaterThan(1);
  });

  it("runs once when deps are guest, userId, and refetch", () => {
    const n = countFocusedRefetchInvocations((result) =>
      homeFocusRefetchDeps(false, "u1", result.refetch),
    );
    expect(n).toBe(1);
  });
});

describe("Home RefreshControl wiring", () => {
  const homeSrc = readFileSync(join(process.cwd(), "app/(tabs)/index.tsx"), "utf8");
  const feedSrc = readFileSync(join(process.cwd(), "components/LiveFeedSection.tsx"), "utf8");

  it("does not bind RefreshControl to any query isRefetching", () => {
    expect(homeSrc).not.toMatch(/refreshing=\{homePullRefreshing\(bootstrap\.isRefetching\)\}/);
    expect(homeSrc).not.toMatch(/bootstrap\.isRefetching/);
    expect(feedSrc).toContain("refreshing={isPulling}");
    expect(feedSrc).not.toMatch(/feedQuery\.isRefetching/);
    expect(feedSrc).not.toMatch(/isRefetching/);
  });

  it("sets isPulling in onRefresh and clears it when the awaited work settles", () => {
    expect(feedSrc).toContain("runHomePullRefresh");
    expect(feedSrc).toContain("setIsPulling");
    expect(homeSrc).toContain("const refetchBootstrap = bootstrap.refetch");
  });

  it("does not list the bootstrap query result in the tab-focus refetch effect", () => {
    const start = homeSrc.indexOf("const refetchBootstrap = bootstrap.refetch");
    expect(start).toBeGreaterThan(-1);
    const block = homeSrc.slice(start, start + 400);
    expect(block).toContain("void refetchBootstrap()");
    expect(block).toContain("[isGuest, user?.id, refetchBootstrap]");
    expect(block).not.toContain("[isGuest, user?.id, bootstrap]");
  });
});
