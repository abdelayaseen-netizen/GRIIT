import { describe, expect, it } from "vitest";
import { TODAY_BAND_NONE, todayBandCopy, type TodayPoster } from "@/lib/today-band";

const row = (userId: string, name: string, createdAt: string): TodayPoster => ({
  userId,
  name,
  createdAt,
});

describe("today band copy", () => {
  it("uses one line when nobody has posted", () => {
    expect(todayBandCopy([])).toBe(TODAY_BAND_NONE);
    expect(TODAY_BAND_NONE).toBe("No one’s posted today. You’re first.");
  });

  it("names one person, two people, and the rest as others", () => {
    expect(todayBandCopy([row("k", "Khalid", "2026-10-05T12:00:00Z")])).toBe("Khalid posted today.");
    expect(
      todayBandCopy([
        row("k", "Khalid", "2026-10-05T12:00:00Z"),
        row("o", "Omar", "2026-10-05T11:00:00Z"),
      ]),
    ).toBe("Khalid and Omar posted today.");
    expect(
      todayBandCopy([
        row("k", "Khalid", "2026-10-05T12:00:00Z"),
        row("o", "Omar", "2026-10-05T11:00:00Z"),
        row("a", "Abd", "2026-10-05T10:00:00Z"),
        row("b", "Bilal", "2026-10-05T09:00:00Z"),
        row("h", "Hamza", "2026-10-05T08:00:00Z"),
      ]),
    ).toBe("Khalid, Omar and 3 others posted today.");
  });

  it("counts the viewer as You and de-duplicates a person", () => {
    expect(
      todayBandCopy(
        [
          row("me", "Yaseen", "2026-10-05T13:00:00Z"),
          row("k", "Khalid", "2026-10-05T12:00:00Z"),
          { ...row("k", "Khalid", "2026-10-05T11:00:00Z") },
          row("o", "Omar", "2026-10-05T10:00:00Z"),
          row("a", "Abd", "2026-10-05T09:00:00Z"),
          row("b", "Bilal", "2026-10-05T08:00:00Z"),
        ],
        "me",
      ),
    ).toBe("You, Khalid and 3 others posted today.");
  });

  it("never says 1 days", () => {
    expect(todayBandCopy([row("k", "Khalid", "2026-10-05T12:00:00Z")])).not.toContain("1 days");
  });
});
