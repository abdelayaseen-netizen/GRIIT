import { describe, expect, it } from "vitest";
import { fullHouseAtFromRoster, type FullHouseEnrollment } from "./full-house";

const ME = "11111111-1111-4111-8111-111111111111";
const A = "22222222-2222-4222-8222-222222222222";
const B = "33333333-3333-4333-8333-333333333333";
const TEAM = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SOLO = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function row(
  challenge_id: string,
  user_id: string,
  status: string,
  ended_at: string | null,
  participation_type: string,
): FullHouseEnrollment {
  return { challenge_id, user_id, status, ended_at, participation_type };
}

describe("fullHouseAtFromRoster", () => {
  it("awards the earliest ended_at when every team member completed", () => {
    expect(
      fullHouseAtFromRoster(
        ME,
        [
          row(TEAM, ME, "completed", "2026-09-20T22:00:00.000Z", "team"),
          row(TEAM, A, "completed", "2026-09-21T10:00:00.000Z", "team"),
          row(TEAM, B, "completed", "2026-09-19T08:00:00.000Z", "team"),
        ],
        "UTC",
      ),
    ).toBe("2026-09-20");
  });

  it("stays locked when one member abandoned", () => {
    expect(
      fullHouseAtFromRoster(
        ME,
        [
          row(TEAM, ME, "completed", "2026-09-20T22:00:00.000Z", "team"),
          row(TEAM, A, "abandoned", "2026-09-18T10:00:00.000Z", "team"),
          row(TEAM, B, "completed", "2026-09-19T08:00:00.000Z", "team"),
        ],
        "UTC",
      ),
    ).toBeNull();
  });

  it("never counts a solo challenge even when completed", () => {
    expect(
      fullHouseAtFromRoster(
        ME,
        [row(SOLO, ME, "completed", "2026-09-20T22:00:00.000Z", "solo")],
        "UTC",
      ),
    ).toBeNull();
  });
});
