import { describe, expect, it } from "vitest";
import { enrollmentEndAt, enrollmentIsPastEnd } from "./enrollment-end-at";
import { dateKeyInTimeZone } from "./date-utils";

function localParts(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    fractionalSecondDigits: 3,
  }).formatToParts(instant);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}.${get("fractionalSecond")}`;
}

describe("enrollmentEndAt", () => {
  it("24h is start plus 24 clock hours", () => {
    const start = new Date("2026-09-19T16:00:00.000Z");
    expect(
      enrollmentEndAt({
        startAt: start,
        durationDays: 1,
        durationType: "24h",
        timeZone: "Europe/Berlin",
      }).toISOString(),
    ).toBe("2026-09-20T16:00:00.000Z");
  });

  it("day-count last day is start local date + duration_days − 1 at 23:59:59.999", () => {
    const start = new Date("2026-09-18T14:00:00.000Z");
    const end = enrollmentEndAt({
      startAt: start,
      durationDays: 2,
      durationType: "multi_day",
      timeZone: "Europe/Berlin",
    });
    expect(dateKeyInTimeZone(start, "Europe/Berlin")).toBe("2026-09-18");
    expect(localParts(end, "Europe/Berlin")).toBe("2026-09-19 23:59:59.999");
  });
});

describe("tz edge: 23:30 local on last day is still active", () => {
  it("UTC+2 Europe/Berlin", () => {
    const start = new Date("2026-09-18T14:00:00.000Z");
    const end = enrollmentEndAt({
      startAt: start,
      durationDays: 2,
      timeZone: "Europe/Berlin",
    });
    const at2330 = new Date("2026-09-19T21:30:00.000Z");
    expect(dateKeyInTimeZone(at2330, "Europe/Berlin")).toBe("2026-09-19");
    expect(enrollmentIsPastEnd(end, at2330)).toBe(false);
    expect(enrollmentIsPastEnd(end, new Date(end.getTime() + 1))).toBe(true);
  });

  it("UTC−5 America/Bogota", () => {
    const start = new Date("2026-09-18T19:00:00.000Z");
    const end = enrollmentEndAt({
      startAt: start,
      durationDays: 2,
      timeZone: "America/Bogota",
    });
    const at2330 = new Date("2026-09-20T04:30:00.000Z");
    expect(dateKeyInTimeZone(at2330, "America/Bogota")).toBe("2026-09-19");
    expect(enrollmentIsPastEnd(end, at2330)).toBe(false);
  });
});
