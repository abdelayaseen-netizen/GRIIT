import { describe, expect, it } from "vitest";
import {
  DEFAULT_CUSTOM_DRAFT,
  formatReminderTimeLong,
  formatReminderTimeShort,
  notificationBody,
  parseReminderTime24h,
  reminderTime24h,
  reminderTimeShort,
  reminderTimeText,
  resolveReminderClock,
} from "@/lib/onboarding-v2-reminders";

describe("resolveReminderClock", () => {
  it("resolves presets and staged custom", () => {
    expect(resolveReminderClock("am6", null)).toEqual({ h: 6, m: "00", mer: "AM" });
    expect(resolveReminderClock("am8", null)).toEqual({ h: 8, m: "00", mer: "AM" });
    expect(resolveReminderClock("pm6", null)).toEqual({ h: 6, m: "00", mer: "PM" });
    expect(resolveReminderClock("pm9", null)).toEqual({ h: 9, m: "00", mer: "PM" });
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
    expect(parseReminderTime24h("06:00")).toEqual({ preset: "am6", custom: null });
    expect(parseReminderTime24h("18:00")).toEqual({ preset: "pm6", custom: null });
    expect(parseReminderTime24h("21:00")).toEqual({ preset: "pm9", custom: null });
    expect(parseReminderTime24h("19:00")).toEqual({
      preset: "custom",
      custom: { h: 7, m: "00", mer: "PM" },
    });
    expect(parseReminderTime24h("09:00")).toEqual({
      preset: "custom",
      custom: { h: 9, m: "00", mer: "AM" },
    });
    expect(reminderTime24h("pm6", null)).toBe("18:00");
    expect(reminderTime24h("pm9", null)).toBe("21:00");
    expect(reminderTimeText("custom", { h: 6, m: "30", mer: "AM" })).toBe("6:30 AM");
    expect(DEFAULT_CUSTOM_DRAFT).toEqual({ h: 6, m: "30", mer: "AM" });
  });
});

describe("notificationBody", () => {
  it("uses challenge, left of total, and pluralizes task", () => {
    expect(notificationBody("The 30 Reset", 3, 3)).toBe(
      "The 30 Reset: 3 of 3 tasks left today."
    );
    expect(notificationBody("Read", 1, 3)).toBe("Read: 1 of 3 task left today.");
    expect(notificationBody(null, 2)).toBe("Day 1: 2 of 2 tasks left today.");
    expect(notificationBody("  ", 0)).toBe("Day 1: 0 of 0 tasks left today.");
  });
});
