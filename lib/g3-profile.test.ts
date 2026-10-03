import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACCOUNT_PRIVATE,
  NO_PROOFS_BODY,
  NO_PROOFS_YET,
  SEE_STRANGER,
  STRANGER_BANNER,
  accountPrivateBody,
  badgesMoreFooter,
  joinedBioLine,
  nextBadgeRemainLine,
  nextUnearnedBadge,
  ownerShareLabel,
  profileProofKind,
  proofsNewestLine,
  showJoinedBioPlaceholder,
  showNextBadgeUnderGrid,
  todayTileCaption,
} from "@/lib/g3-profile";
import type { V42BadgeState } from "@/lib/v42-badges";

describe("g3 profile copy", () => {
  it("proofs empty, newest line, today tile, share vs find friends", () => {
    expect(NO_PROOFS_YET).toBe("No proofs yet.");
    expect(NO_PROOFS_BODY).toMatch(/Self-reported days show as text/);
    expect(proofsNewestLine(0)).toBe("0 proofs · newest first");
    expect(proofsNewestLine(3)).toBe("3 proofs · newest first");
    expect(todayTileCaption(1)).toBe("1 task left");
    expect(todayTileCaption(3)).toBe("3 tasks left");
    expect(ownerShareLabel(0)).toBe("Find friends");
    expect(ownerShareLabel(2)).toBe("Share profile");
    expect(joinedBioLine("Friday", "Iron man")).toBe("Joined Friday. Running Iron man.");
    expect(
      showJoinedBioPlaceholder({
        bio: "",
        createdAt: new Date(2026, 8, 28).toISOString(),
        now: new Date(2026, 9, 2),
      }),
    ).toBe(true);
    expect(
      showJoinedBioPlaceholder({
        bio: "Building.",
        createdAt: new Date(2026, 8, 28).toISOString(),
        now: new Date(2026, 9, 2),
      }),
    ).toBe(false);
  });

  it("classifies photo, self-reported, and missing tiles", () => {
    expect(profileProofKind({ imageUrl: "https://cdn.example/p.jpg" })).toBe("photo");
    expect(profileProofKind({ imageUrl: null })).toBe("self");
    expect(profileProofKind({ imageUrl: "https://cdn.example/p.jpg", failed: true })).toBe("missing");
    expect(profileProofKind({ imageUrl: "https://cdn.example/p.jpg", bytes: 12 })).toBe("missing");
  });

  it("next badge remain line and under-grid gate", () => {
    const next = {
      id: "streak_7",
      have: 2,
      target: 7,
      rule: "Secure 7 days in a row.",
      earned: false,
    } as V42BadgeState;
    expect(nextBadgeRemainLine(next)).toBe("5 more days in a row.");
    expect(nextUnearnedBadge([
      { ...next, id: "streak_3", earned: true, have: 3, target: 3 },
      next,
    ])?.id).toBe("streak_7");
    expect(badgesMoreFooter(4)).toBe("4 more to earn. Tap the next badge to see them.");
    expect(showNextBadgeUnderGrid(5)).toBe(true);
    expect(showNextBadgeUnderGrid(6)).toBe(false);
  });

  it("privacy lock and stranger preview copy bind on the screens", () => {
    expect(ACCOUNT_PRIVATE).toBe("This account is private.");
    expect(accountPrivateBody("Yaseen")).toBe(
      "Follow each other to see Yaseen's proofs and challenges.",
    );
    const privacy = readFileSync(resolve(__dirname, "../app/settings/privacy.tsx"), "utf8");
    expect(privacy).toContain("SEE_STRANGER");
    expect(privacy).toContain("SWITCH_NEVER_SHARES_KEPT");
    expect(privacy).toContain("visibilitiesForPrivateSwitch");
    expect(privacy).not.toContain("VisGroup");
    expect(privacy).not.toContain("LEVELS");
    const visitor = readFileSync(resolve(__dirname, "../app/profile/[username].tsx"), "utf8");
    expect(visitor).toContain("STRANGER_BANNER");
    expect(visitor).toContain("ACCOUNT_PRIVATE");
    expect(SEE_STRANGER).toBe("See how a stranger sees you");
    expect(STRANGER_BANNER).toBe("This is what someone who isn't your friend sees.");
  });
});
