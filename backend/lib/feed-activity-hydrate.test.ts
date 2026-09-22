import { describe, expect, it } from "vitest";
import { dedupePairedStartEvents, feedEventCurrentDay, type EvRow } from "./feed-activity-hydrate";

describe("feedEventCurrentDay", () => {
  it("hydrate of a secured_day event with day_number 2 and active.current_day 6 → post.currentDay === 2", () => {
    expect(feedEventCurrentDay("secured_day", { day_number: 2 }, 6)).toBe(2);
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
