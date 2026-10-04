import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { originTabFromParam, originTabHref } from "@/lib/origin-tab";

describe("origin tab after a proof", () => {
  it("launched from Home lands on Home", () => {
    expect(originTabFromParam("home")).toBe("home");
    expect(originTabFromParam(undefined)).toBe("home");
    expect(originTabHref("home")).toBe("/(tabs)/index");
    expect(originTabHref(originTabFromParam("home"))).not.toBe("/(tabs)");
  });

  it("posting and Done replace to that named route", () => {
    const flow = readFileSync(
      resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"),
      "utf8",
    );
    const secured = readFileSync(resolve(__dirname, "../app/task/secured.tsx"), "utf8");
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    expect(home).toContain("originTab=home");
    expect(flow).toContain("returnToOrigin");
    expect(flow).toContain("originTabHref");
    expect(flow).not.toContain("router.replace(ROUTES.TABS_HOME");
    expect(flow).not.toContain("router.replace(ROUTES.HOME");
    expect(secured).toContain("originTabHref");
    expect(secured).not.toContain("ROUTES.HOME");
    expect(secured).not.toContain("router.back()");
  });
});
