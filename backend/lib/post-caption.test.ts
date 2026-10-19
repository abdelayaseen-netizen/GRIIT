import { describe, expect, it } from "vitest";
import { FINISH_COPY } from "../../lib/finish-flow";
import { captionBlock, captionToStore, CAPTION_MAX, postCaptionFromMetadata } from "./post-caption";

describe("12b.2 public captions", () => {
  it("a curse word is refused with the caption message", () => {
    expect(captionBlock("this fucking water")).toBe("Those words aren't allowed in a caption. Try different ones.");
  });

  it("a clean caption passes and is stored trimmed", () => {
    expect(captionBlock("two litres before lunch")).toBeNull();
    expect(captionToStore("  two litres  ")).toBe("two litres");
    expect(captionToStore("   ")).toBeNull();
  });

  it("keeps the 120-character limit", () => {
    expect(CAPTION_MAX).toBe(FINISH_COPY.captionMax);
    expect(captionToStore("a".repeat(200))).toHaveLength(120);
  });

  it("a post shows metadata.caption only, never a private note", () => {
    expect(postCaptionFromMetadata({ caption: "Before work." })).toBe("Before work.");
    expect(postCaptionFromMetadata({ note_text: "my private journal" } as { caption?: unknown })).toBeNull();
    expect(postCaptionFromMetadata({ caption: "" })).toBeNull();
    expect(postCaptionFromMetadata(null)).toBeNull();
  });
});
