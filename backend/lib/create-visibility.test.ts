import { describe, expect, it } from "vitest";
import {
  REVIEW_PHOTOS_LINE,
  VISIBILITY_INVITE_CAPTION,
  VISIBILITY_INVITE_LABEL,
  VISIBILITY_INVITE_TITLE,
  VISIBILITY_PUBLIC_CAPTION,
  VISIBILITY_PUBLIC_LABEL,
  VISIBILITY_PUBLIC_TITLE,
  createVisibility,
  soloCreateVisibility,
  visibilityLabel,
} from "@/backend/lib/create-visibility";

describe("createVisibility", () => {
  it("lets solo choose PUBLIC or PRIVATE and never writes FRIENDS", () => {
    expect(createVisibility("solo", "PUBLIC")).toBe("PUBLIC");
    expect(createVisibility("solo", "PRIVATE")).toBe("PRIVATE");
    expect(createVisibility("solo", "FRIENDS")).toBe("PRIVATE");
    expect(createVisibility("solo", null)).toBe("PRIVATE");
  });

  it("locks group (team) to PRIVATE", () => {
    expect(createVisibility("team", "PUBLIC")).toBe("PRIVATE");
    expect(createVisibility("team", "FRIENDS")).toBe("PRIVATE");
  });

  it("labels and photos copy match 104–105", () => {
    expect(visibilityLabel("PUBLIC")).toBe(VISIBILITY_PUBLIC_LABEL);
    expect(visibilityLabel("PRIVATE")).toBe(VISIBILITY_INVITE_LABEL);
    expect(REVIEW_PHOTOS_LINE).toBe("You choose Share or Keep for each one");
    expect(soloCreateVisibility("solo", "PUBLIC")).toBe("PUBLIC");
  });

  it("create options use Anyone / Invite with caption under each", () => {
    expect(VISIBILITY_PUBLIC_TITLE).toBe("Anyone");
    expect(VISIBILITY_PUBLIC_CAPTION).toBe("Shows on Discover. Anyone can join.");
    expect(VISIBILITY_INVITE_TITLE).toBe("Invite");
    expect(VISIBILITY_INVITE_CAPTION).toBe(
      "Only people with your link can join. Check-ins show only to members.",
    );
  });
});
