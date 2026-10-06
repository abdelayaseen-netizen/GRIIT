import { describe, expect, it } from "vitest";
import { gateParts } from "@/lib/gate-line";

describe("gate line", () => {
  it("orders Camera, then Time, then Location", () => {
    expect(
      gateParts({
        photoMode: "required",
        gates: [{ kind: "location" }, { kind: "time", from: "6:00", to: "8:00" }],
      }).map((p) => p.text),
    ).toEqual(["Camera", "6:00–8:00", "Location"]);
  });

  it("says Self-reported when there is no gate and no photo", () => {
    expect(gateParts({ photoMode: "none", gates: [] })).toEqual([{ text: "Self-reported" }]);
  });

  it("reads Opens at from the window start", () => {
    expect(
      gateParts({
        photoMode: "none",
        window: "notOpen",
        gates: [{ kind: "time", from: "5:00", to: "7:00" }],
      }),
    ).toEqual([{ icon: "clock", text: "Opens at 5:00" }]);
  });
});
