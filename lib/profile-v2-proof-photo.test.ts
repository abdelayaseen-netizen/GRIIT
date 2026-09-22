import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isProofImageUrl,
  proofImageUrlForCheckIn,
  proofPhotoFromCheckIn,
  proofPhotosByDateKey,
  proofTilePostId,
} from "@/lib/profile-v2-proof-photo";

describe("proofPhotoFromCheckIn", () => {
  it("prefers photo_url, then proof_url, then completion_image_url", () => {
    expect(
      proofPhotoFromCheckIn({
        photo_url: "https://cdn.example/a.jpg",
        proof_url: "https://cdn.example/b.jpg",
        completion_image_url: "https://cdn.example/c.jpg",
      })
    ).toBe("https://cdn.example/a.jpg");
    expect(
      proofPhotoFromCheckIn({
        photo_url: " ",
        proof_url: "https://cdn.example/b.jpg",
      })
    ).toBe("https://cdn.example/b.jpg");
    expect(proofPhotoFromCheckIn({ completion_image_url: "https://cdn.example/c.jpg" })).toBe(
      "https://cdn.example/c.jpg"
    );
    expect(proofPhotoFromCheckIn({ photo_url: "not-a-url" })).toBe(null);
  });

  it("reads a checkins.complete row and accepts file:// for Secured", () => {
    // backend/trpc/routes/checkins.ts:772-774
    const written = {
      photo_url: "https://cdn.example/task-proofs/u/p.jpg",
      proof_url: "https://cdn.example/task-proofs/u/p.jpg",
      completion_image_url: "https://cdn.example/task-proofs/u/p.jpg",
      proof_photo_url: null as string | null,
    };
    expect(proofImageUrlForCheckIn(written)).toBe("https://cdn.example/task-proofs/u/p.jpg");
    expect(proofImageUrlForCheckIn({ proof_photo_url: "https://cdn.example/legacy.jpg" })).toBeNull();
    expect(proofImageUrlForCheckIn({ photo_url: "file:///var/mobile/proof.jpg" })).toBe(
      "file:///var/mobile/proof.jpg",
    );
    expect(isProofImageUrl("file:///var/mobile/proof.jpg")).toBe(true);
    expect(isProofImageUrl("https://cdn.example/p.jpg")).toBe(true);
    expect(isProofImageUrl("not-a-url")).toBe(false);
    expect(
      proofTilePostId(
        [
          {
            id: "evt-1",
            photoUrl: written.photo_url,
            proofPhotoUrl: null,
            createdAt: "2026-09-17T12:00:00.000Z",
          },
        ],
        { imageUrl: written.photo_url, dateKey: "2026-09-17" },
      ),
    ).toBe("evt-1");
    const image = readFileSync(resolve(__dirname, "../components/ds/ProofImage.tsx"), "utf8");
    expect(image).toContain("isProofImageUrl(request)");
    const feed = readFileSync(resolve(__dirname, "../components/feed/FeedPostV3.tsx"), "utf8");
    expect(feed).toContain("liveFeedProofUrl(post)");
    const list = readFileSync(resolve(__dirname, "./live-feed-list.ts"), "utf8");
    expect(list).toContain("proofImageUrlForCheckIn");
    const moment = readFileSync(
      resolve(__dirname, "../components/task-v2/MomentScreenV3.tsx"),
      "utf8",
    );
    expect(moment).toContain("proofImageUrlForCheckIn({ photo_url: proofUri })");
    const own = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    expect(own).not.toContain("PROFILE_V3_FOOTNOTE");
    expect(own).toContain("ROUTES.PROOF");
  });
});

describe("proofPhotosByDateKey", () => {
  it("keeps the first photo per date and skips text-only rows", () => {
    const map = proofPhotosByDateKey([
      { date_key: "2026-09-01", photo_url: "https://cdn.example/1.jpg" },
      { date_key: "2026-09-01", photo_url: "https://cdn.example/later.jpg" },
      { date_key: "2026-09-02", photo_url: null, proof_url: null },
    ]);
    expect(map.get("2026-09-01")).toBe("https://cdn.example/1.jpg");
    expect(map.has("2026-09-02")).toBe(false);
  });
});
