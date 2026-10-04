import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { effectivePhotoProof, reviewPhotoLine } from "@/lib/create-wizard-hard-proof";

describe("effectivePhotoProof", () => {
  it("keeps the stored photo mode on No Days Off", () => {
    expect(effectivePhotoProof("hard", "optional")).toBe("optional");
    expect(effectivePhotoProof("hard", "off")).toBe("off");
    expect(effectivePhotoProof("hard", "required")).toBe("required");
  });

  it("passes the stored value through on standard", () => {
    expect(effectivePhotoProof("standard", "optional")).toBe("optional");
    expect(effectivePhotoProof("standard", "off")).toBe("off");
    expect(effectivePhotoProof("standard", "required")).toBe("required");
  });
});

describe("reviewPhotoLine", () => {
  it("follows the task photo mode, including on No Days Off", () => {
    expect(reviewPhotoLine("hard", "optional")).toBe("Feed · Optional");
    expect(reviewPhotoLine("hard", "off")).toBe("Feed · Off");
    expect(reviewPhotoLine("hard", "required")).toBe("Feed · Required");
    expect(reviewPhotoLine("standard", "off")).toBe("Feed · Off");
    expect(reviewPhotoLine("standard", "optional")).toBe("Feed · Optional");
    expect(reviewPhotoLine("standard", "required")).toBe("Feed · Required");
  });
});

describe("challenges.create photo fields", () => {
  it("does not force a photo when difficulty is hard", () => {
    const src = readFileSync(
      resolve(__dirname, "../backend/trpc/routes/challenges-create.ts"),
      "utf8",
    );
    expect(src).not.toContain("forcePhotoProof");
    expect(src).toContain("photo_mode: task.photo_mode");
    expect(src).toContain("photoRequired: task.photoRequired");
  });
});
