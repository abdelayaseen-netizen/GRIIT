import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { NotifRow } from "@/components/activity/types";
import { notifProofDay, notifTitle } from "./notification-title";

function row(partial: Partial<NotifRow> & Pick<NotifRow, "type">): NotifRow {
  return {
    id: "n1",
    read: false,
    createdAt: "2026-09-23T12:00:00.000Z",
    actorId: "u2",
    actorUsername: "maya",
    actorDisplayName: "Maya",
    actorAvatarUrl: null,
    metadata: { day_number: 9, current_day: 9, active_challenge_id: "ac1" },
    ...partial,
  };
}

describe("notifTitle day", () => {
  it("omits the day number when start_at is unreachable", () => {
    expect(notifProofDay({ startAt: null, timeZone: "UTC", asOfKey: "2026-09-23" })).toBeNull();
    expect(notifTitle(row({ type: "respect" }), null)).toBe("Maya liked your proof");
    expect(notifTitle(row({ type: "comment" }), null)).toBe("Maya commented on your proof");
    expect(notifTitle(row({ type: "respect" }), null)).not.toContain("day 9");
  });

  it("uses calendar Day n from start_at, never metadata.day_number", () => {
    const day = notifProofDay({
      startAt: "2026-09-16T16:00:00.000Z",
      timeZone: "UTC",
      asOfKey: "2026-09-23",
      durationDays: 14,
    });
    expect(day).toBe(8);
    expect(notifTitle(row({ type: "respect" }), day)).toBe("Maya liked your day 8 proof");
    const tab = readFileSync(resolve(__dirname, "../components/activity/NotificationsTab.tsx"), "utf8");
    expect(tab).not.toContain("md.day_number");
    expect(tab).not.toContain("md.current_day");
    expect(tab).toContain("notifProofDay");
  });
});
