import { describe, expect, it } from "vitest";
import {
  DEFAULT_CUSTOM_DRAFT,
  formatReminderTimeLong,
  formatReminderTimeShort,
  notificationBody,
  reminderTime24h,
  reminderTimeShort,
  reminderTimeText,
  resolveReminderClock,
} from "@/lib/onboarding-v2-reminders";

describe("resolveReminderClock", () => {
  it("resolves presets and staged custom", () => {
    expect(resolveReminderClock("am6", null)).toEqual({ h: 6, m: "00", mer: "AM" });
    expect(resolveReminderClock("am8", null)).toEqual({ h: 8, m: "00", mer: "AM" });
    expect(resolveReminderClock("pm12", null)).toEqual({ h: 12, m: "00", mer: "PM" });
    expect(resolveReminderClock("pm7", null)).toEqual({ h: 7, m: "00", mer: "PM" });
    expect(resolveReminderClock("custom", { h: 6, m: "45", mer: "AM" })).toEqual({
      h: 6,
      m: "45",
      mer: "AM",
    });
    expect(resolveReminderClock("custom", null)).toEqual({ h: 6, m: "00", mer: "AM" });
  });
});

describe("reminder time formatters", () => {
  it("long form keeps minutes; short form drops :00", () => {
    expect(formatReminderTimeLong({ h: 6, m: "00", mer: "AM" })).toBe("6:00 AM");
    expect(formatReminderTimeLong({ h: 6, m: "45", mer: "AM" })).toBe("6:45 AM");
    expect(formatReminderTimeShort({ h: 6, m: "00", mer: "AM" })).toBe("6am");
    expect(formatReminderTimeShort({ h: 6, m: "45", mer: "AM" })).toBe("6:45am");
    expect(formatReminderTimeShort({ h: 7, m: "00", mer: "PM" })).toBe("7pm");
  });

  it("reminderTimeText / Short / 24h read from preset + custom", () => {
    expect(reminderTimeText("am6", null)).toBe("6:00 AM");
    expect(reminderTimeShort("am6", null)).toBe("6am");
    expect(reminderTime24h("am6", null)).toBe("06:00");
    expect(reminderTime24h("pm7", null)).toBe("19:00");
    expect(reminderTime24h("pm12", null)).toBe("12:00");
    expect(reminderTimeText("custom", { h: 6, m: "30", mer: "AM" })).toBe("6:30 AM");
    expect(DEFAULT_CUSTOM_DRAFT).toEqual({ h: 6, m: "30", mer: "AM" });
  });
});

describe("notificationBody", () => {
  it("uses challenge name and task count; falls back to Day 1", () => {
    expect(notificationBody("The 30 Reset", 3)).toBe(
      "The 30 Reset isn't logged yet. 3 tasks left."
    );
    expect(notificationBody(null, 2)).toBe("Day 1 isn't logged yet. 2 tasks left.");
    expect(notificationBody("  ", 0)).toBe("Day 1 isn't logged yet. 0 tasks left.");
  });
});
