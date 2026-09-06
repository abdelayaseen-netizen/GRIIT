import { describe, expect, it } from "vitest";
import { proofPhotoFromCheckIn, proofPhotosByDateKey } from "@/lib/profile-v2-proof-photo";

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
