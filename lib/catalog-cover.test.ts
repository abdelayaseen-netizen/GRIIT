import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { canShowParticipantProof, catalogCoverLabel, catalogCoverUri } from "./catalog-cover";

describe("catalogCoverUri", () => {
  it("never resolves a proof image on a catalog card", () => {
    expect(
      catalogCoverUri({
        featuredProof: { photo_url: "https://cdn.example/task-proofs/u/p.jpg" },
        photo_url: "https://cdn.example/task-proofs/u/p.jpg",
        proof_photo_url: "https://cdn.example/task-proofs/u/q.jpg",
      }),
    ).toBeNull();
  });

  it("uses the challenge cover field only", () => {
    expect(catalogCoverUri({ cover_url: "https://cdn.example/covers/water.jpg" })).toBe(
      "https://cdn.example/covers/water.jpg",
    );
    expect(catalogCoverUri({ cover_image_url: "https://cdn.example/covers/bed.jpg" })).toBe(
      "https://cdn.example/covers/bed.jpg",
    );
    expect(catalogCoverUri(null)).toBeNull();
    expect(catalogCoverLabel({ category: "mind", title: "Read" })).toBe("Read");
    expect(catalogCoverLabel({ title: "Read" })).toBe("Read");
  });

  it("Discover featured does not query activity_events for a cover", () => {
    const discover = readFileSync(
      resolve(__dirname, "../backend/trpc/routes/challenges-discover.ts"),
      "utf8",
    );
    const hero = discover.slice(
      discover.indexOf("getDiscoverFeatured"),
      discover.indexOf("getDiscoverGrid"),
    );
    expect(hero).not.toContain("activity_events");
    expect(hero).not.toContain("proof_photo_url");
    expect(hero).toContain("featuredProof: null");
    const ui = readFileSync(resolve(__dirname, "../components/discover/DiscoverV3.tsx"), "utf8");
    expect(ui).toContain("catalogCoverUri");
    expect(ui).toContain("catalogCoverLabel");
    expect(ui).toContain("featuredJoined");
    expect(ui).toContain("{circle ? (");
    expect(ui).not.toContain("featured.featuredProof?.photo_url");
    const route = readFileSync(resolve(__dirname, "../app/(tabs)/discover.tsx"), "utf8");
    expect(route).toContain("circleCount={featuredQuery.data?.circleCount ?? 0}");
    expect(route).toContain("listMyActive");
    expect(route).not.toContain("joinedTodayCount ?? 0");
  });
});

describe("canShowParticipantProof", () => {
  const owner = "10556c76-3c37-4204-8915-fc7fd3b16a59";
  const other = "22222222-2222-4222-8222-222222222222";

  it("a private proof never appears on another user's view", () => {
    expect(canShowParticipantProof({ shared: false, ownerId: owner, viewerId: other })).toBe(false);
    expect(canShowParticipantProof({ shared: false, ownerId: owner, viewerId: null })).toBe(false);
  });

  it("owner or shared may see the photo", () => {
    expect(canShowParticipantProof({ shared: false, ownerId: owner, viewerId: owner })).toBe(true);
    expect(canShowParticipantProof({ shared: true, ownerId: owner, viewerId: other })).toBe(true);
  });
});
