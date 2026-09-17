import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { queryFocusedFromAppState } from "./query-focus";

describe("queryFocusedFromAppState", () => {
  it("is focused only while the app is active", () => {
    expect(queryFocusedFromAppState("active")).toBe(true);
    expect(queryFocusedFromAppState("background")).toBe(false);
    expect(queryFocusedFromAppState("inactive")).toBe(false);
  });
});

describe("AppState focusManager bridge", () => {
  const src = readFileSync(join(process.cwd(), "app/_layout.tsx"), "utf8");

  it("wires AppState into focusManager in app/_layout.tsx", () => {
    expect(src).toContain("focusManager.setEventListener");
    expect(src).toContain("AppState.addEventListener");
    expect(src).toContain("queryFocusedFromAppState");
  });
});

describe("home.bootstrap window focus", () => {
  it("still opts bootstrap into refetchOnWindowFocus", () => {
    const hook = readFileSync(join(process.cwd(), "lib/use-home-bootstrap.ts"), "utf8");
    expect(hook).toContain("refetchOnWindowFocus: true");
  });
});
