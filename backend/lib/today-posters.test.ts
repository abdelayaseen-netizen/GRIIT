import { describe, expect, it } from "vitest";
import { localDayStartIso, pickTodayPosters, type TodayPosterCandidate } from "./today-posters";

const since = "2026-10-05T04:00:00.000Z";

function row(partial: Partial<TodayPosterCandidate> & Pick<TodayPosterCandidate, "userId" | "eventId">): TodayPosterCandidate {
  return {
    name: partial.userId,
    createdAt: "2026-10-05T12:00:00.000Z",
    photoUrl: "https://example.com/p.jpg",
    shared: true,
    blocked: false,
    isTest: false,
    inCircle: true,
    ...partial,
  };
}

describe("localDayStartIso", () => {
  it("is local midnight, not UTC midnight", () => {
    expect(localDayStartIso(new Date("2026-10-05T15:00:00.000Z"), "America/New_York")).toBe(
      "2026-10-05T04:00:00.000Z",
    );
    expect(localDayStartIso(new Date("2026-10-05T15:00:00.000Z"), "UTC")).toBe(
      "2026-10-05T00:00:00.000Z",
    );
  });
});

describe("pickTodayPosters", () => {
  it("keeps a shared photo from a follow or a challenge mate, newest person first", () => {
    const picked = pickTodayPosters(
      [
        row({ userId: "k", eventId: "e1", name: "Khalid", createdAt: "2026-10-05T12:00:00.000Z" }),
        row({ userId: "o", eventId: "e2", name: "Omar", createdAt: "2026-10-05T11:00:00.000Z" }),
        row({ userId: "k", eventId: "e0", name: "Khalid", createdAt: "2026-10-05T10:00:00.000Z" }),
      ],
      "me",
      since,
    );
    expect(picked.map((p) => p.eventId)).toEqual(["e1", "e2"]);
    expect(picked[0]?.isViewer).toBe(false);
  });

  it("drops blocked, test, private, self-reported, outside the circle, and yesterday", () => {
    const picked = pickTodayPosters(
      [
        row({ userId: "b", eventId: "block", blocked: true }),
        row({ userId: "t", eventId: "test", isTest: true }),
        row({ userId: "p", eventId: "private", shared: false }),
        row({ userId: "s", eventId: "self", photoUrl: null }),
        row({ userId: "x", eventId: "stranger", inCircle: false }),
        row({ userId: "y", eventId: "yesterday", createdAt: "2026-10-05T03:59:00.000Z" }),
      ],
      "me",
      since,
    );
    expect(picked).toEqual([]);
  });

  it("counts the viewer once and marks them", () => {
    const picked = pickTodayPosters(
      [row({ userId: "me", eventId: "mine", name: "Yaseen", createdAt: "2026-10-05T13:00:00.000Z" })],
      "me",
      since,
    );
    expect(picked).toEqual([
      {
        eventId: "mine",
        userId: "me",
        name: "Yaseen",
        createdAt: "2026-10-05T13:00:00.000Z",
        photoUrl: "https://example.com/p.jpg",
        isViewer: true,
      },
    ]);
  });
});
