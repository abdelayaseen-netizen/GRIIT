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
  shareJoinPlateLink,
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

  it("keeps the join line on the no-domain copy until the origin constant is set", () => {
    expect(SHARE_JOIN_WEB_ORIGIN).toBe("");
    expect(shareJoinLine(code)).toBe("Join me on GRIIT · code K7Q2M");
    expect(shareJoinLine(code)).not.toContain("griit.app");
    expect(shareJoinPlateLink(code)).toBe("code K7Q2M");
    expect(shareJoinLine(code, "https://example.com")).toBe("Join me · https://example.com/invite/K7Q2M");
    expect(shareJoinPlateLink(code, "https://example.com")).toBe("example.com/invite/K7Q2M");
    expect(shareJoinLine("")).toBe("");
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
    expect(lines).toContain("Join me on GRIIT · code K7Q2M");
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
    expect(shareMessageBody("Day 3. Pages before coffee.", shareJoinLine(code))).toBe(
      "Day 3. Pages before coffee.",
    );
    expect(shareMessageBody("  ", shareJoinLine(code))).toBe("Join me on GRIIT · code K7Q2M");
  });
});
