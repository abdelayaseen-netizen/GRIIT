import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FLAGS } from "@/lib/feature-flags";
import {
  EMPTY_HOME_STARTER_CHALLENGE_ID,
  EMPTY_HOME_STARTER_CTA,
  EMPTY_HOME_STARTER_TITLE,
} from "@/lib/empty-home-starter";

describe("empty Home starter", () => {
  it("uses a seeded 1-day Drink Water catalog id", () => {
    expect(EMPTY_HOME_STARTER_CHALLENGE_ID).toBe("b2000001-4000-4000-8000-000000000001");
    expect(EMPTY_HOME_STARTER_TITLE).toBe("Drink Water Today");
    expect(EMPTY_HOME_STARTER_CTA).toBe("Start");
  });

  it("HomeV3 shows the starter card when the flag is on", () => {
    expect(FLAGS.STARTER_TASK_ENABLED).toBe(true);
    const home = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    expect(home).toContain("home-starter-card");
    expect(home).toContain("onStartStarter");
    expect(home).toContain("EMPTY_HOME_STARTER_TITLE");
  });

  it("ring Done opens the task, not check-off", () => {
    const home = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    expect(home).toContain("home-ring-done");
    expect(home).toContain("onPressTask?.(row.id)");
    expect(home).not.toMatch(/onCheckOff\?\.\(row\.id\)/);
  });
});
