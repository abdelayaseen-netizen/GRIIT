import { describe, expect, it } from "vitest";
import {
  SHARE_JOIN_WEB_ORIGIN,
  SHARE_PALETTES,
  buildSharePaint,
  colourForStyle,
  defaultStyle,
  paintStrings,
  rememberColour,
  shareJoinLine,
  shareMessageBody,
  storyUsesSticker,
  stylesForMoment,
} from "@/lib/share-image";

const code = "K7Q2M";

describe("v44.1 share styles", () => {
  it("maps each moment to its styles, default first", () => {
    expect(stylesForMoment("photo_proof")).toEqual(["A", "B", "D"]);
    expect(stylesForMoment("self_reported")).toEqual(["C", "B", "D"]);
    expect(stylesForMoment("day_secured")).toEqual(["E", "D", "B"]);
    expect(stylesForMoment("challenge_finished")).toEqual(["F", "D"]);
    expect(stylesForMoment("invite")).toEqual(["G"]);
    expect(defaultStyle("photo_proof")).toBe("A");
    expect(defaultStyle("invite")).toBe("G");
  });

  it("prints the username line until an origin exists, then the invite URL", () => {
    expect(SHARE_JOIN_WEB_ORIGIN).toBe("");
    expect(shareJoinLine({ username: "noahb", inviteId: code })).toBe("Find me on GRIIT · @noahb");
    expect(shareJoinLine({ username: "@noahb" })).toBe("Find me on GRIIT · @noahb");
    expect(shareJoinLine({ inviteId: code })).toBe("");
    expect(shareJoinLine({ username: "noahb", inviteId: code })).not.toContain("griit.app");
    expect(shareJoinLine({ username: "noahb", inviteId: code })).not.toContain("code");
    expect(shareJoinLine({ username: "noahb", inviteId: "ch-1", origin: "https://example.com" })).toBe(
      "https://example.com/i/ch-1",
    );
    expect(shareJoinLine({ username: "noahb", inviteId: "ch-1", origin: "https://example.com" })).not.toContain(
      "griit.to",
    );
    expect(shareJoinLine({ username: "noahb", origin: "https://example.com" })).toBe("");
    const photo = buildSharePaint({
      style: "A",
      colour: "ink",
      challenge: "Show Up 7",
      task: "Go to the gym",
      day: 3,
      durationDays: 7,
      username: "noahb",
      inviteCode: code,
      cameraSeal: true,
    });
    expect(paintStrings(photo)).toContain("Find me on GRIIT · @noahb");
    const invite = buildSharePaint({
      style: "G",
      colour: "ink",
      challenge: "Show Up 7",
      username: "noahb",
      inviteCode: code,
      proofLine: "7 days · Camera · Gym",
    });
    expect(paintStrings(invite)).toContain("Find me on GRIIT · @noahb");
    expect(paintStrings(invite).join("\n")).not.toContain("code K7Q2M");
  });

  it("does not paint a caption, and B is the transparent sticker", () => {
    const photo = buildSharePaint({
      style: "A",
      colour: "ink",
      challenge: "Show Up 7",
      task: "Go to the gym",
      day: 3,
      durationDays: 7,
      username: "noahb",
      inviteCode: code,
      cameraSeal: true,
    });
    const lines = paintStrings(photo);
    expect(lines).toContain("Go to the gym");
    expect(lines).toContain("SHOW UP 7");
    expect(lines).toContain("Find me on GRIIT · @noahb");
    expect(lines.join("\n")).not.toContain("Day 3. Pages before coffee.");
    expect(photo.transparent).toBe(false);
    expect(photo.photo).toBe(true);
    const sticker = buildSharePaint({
      style: "B",
      colour: "white",
      challenge: "Show Up 7",
      day: 3,
      durationDays: 7,
      streak: 3,
      inviteCode: code,
    });
    expect(paintStrings(sticker)).toContain("days in a row");
    const one = buildSharePaint({
      style: "E",
      colour: "orange",
      challenge: "Show Up 7",
      day: 1,
      durationDays: 7,
      streak: 1,
    });
    expect(paintStrings(one)).toContain("day in a row");
    expect(paintStrings(one)).not.toContain("days in a row");
    expect(sticker.transparent).toBe(true);
    expect(sticker.background).toBe("transparent");
    expect(storyUsesSticker("B")).toBe(true);
    expect(storyUsesSticker("A")).toBe(false);
    expect(storyUsesSticker("G")).toBe(false);
  });

  it("remembers a colour per style in memory and defaults to Ink", () => {
    expect(colourForStyle({}, "A")).toBe("ink");
    const next = rememberColour({}, "C", "orange");
    expect(colourForStyle(next, "C")).toBe("orange");
    expect(colourForStyle(next, "A")).toBe("ink");
    expect(SHARE_PALETTES.orange.bg).toBe("#DC5401");
    expect(SHARE_PALETTES.white.fg).toBe("#0F0F0F");
  });

  it("sends the caption as the message body, or the join line when the caption is empty", () => {
    expect(shareMessageBody("Day 3. Pages before coffee.", shareJoinLine({ username: "noahb", inviteId: code }))).toBe(
      "Day 3. Pages before coffee.",
    );
    expect(shareMessageBody("  ", shareJoinLine({ username: "noahb", inviteId: code }))).toBe(
      "Find me on GRIIT · @noahb",
    );
  });
});
