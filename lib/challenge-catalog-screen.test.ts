import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogFromChallengeRow, catalogScreenPrivate } from "@/lib/challenge-catalog-screen";
import { PRIVATE_CHALLENGE_MESSAGE } from "@/backend/lib/can-view-challenge";

const DAILY_GRATITUDE = {
  title: "Daily Gratitude",
  description: "Gratitude changes everything.",
  challenge_tasks: [
    { title: "Write 3 gratitudes", task_type: "journal", require_photo: false },
    { title: "Share one with someone", task_type: "manual", require_photo: false },
  ],
};

describe("catalogScreenPrivate", () => {
  it("detects the private getById / join message", () => {
    expect(catalogScreenPrivate(new Error(PRIVATE_CHALLENGE_MESSAGE))).toBe(true);
    expect(catalogScreenPrivate(new Error("tRPC query failed"))).toBe(false);
  });
});

describe("catalogFromChallengeRow", () => {
  it("renders title and tasks when there are no enrollment rows", () => {
    const view = catalogFromChallengeRow(DAILY_GRATITUDE, { isLoading: false, isError: false }, []);
    expect(view.loading).toBe(false);
    expect(view.error).toBe(false);
    expect(view.title).toBe("Daily Gratitude");
    expect(view.tasks.map((t) => t.title)).toEqual(["Write 3 gratitudes", "Share one with someone"]);
  });

  it("renders title and tasks when there is an orphaned participant row", () => {
    const orphan = {
      id: "member-orphan",
      challenge_id: "a1000001-4000-4000-8000-000000000006",
      user_id: "10556c76-3c37-4204-8915-fc7fd3b16a59",
      status: "active",
    };
    const view = catalogFromChallengeRow(
      DAILY_GRATITUDE,
      { isLoading: false, isError: false },
      [],
      [orphan],
    );
    expect(view.loading).toBe(false);
    expect(view.error).toBe(false);
    expect(view.title).toBe("Daily Gratitude");
    expect(view.tasks.map((t) => t.title)).toEqual(["Write 3 gratitudes", "Share one with someone"]);
  });

  it("failed challenges query shows error, never a permanent skeleton", () => {
    const failed = catalogFromChallengeRow(null, { isLoading: false, isError: true });
    expect(failed.loading).toBe(false);
    expect(failed.error).toBe(true);
    const pending = catalogFromChallengeRow(null, { isLoading: true, isError: false });
    expect(pending.loading).toBe(true);
    expect(pending.error).toBe(false);
    const ready = catalogFromChallengeRow(DAILY_GRATITUDE, { isLoading: false, isError: false });
    expect(ready.loading).toBe(false);
  });
});

describe("challenge catalog screen", () => {
  const catalog = readFileSync(resolve(__dirname, "../app/challenge/[id].tsx"), "utf8");
  const detail = readFileSync(resolve(__dirname, "../components/challenge/ChallengeDetailV3.tsx"), "utf8");

  it("loads title and tasks from the challenges row, not enrollment", () => {
    expect(catalog).toContain("catalogFromChallengeRow");
    expect(catalog).toContain("TRPC.challenges.getById");
    expect(catalog).not.toContain("!enrollmentsReady || !!activeChallengeId || endedPending");
    expect(detail).toContain("Challenge did not load");
    expect(detail).toContain("Retry");
    expect(detail).toContain("This challenge is private.");
    expect(catalog).toContain("catalogScreenPrivate");
    expect(catalog).toContain("privateLocked");
  });
});
