import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DAY_SECURED,
  DAY_STICKER_SHARE,
  SHARE_TODAY,
  TODAY_IS_SECURED,
  UNTIL_MIDNIGHT,
  WHICH_DAY,
  dateKeyInProfileZone,
  dayStickerCopy,
  defaultShareTodayChallenge,
  shareTodayCaption,
  shareTodayChallenges,
  shareTodayPickerLine,
  shareTodayVisible,
  showWhichDayPicker,
} from "@/lib/day-sticker";

const NY = "America/New_York";
const FRIDAY_ET = "2026-09-25";
/** Saturday 03:30 UTC = Friday 23:30 ET. */
const FRIDAY_NIGHT_UTC = new Date("2026-09-26T03:30:00.000Z");
/** Saturday 04:01 UTC = Saturday 00:01 ET. */
const SATURDAY_ET = new Date("2026-09-26T04:01:00.000Z");

describe("shareTodayVisible — server key + profile IANA midnight", () => {
  it("shows only when today is in getSecuredDateKeys", () => {
    expect(
      shareTodayVisible({
        serverSecuredDateKeys: [FRIDAY_ET],
        profileTimeZone: NY,
        now: FRIDAY_NIGHT_UTC,
      }),
    ).toBe(true);
    expect(
      shareTodayVisible({
        serverSecuredDateKeys: [],
        profileTimeZone: NY,
        now: FRIDAY_NIGHT_UTC,
      }),
    ).toBe(false);
  });

  it("stays up Friday night ET even though UTC has already rolled to Saturday", () => {
    expect(dateKeyInProfileZone(FRIDAY_NIGHT_UTC, NY)).toBe(FRIDAY_ET);
    expect(dateKeyInProfileZone(FRIDAY_NIGHT_UTC, "UTC")).toBe("2026-09-26");
    expect(
      shareTodayVisible({
        serverSecuredDateKeys: [FRIDAY_ET],
        profileTimeZone: NY,
        now: FRIDAY_NIGHT_UTC,
      }),
    ).toBe(true);
    expect(
      shareTodayVisible({
        serverSecuredDateKeys: [FRIDAY_ET],
        profileTimeZone: "UTC",
        now: FRIDAY_NIGHT_UTC,
      }),
    ).toBe(false);
  });

  it("hides at local midnight in the profile IANA zone", () => {
    expect(dateKeyInProfileZone(SATURDAY_ET, NY)).toBe("2026-09-26");
    expect(
      shareTodayVisible({
        serverSecuredDateKeys: [FRIDAY_ET],
        profileTimeZone: NY,
        now: SATURDAY_ET,
      }),
    ).toBe(false);
  });

  it("does not use a missing profile zone (no device UTC fallback)", () => {
    expect(dateKeyInProfileZone(FRIDAY_NIGHT_UTC, "")).toBeNull();
    expect(dateKeyInProfileZone(FRIDAY_NIGHT_UTC, null)).toBeNull();
    expect(
      shareTodayVisible({
        serverSecuredDateKeys: [FRIDAY_ET],
        profileTimeZone: null,
        now: FRIDAY_NIGHT_UTC,
      }),
    ).toBe(false);
  });
});

describe("Which day picker is challenges secured today", () => {
  const iron = {
    id: "ac-iron",
    challenge: "Iron man",
    day: 12,
    dayTotal: 30,
    securedToday: true,
    photoCount: 2,
  };
  const read = {
    id: "ac-read",
    challenge: "Read 30 min",
    day: 5,
    dayTotal: 30,
    securedToday: true,
    photoCount: 0,
  };
  const open = {
    id: "ac-open",
    challenge: "Open",
    day: 2,
    dayTotal: 14,
    securedToday: false,
    photoCount: 0,
  };

  it("lists only challenges secured today — no past calendar days", () => {
    const options = shareTodayChallenges([iron, read, open]);
    expect(options.map((o) => o.id)).toEqual(["ac-iron", "ac-read"]);
    expect(options.some((o) => o.day === 1 && o.id === "ac-iron")).toBe(false);
    expect(shareTodayPickerLine(options[0]!)).toBe("Day 12 of 30 · 2 photos");
    expect(shareTodayPickerLine(options[1]!)).toBe("Day 5 of 30 · no photo");
  });

  it("hides the picker for one challenge and preselects from detail", () => {
    expect(showWhichDayPicker(shareTodayChallenges([iron]))).toBe(false);
    expect(showWhichDayPicker(shareTodayChallenges([iron, read]))).toBe(true);
    expect(defaultShareTodayChallenge(shareTodayChallenges([iron, read]), "ac-iron")?.id).toBe(
      "ac-iron",
    );
    expect(defaultShareTodayChallenge(shareTodayChallenges([iron, read]))?.id).toBe("ac-read");
  });

  it("captions Until midnight, or with the challenge count", () => {
    expect(shareTodayCaption(1)).toBe(UNTIL_MIDNIGHT);
    expect(shareTodayCaption(2)).toBe("Until midnight · 2 challenges");
    expect(dayStickerCopy({ name: "Iron man", day: 12, dayTotal: 30 })).toBe(
      "Day 12 of 30. Iron man.",
    );
  });
});

describe("frame 111 surfaces", () => {
  it("Home has one Share today row; detail has Today is secured and no share footer", () => {
    const home = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    const detail = readFileSync(
      resolve(__dirname, "../components/challenge/ActiveChallengeV3.tsx"),
      "utf8",
    );
    const sheet = readFileSync(resolve(__dirname, "../components/share/DayStickerSheet.tsx"), "utf8");
    expect(home).toContain("SHARE_TODAY");
    expect(home).toContain("DAY_SECURED");
    expect(home).toContain("shareTodayCaption");
    expect(home).not.toContain("section.showShareToday");
    expect(detail).toContain("TODAY_IS_SECURED");
    expect(detail).toContain("SHARE_TODAY");
    expect(detail).not.toContain("Share today's proof");
    expect(sheet).toContain("WHICH_DAY");
    expect(sheet).toContain("showWhichDayPicker");
    expect(SHARE_TODAY).toBe("Share today");
    expect(WHICH_DAY).toBe("Which day");
    expect(DAY_SECURED).toBe("Day secured.");
    expect(TODAY_IS_SECURED).toBe("Today is secured.");
    expect(DAY_STICKER_SHARE).toBe("Share");
  });
});
