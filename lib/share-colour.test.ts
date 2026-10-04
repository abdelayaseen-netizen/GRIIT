import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseShareColours, readShareColours, writeShareColour } from "@/lib/share-colour";
import { shareReviewCards } from "@/lib/share-review-cards";
import { paintStrings, buildSharePaint } from "@/lib/share-image";

describe("share colour memory", () => {
  it("defaults to Ink and keeps the last colour per style", async () => {
    expect(parseShareColours(null)).toEqual({});
    expect(parseShareColours("not json")).toEqual({});
    expect(parseShareColours(JSON.stringify({ A: "orange", B: "nope", Z: "white" }))).toEqual({
      A: "orange",
    });
    const mem = new Map<string, string>();
    const store = {
      getItem: async (key: string) => mem.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        mem.set(key, value);
      },
    };
    expect(await readShareColours(store)).toEqual({});
    const next = await writeShareColour({}, "C", "white", store);
    expect(next.C).toBe("white");
    expect(await readShareColours(store)).toEqual({ C: "white" });
    const throwing = {
      getItem: async () => {
        throw new Error("disk");
      },
      setItem: async () => {
        throw new Error("disk");
      },
    };
    expect(await readShareColours(throwing)).toEqual({});
    expect((await writeShareColour({}, "A", "orange", throwing)).A).toBe("orange");
  });
});

describe("dev share export", () => {
  it("view-shots every style and colour and saves each PNG", () => {
    const cards = shareReviewCards();
    expect(cards).toHaveLength(21);
    expect(new Set(cards.map((c) => c.style)).size).toBe(7);
    expect(new Set(cards.map((c) => c.colour)).size).toBe(3);
    const screen = readFileSync(resolve(__dirname, "../app/dev/share-styles.tsx"), "utf8");
    expect(screen).toContain("ViewShot");
    expect(screen).toContain("saveStickerToPhotos");
    expect(screen).toContain("if (!__DEV__) return null");
    expect(screen).toContain("shareReviewCards");
    for (const card of cards) {
      expect(paintStrings(buildSharePaint(card)).join("\n")).not.toContain("griit.app");
    }
  });
});
