import { describe, expect, it } from "vitest";
import { deliverResizedProof, proofLongEdgeSize, PROOF_JPEG_QUALITY, PROOF_LONG_EDGE } from "@/lib/proof-resize";

describe("proofLongEdgeSize", () => {
  it("outputs a long edge of 1080 or less", () => {
    const big = proofLongEdgeSize(4032, 3024);
    expect(Math.max(big.width, big.height)).toBe(PROOF_LONG_EDGE);
    expect(Math.max(big.width, big.height)).toBeLessThanOrEqual(1080);
    expect(big).toEqual({ width: 1080, height: 810 });

    const tall = proofLongEdgeSize(1200, 4000);
    expect(Math.max(tall.width, tall.height)).toBeLessThanOrEqual(1080);
    expect(tall.height).toBe(1080);

    const small = proofLongEdgeSize(800, 600);
    expect(Math.max(small.width, small.height)).toBeLessThanOrEqual(1080);
    expect(small).toEqual({ width: 800, height: 600 });
    expect(PROOF_JPEG_QUALITY).toBe(0.7);
  });
});

describe("deliverResizedProof", () => {
  it("uploads the resized file, not the original", async () => {
    const received: string[] = [];
    let resizeEdge = 0;
    const result = await deliverResizedProof({
      uri: "file://original.jpg",
      width: 4032,
      height: 3024,
      manipulate: async (uri, actions) => {
        expect(uri).toBe("file://original.jpg");
        const edge = Math.max(actions[0]!.resize.width, actions[0]!.resize.height);
        resizeEdge = edge;
        expect(edge).toBeLessThanOrEqual(1080);
        return { uri: "file://resized.jpg" };
      },
      upload: async (uri) => {
        received.push(uri);
        return { url: "user/resized.jpg" };
      },
    });
    expect(resizeEdge).toBe(1080);
    expect(received).toEqual(["file://resized.jpg"]);
    expect(result).toEqual({ url: "user/resized.jpg" });
  });
});
