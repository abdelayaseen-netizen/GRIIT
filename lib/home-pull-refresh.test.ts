import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homeFocusRefetchDeps, homePullRefreshing } from "./home-pull-refresh";

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

describe("homePullRefreshing", () => {
  it("is false during the cold-start fetch (isFetching, not isRefetching)", () => {
    const isFetching = true;
    const isPending = true;
    const isRefetching = isFetching && !isPending;
    expect(isRefetching).toBe(false);
    expect(homePullRefreshing(isRefetching)).toBe(false);
  });

  it("is true only while refetching data Home already rendered", () => {
    expect(homePullRefreshing(true)).toBe(true);
    expect(homePullRefreshing(false)).toBe(false);
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
  const src = readFileSync(join(process.cwd(), "app/(tabs)/index.tsx"), "utf8");

  it("binds RefreshControl to isRefetching, not isFetching", () => {
    expect(src).toContain("refreshing={homePullRefreshing(bootstrap.isRefetching)}");
    expect(src).not.toMatch(/refreshing=\{bootstrap\.isFetching\}/);
  });

  it("does not list the bootstrap query result in the tab-focus refetch effect", () => {
    const start = src.indexOf("const refetchBootstrap = bootstrap.refetch");
    expect(start).toBeGreaterThan(-1);
    const block = src.slice(start, start + 400);
    expect(block).toContain("void refetchBootstrap()");
    expect(block).toContain("[isGuest, user?.id, refetchBootstrap]");
    expect(block).not.toContain("[isGuest, user?.id, bootstrap]");
  });
});
