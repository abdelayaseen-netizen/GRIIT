import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PROOF_KEEP,
  PROOF_SHARE,
  PROOF_SHARE_FAILED,
  closingProofEventId,
  proofMomentStatus,
} from "@/lib/proof-moment";

describe("proof moment copy", () => {
  it("assembles the frame 58 status from what is true", () => {
    expect(
      proofMomentStatus({
        hasPhoto: true,
        remainingToday: 3,
        challengeDoneToday: false,
        challengeName: "Iron man",
      }),
    ).toBe("Camera proof, recorded. 3 left to secure today.");
    expect(
      proofMomentStatus({
        hasPhoto: true,
        remainingToday: 2,
        challengeDoneToday: true,
        challengeName: "Iron man",
      }),
    ).toBe("Camera proof, recorded. Iron man is done for today. 2 left to secure today.");
    expect(
      proofMomentStatus({
        hasPhoto: false,
        remainingToday: 1,
        challengeDoneToday: false,
        challengeName: "Iron man",
      }),
    ).toBe("Self-reported, recorded. 1 left to secure today.");
    expect(PROOF_SHARE).toBe("Share to the feed");
    expect(PROOF_KEEP).toBe("Keep it to the record");
    expect(PROOF_SHARE_FAILED).toBe("Not shared. It is in your record.");
  });

  it("picks the closing photo's activity event", () => {
    expect(
      closingProofEventId(
        [
          { eventId: "a", imageUrl: "https://cdn/one.jpg" },
          { eventId: "b", imageUrl: "https://cdn/two.jpg" },
        ],
        "https://cdn/two.jpg",
      ),
    ).toBe("b");
    expect(closingProofEventId([{ eventId: "a", imageUrl: "https://cdn/one.jpg" }], "missing")).toBe(
      "a",
    );
    expect(closingProofEventId([], "https://cdn/one.jpg")).toBeNull();
  });
});

describe("proof moment wiring", () => {
  it("sends shareChoicePending on a camera complete and flips via shareProof", () => {
    const flow = readFileSync(resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"), "utf8");
    const screen = readFileSync(
      resolve(__dirname, "../components/task-v2/ChallengeDoneScreen.tsx"),
      "utf8",
    );
    expect(flow).toContain("shareChoicePending: true");
    expect(flow).toContain("TRPC.checkins.shareProof");
    expect(flow).toContain("closingProofEventId");
    expect(screen).toContain("height: 300");
    expect(screen).toContain("resizeMode=\"cover\"");
    expect(screen).toContain("PROOF_SHARE");
    expect(screen).toContain("PROOF_KEEP");
    expect(screen).toContain("DAY_OPEN_NEXT");
    expect(screen).not.toContain("shareProgressImage");
  });
});
