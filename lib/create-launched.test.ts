import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { launchedFirstCard, windowHasNotOpened } from "@/lib/create-launched";
import {
  LAUNCHED_TOMORROW_TITLE,
  launchedTodayLine,
  launchedTomorrowBody,
  nextTaskLabel,
  opensAtLine,
} from "@/lib/late-join-copy";

describe("create launched", () => {
  const shower = {
    name: "Cold shower",
    gates: ["camera", "time"] as const,
    gateTime: { mode: "between" as const, start: "05:00", end: "06:30" },
  };
  const journal = { name: "Journal", gates: [] as const };

  it("Opens at the first window when it has not opened, Next names a doable task", () => {
    const at4 = launchedFirstCard({
      tasks: [shower, journal],
      timeZone: "America/New_York",
      now: new Date("2026-09-22T08:00:00.000Z"), // 4:00 am EDT
    });
    expect(windowHasNotOpened(shower.gateTime, 4 * 60)).toBe(true);
    expect(at4.opensAt).toBe(opensAtLine("5:00 am"));
    expect(at4.nextLabel).toBe(nextTaskLabel("Journal"));
  });

  it("today copy and 116 tomorrow strings", () => {
    expect(launchedTodayLine("5am crew", 30)).toBe("5am crew. Day 1 of 30 is today.");
    expect(LAUNCHED_TOMORROW_TITLE).toBe("You're in. Day 1 is tomorrow.");
    expect(launchedTomorrowBody("Cold shower", "5:00 am", "6:30 am")).toBe(
      "Tomorrow's first task is Cold shower, between 5:00 am and 6:30 am. Today still counts for your other challenges.",
    );
  });

  it("Start the challenge always lands on Launched, never a task or detail", () => {
    const wizard = readFileSync(
      resolve(__dirname, "../components/create/CreateWizardV2.tsx"),
      "utf8",
    );
    expect(wizard).toContain("setLaunched(");
    expect(wizard).toContain("<LaunchedScreen");
    expect(wizard).toContain("useFocusEffect");
    expect(wizard).toContain("resetCreateFlow");
    expect(wizard).toContain("setState(INITIAL_STATE)");
    expect(wizard).toContain("setLaunched(null)");
    expect(wizard).not.toContain("onNext=");
    expect(wizard).not.toContain("ROUTES.CHALLENGE_ID(launched.challengeId)");
    expect(wizard).not.toContain("TASK_COMPLETE");
    expect(LAUNCHED_TOMORROW_TITLE).toBe("You're in. Day 1 is tomorrow.");
  });

  it("starts with no category, 7 days, hint-colored name, and the 7-day tip", () => {
    const wizard = readFileSync(
      resolve(__dirname, "../components/create/CreateWizardV2.tsx"),
      "utf8",
    );
    const basics = readFileSync(
      resolve(__dirname, "../components/create/v2/StepBasics.tsx"),
      "utf8",
    );
    expect(wizard).toContain("durationDays: 7");
    expect(wizard).toContain("category: null");
    expect(wizard).not.toMatch(/durationDays: 30/);
    expect(wizard).not.toMatch(/category: "discipline"/);
    expect(basics).toContain("7 days is a strong start. You can go again after.");
    expect(basics).toContain("CREATE_NAME_PLACEHOLDER");
    expect(basics).toContain("0.7");
    expect(basics).toContain("CREATE_LENGTH_TIP");
    expect(basics).not.toContain("30 days is the sweet spot");
  });
});
