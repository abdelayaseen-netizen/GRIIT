import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ORIGIN_TABS, originTabFromParam, originTabHref } from "@/lib/origin-tab";

function routeFile(href: string): string {
  if (href === "/(tabs)") return resolve(__dirname, "../app/(tabs)/index.tsx");
  const name = href.replace("/(tabs)/", "");
  return resolve(__dirname, `../app/(tabs)/${name}.tsx`);
}

describe("origin tab after a proof", () => {
  it("launched from Home lands on Home", () => {
    expect(originTabFromParam("home")).toBe("home");
    expect(originTabFromParam(undefined)).toBe("home");
    expect(originTabHref("home")).toBe("/(tabs)");
    expect(originTabHref(originTabFromParam("home"))).not.toBe("/(tabs)/index");
  });

  it("every origin tab resolves to an existing route file", () => {
    for (const tab of ORIGIN_TABS) {
      const href = originTabHref(tab);
      expect(href).not.toContain("/index");
      expect(existsSync(routeFile(href)), href).toBe(true);
    }
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

  it("renders a dark not-found screen with no system header", () => {
    const screen = readFileSync(resolve(__dirname, "../app/+not-found.tsx"), "utf8");
    const layout = readFileSync(resolve(__dirname, "../app/_layout.tsx"), "utf8");
    expect(screen).toContain('headerShown: false');
    expect(screen).toContain("Go to Home");
    expect(screen).toContain("DS_V3.color.canvas");
    expect(screen).not.toContain("title: 'Not Found'");
    expect(layout).toContain('name="+not-found" options={{ headerShown: false }}');
  });
});
