import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { dateKeyFromIso } from "../../lib/home-day-total";
import {
  dedupePairedStartEvents,
  feedEventCurrentDay,
  finishedSecuredDays,
  type EvRow,
} from "./feed-activity-hydrate";

describe("feedEventCurrentDay", () => {
  it("enrollment start_at Sep 16, today Sep 23 → every site returns 8", () => {
    expect(
      feedEventCurrentDay({
        startAt: "2026-09-16T16:00:00.000Z",
        timeZone: "UTC",
        todayKey: "2026-09-23",
        durationDays: 14,
      }),
    ).toBe(8);
  });

  it("enrollment start_at Sep 16, proof created Sep 18, read on Sep 23 → feed row says Day 3", () => {
    const tz = "UTC";
    const startAt = "2026-09-16T16:00:00.000Z";
    const createdAt = "2026-09-18T09:00:00.000Z";
    const eventDay = feedEventCurrentDay({
      startAt,
      timeZone: tz,
      todayKey: dateKeyFromIso(createdAt, tz),
      durationDays: 14,
    });
    const readTimeDay = feedEventCurrentDay({
      startAt,
      timeZone: tz,
      todayKey: "2026-09-23",
      durationDays: 14,
    });
    expect(eventDay).toBe(3);
    expect(readTimeDay).toBe(8);
    const hydrate = readFileSync(resolve(__dirname, "./feed-activity-hydrate.ts"), "utf8");
    const feed = readFileSync(resolve(__dirname, "../trpc/routes/feed.ts"), "utf8");
    expect(hydrate).toContain("dateKeyFromIso(ev.created_at, tz)");
    expect(feed).toContain("dateKeyFromIso(ev.created_at, tz)");
    expect(hydrate).not.toMatch(/todayKey = getTodayDateKey\(tz\)/);
    expect(feed).not.toMatch(/todayKey: getTodayDateKey\(tz\)/);
  });
});

describe("finishedSecuredDays", () => {
  it("uses the R1 window over that enrollment", () => {
    const n = finishedSecuredDays({
      startAt: "2026-09-16T12:00:00.000Z",
      endAt: "2026-09-30T12:00:00.000Z",
      endedAt: "2026-09-23T18:00:00.000Z",
      status: "completed",
      timeZone: "UTC",
      todayKey: "2026-09-26",
      securedDateKeys: ["2026-09-16", "2026-09-17", "2026-09-20"],
    });
    expect(n).toBe(3);
  });

  it("returns undefined when start_at is missing — UI omits the line", () => {
    expect(
      finishedSecuredDays({
        startAt: null,
        timeZone: "UTC",
        todayKey: "2026-09-26",
        securedDateKeys: ["2026-09-16"],
      }),
    ).toBeUndefined();
  });
});

describe("dedupePairedStartEvents", () => {
  it("two events in, one row out when create and join share challenge_id within 60s", () => {
    const user = "u1";
    const challenge = "c1";
    const events: EvRow[] = [
      {
        id: "created",
        user_id: user,
        event_type: "challenge_created",
        challenge_id: challenge,
        metadata: {},
        created_at: "2026-09-22T12:00:00.000Z",
      },
      {
        id: "joined",
        user_id: user,
        event_type: "joined_challenge",
        challenge_id: challenge,
        metadata: {},
        created_at: "2026-09-22T12:00:20.000Z",
      },
    ];
    const out = dedupePairedStartEvents(events);
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("created");
    expect(out[0]?.event_type).toBe("challenge_created");
  });
});
