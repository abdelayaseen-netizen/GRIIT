import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { HOME_STARTS_TOMORROW, homePrestartLine, queuedHomeRows } from "./home-starts-tomorrow";

describe("queuedHomeRows", () => {
  it("maps a queued enrollment to a Starts tomorrow row", () => {
    expect(
      queuedHomeRows([
        {
          id: "ac-5am",
          challenge_id: "ch-5am",
          challenges: { id: "ch-5am", title: "5am crew" },
        },
      ]),
    ).toEqual([{ id: "ac-5am", challengeId: "ch-5am", name: "5am crew" }]);
    expect(HOME_STARTS_TOMORROW).toBe("Starts tomorrow");
    expect(homePrestartLine("5am crew")).toBe(
      "5am crew · Starts tomorrow. Nothing to do today.",
    );
    const home = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    expect(home).toContain("homePrestartLine");
    expect(home).toContain("CalendarClock");
    const join = readFileSync(resolve(__dirname, "../lib/challenge-detail-mapping.ts"), "utf8");
    expect(join).toContain('JOIN_CAPTION_TOMORROW = "Day 1 is tomorrow."');
  });
});
