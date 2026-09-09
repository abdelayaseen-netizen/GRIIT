import { describe, expect, it } from "vitest";
import {
  goalCataloguePhrase,
  modeLine,
  noMatchSubtitle,
  participationLabel,
  suggestionTaskLine,
  HARD_MODE_LINE,
  STANDARD_MODE_LINE,
} from "@/lib/onboarding-v2-first-challenge";

describe("participationLabel", () => {
  it("maps participation_type to Solo / Duo / Team", () => {
    expect(participationLabel("solo")).toBe("Solo");
    expect(participationLabel("duo")).toBe("Duo");
    expect(participationLabel("team")).toBe("Team");
    expect(participationLabel("shared_goal")).toBe("Team");
    expect(participationLabel(null)).toBe("Solo");
  });
});

describe("modeLine", () => {
  it("uses the brief hard and standard lines", () => {
    expect(modeLine(true)).toBe(HARD_MODE_LINE);
    expect(modeLine(false)).toBe(STANDARD_MODE_LINE);
  });
});

describe("suggestionTaskLine", () => {
  it("uses taskGates and todayCardGateLabel", () => {
    expect(
      suggestionTaskLine({
        title: "Run 5km",
        require_photo: true,
        config: { schedule_window_start: "06:00", schedule_window_end: "09:00" },
      })
    ).toEqual({ name: "Run 5km", gate: "Camera · Time window 6–9am" });
    expect(suggestionTaskLine({ title: "Read 10 pages" })).toEqual({
      name: "Read 10 pages",
      gate: "Self-reported",
    });
  });
});

describe("noMatchSubtitle", () => {
  it("joins goal labels in lowercase", () => {
    expect(goalCataloguePhrase(["physical_toughness"])).toBe("physical toughness");
    expect(noMatchSubtitle(["sleep_recovery", "faith_prayer"])).toBe(
      "Nothing in the catalogue matches sleep and recovery and faith and prayer yet."
    );
  });
});
