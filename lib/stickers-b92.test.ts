/**
 * Build 92 chunk 05: share stickers (Part 1.3, frames P1-12 … P1-18 and the styles grid).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SHARE_H,
  SHARE_W,
  STICKER_FOOTER_DOMAIN,
  STICKER_STYLES,
  buildSharePaint,
  paintStrings,
  stickerMark,
  stickerStyleLabel,
  stickerStyleMeta,
  storyShotSize,
  stylesForMoment,
  weekStripCells,
  type ShareCardInput,
  type ShareColourId,
} from "@/lib/share-image";
import {
  PRO_SHEET_BULLETS,
  PRO_SHEET_FREE_LINE,
  PRO_SHEET_NOT_NOW,
  PRO_SHEET_PRICE_SOURCE,
  PRO_SHEET_TITLE,
  PRO_SHEET_TRY,
  proPriceLine,
  proPackagesFromOffering,
} from "@/lib/pro-upgrade";

const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");
const ORANGE = ["#DC5401", "#BB471D"];
const B92 = ["photo", "week", "glow", "ring"] as const;
const THEMES: ShareColourId[] = ["ink", "orange", "white"];

const base: Omit<ShareCardInput, "style" | "colour"> = {
  challenge: "Read 30",
  task: "Read 10 pages",
  day: 16,
  durationDays: 30,
  streak: 8,
  username: "yaseen",
};

function paintJson(style: (typeof B92)[number], colour: ShareColourId, extra: Partial<ShareCardInput> = {}) {
  const paint = buildSharePaint({ ...base, style, colour, ...extra });
  return { paint, json: JSON.stringify(paint.block.items) };
}

function countOrange(json: string): number {
  return ORANGE.reduce((n, hex) => n + json.split(hex).length - 1, 0);
}

describe("05.1 carousel: 4 styles × 3 themes", () => {
  it("every task and day moment lists Photo, Week strip, Streak glow, Progress ring, in that order, always", () => {
    for (const moment of ["photo_proof", "self_reported", "day_secured"] as const) {
      expect(stylesForMoment(moment)).toEqual(B92);
      expect(stylesForMoment(moment, { streak: 0, hasPhoto: false })).toEqual(B92);
    }
    expect(STICKER_STYLES.map((s) => s.label)).toEqual(["Photo", "Week strip", "Streak glow", "Progress ring"]);
    expect(STICKER_STYLES.filter((s) => s.pro).map((s) => s.key)).toEqual(["glow", "ring"]);
    expect(STICKER_STYLES.filter((s) => s.transparent).map((s) => s.key)).toEqual(["glow", "ring"]);
  });

  it("the sheet shows the style name, the Free / GRIIT Pro label, dots and the Ink · Orange · White control", () => {
    const sheet = read("components/share/ShareSystemSheet.tsx");
    expect(sheet).toContain("stickerStyleLabel(");
    expect(sheet).toContain('testID="sticker-style-name"');
    expect(sheet).toContain("STICKER_FREE");
    expect(sheet).toContain("STICKER_PRO");
    expect(sheet).toContain('testID="sticker-theme"');
    expect(sheet).toContain("useProStatus()");
    expect(sheet).not.toContain("SAMPLE_STORY");
  });

  it("the whole card fits an iPhone SE: preview height never exceeds the room above the controls", () => {
    const sheet = read("components/share/ShareSystemSheet.tsx");
    expect(sheet).toMatch(/previewH = Math\.min\(SHARE_PREVIEW_H, Math\.max\(\d+, height - insets\.top - insets\.bottom - \d+\)\)/);
  });
});

describe("05.1 orange rule per theme", () => {
  it("White shows no orange except the flame", () => {
    for (const style of B92) {
      const { paint } = paintJson(style, "white", { photoUri: "file://p.jpg", proofSource: "camera" });
      const flames = paint.block.items.flatMap(function walk(item): string[] {
        if (item.kind === "flame" || item.kind === "glowflame") return [item.color];
        if (item.kind === "row" || item.kind === "ring") return item.items.flatMap(walk);
        return [];
      });
      const withoutFlames = JSON.stringify(
        paint.block.items,
        (key, value) => (key === "color" && flames.includes(value as string) ? undefined : value),
      );
      expect(countOrange(withoutFlames), `${style} white`).toBe(0);
      expect(paint.background === "transparent" || !ORANGE.includes(paint.background)).toBe(true);
    }
  });

  it("the ring is never orange and Orange sits on an orange plate with ink type", () => {
    for (const colour of THEMES) {
      const { paint } = paintJson("ring", colour, { proofSource: "camera" });
      const ring = paint.block.items.find((i) => i.kind === "ring");
      expect(ring?.kind).toBe("ring");
      if (ring?.kind === "ring") {
        expect(ORANGE.includes(ring.stroke)).toBe(false);
        expect(ORANGE.includes(ring.track)).toBe(false);
      }
      expect(paint.transparent).toBe(true);
    }
    const orange = paintJson("ring", "orange");
    expect(orange.paint.block.plate?.color).toBe("#DC5401");
    expect(orange.json).toContain("#0F0F0F");
    const glow = paintJson("glow", "orange");
    expect(glow.paint.block.plate?.color).toBe("#DC5401");
    const glowFlame = glow.paint.block.items.find((i) => i.kind === "glowflame");
    expect(glowFlame?.kind === "glowflame" && glowFlame.color).toBe("#0F0F0F");
  });

  it("Ink shows orange only on the flame and the done checks", () => {
    const week = paintJson("week", "ink", { proofSource: "camera" });
    const strip = week.paint.block.items.find((i) => i.kind === "week");
    expect(strip?.kind === "week" && strip.done).toBe("#DC5401");
    const photo = paintJson("photo", "ink", { photoUri: "file://p.jpg", proofSource: "camera" });
    expect(countOrange(photo.json)).toBe(0);
    const white = paintJson("week", "white");
    const whiteStrip = white.paint.block.items.find((i) => i.kind === "week");
    expect(whiteStrip?.kind === "week" && ORANGE.includes(whiteStrip.done)).toBe(false);
  });
});

describe("05.2 no stock photos", () => {
  it("Photo with no proof photo is a plain card in the theme colour, never a photo", () => {
    for (const colour of THEMES) {
      const { paint } = paintJson("photo", colour, { photoUri: null, proofSource: "self" });
      expect(paint.photo).toBe(false);
      expect(paint.scrim).toBe(false);
      expect(paint.transparent).toBe(false);
      expect(paint.background).toBe(colour === "ink" ? "#0F0F0F" : colour === "orange" ? "#DC5401" : "#F5F3EE");
      expect(paintStrings(paint)).toContain("Day 16");
      expect(paintStrings(paint)).toContain("Self-reported");
    }
    expect(stickerStyleLabel("photo", false)).toBe("Photo · plain card");
    expect(stickerStyleLabel("photo", true)).toBe("Photo");
    const sheet = read("components/share/ShareSystemSheet.tsx");
    const image = read("components/share/ShareImage.tsx");
    for (const src of [sheet, image]) {
      expect(src).not.toMatch(/require\(["'].*\.(jpg|jpeg|png)["']\)/);
      expect(src).not.toContain("unsplash");
    }
  });

  it("Photo with the user's photo paints it full-bleed with the day stamp over a scrim", () => {
    const { paint } = paintJson("photo", "ink", { photoUri: "file://p.jpg", proofSource: "camera" });
    expect(paint.photo).toBe(true);
    expect(paint.scrim).toBe(true);
    expect(paintStrings(paint)).toContain("Day 16");
    expect(paintStrings(paint)).toContain("Read 30 · Day 16 of 30");
    expect(paintStrings(paint)).toContain("Verified");
    expect(paintStrings(paint)).toContain(`@yaseen · ${STICKER_FOOTER_DOMAIN}`);
  });
});

describe("05.3 Pro lock", () => {
  it("Streak glow and Progress ring are Pro; Photo and Week strip are free", () => {
    expect(stickerStyleMeta("glow").pro).toBe(true);
    expect(stickerStyleMeta("ring").pro).toBe(true);
    expect(stickerStyleMeta("photo").pro).toBe(false);
    expect(stickerStyleMeta("week").pro).toBe(false);
  });

  it("a locked style hides the export row, shows Unlock with GRIIT Pro and opens the upgrade sheet", () => {
    const sheet = read("components/share/ShareSystemSheet.tsx");
    expect(sheet).toContain("const locked = ");
    expect(sheet).toContain('testID="sticker-unlock"');
    expect(sheet).toContain("STICKER_UNLOCK");
    expect(sheet).toContain("<ProUpgradeSheet");
    expect(sheet).toContain('testID="sticker-pro-chip"');
  });

  it("the upgrade sheet copy and prices come from the table and RevenueCat, never hard-coded", () => {
    expect(PRO_SHEET_TITLE).toBe("GRIIT Pro");
    expect(PRO_SHEET_FREE_LINE).toBe("Everything in Free stays free.");
    expect(PRO_SHEET_BULLETS).toEqual([
      "Streak glow and Progress ring stickers",
      "4 freezes instead of 2",
      "Stats for every challenge",
      "Auto-verify runs with Strava",
    ]);
    expect(PRO_SHEET_PRICE_SOURCE).toBe("Price from the App Store via RevenueCat.");
    expect(PRO_SHEET_TRY).toBe("Try GRIIT Pro");
    expect(PRO_SHEET_NOT_NOW).toBe("Not now");
    expect(proPriceLine({ monthly: "$4.99", annual: "$29.99" })).toBe("$4.99 a month or $29.99 a year.");
    expect(proPriceLine({ monthly: "$4.99", annual: null })).toBe("$4.99 a month.");
    expect(proPriceLine({ monthly: null, annual: null })).toBe("");
    const offering = {
      availablePackages: [
        { identifier: "$rc_annual", packageType: "ANNUAL", product: { priceString: "$29.99" } },
        { identifier: "$rc_monthly", packageType: "MONTHLY", product: { priceString: "$4.99" } },
      ],
    };
    const pkgs = proPackagesFromOffering(offering as never);
    expect(pkgs.monthly?.product?.priceString).toBe("$4.99");
    expect(pkgs.annual?.product?.priceString).toBe("$29.99");
    const src = read("components/share/ProUpgradeSheet.tsx");
    expect(src).toContain("getOfferings()");
    expect(src).toContain("purchasePackage(");
    expect(src).not.toMatch(/\$\d+\.\d\d/);
    expect(read("lib/pro-upgrade.ts")).not.toMatch(/\$\d+\.\d\d/);
  });
});

describe("05.4 verified mark", () => {
  it("Verified only for camera or Strava proof", () => {
    expect(stickerMark({ proofSource: "camera" })).toBe("Verified");
    expect(stickerMark({ proofSource: "strava" })).toBe("Verified");
    expect(stickerMark({ proofSource: "self" })).toBe("Self-reported");
    expect(stickerMark({})).toBe("Self-reported");
    expect(stickerMark({ cameraSeal: true })).toBe("Verified");
    expect(stickerMark({ cameraSeal: true, proofSource: "self" })).toBe("Self-reported");
    for (const style of B92) {
      expect(paintStrings(buildSharePaint({ ...base, style, colour: "ink", proofSource: "self" }))).toContain("Self-reported");
      expect(paintStrings(buildSharePaint({ ...base, style, colour: "ink", proofSource: "strava" }))).toContain("Verified");
    }
  });
});

describe("05.1 week strip and streak content", () => {
  it("the strip is the last 7 days ending today, from the cells when known, else the streak", () => {
    expect(weekStripCells({ streak: 8 })).toEqual([true, true, true, true, true, true, true]);
    expect(weekStripCells({ streak: 3 })).toEqual([false, false, false, false, true, true, true]);
    expect(weekStripCells({ streak: 0 })).toEqual([false, false, false, false, false, false, false]);
    expect(weekStripCells({ cells: ["secured", "missed", "secured", "secured", "today"] })).toEqual([
      false, false, true, false, true, true, true,
    ]);
    const week = buildSharePaint({ ...base, style: "week", colour: "ink", streak: 8 });
    expect(paintStrings(week)).toContain("8");
    expect(paintStrings(week)).toContain("days in a row");
    const one = buildSharePaint({ ...base, style: "glow", colour: "white", streak: 1 });
    expect(paintStrings(one)).toContain("day in a row");
    const ring = buildSharePaint({ ...base, style: "ring", colour: "ink" });
    expect(paintStrings(ring)).toContain("Day 16");
    expect(paintStrings(ring)).toContain("of 30");
    expect(paintStrings(ring)).toContain("Read 30");
  });
});

describe("05.5 export", () => {
  it("the story is 1080×1920 and transparent styles capture the sticker block alone", () => {
    expect(SHARE_W).toBe(1080);
    expect(SHARE_H).toBe(1920);
    const sheet = read("components/share/ShareSystemSheet.tsx");
    expect(sheet).toContain("stickerShotRef");
    expect(sheet).toContain("captureSticker");
    expect(sheet).toMatch(/format: "png", quality: 1, result: "tmpfile", \.\.\.storyShotSize\(PixelRatio\.get\(\)\)/);
    // view-shot sizes in points × device scale: 3× → 360×640 pt, 2× (SE) → 540×960 pt, both 1080×1920 px.
    expect(storyShotSize(3)).toEqual({ width: 360, height: 640 });
    expect(storyShotSize(2)).toEqual({ width: 540, height: 960 });
    expect(sheet).toContain("SHARE_TARGET_STORY");
    expect(sheet).toContain("SHARE_TARGET_COPY");
    expect(sheet).toContain("SHARE_TARGET_SAVE");
    expect(sheet).toContain("SHARE_TARGET_MESSAGES");
    expect(sheet).toContain("SHARE_TARGET_MORE");
    for (const style of ["glow", "ring"] as const) {
      expect(buildSharePaint({ ...base, style, colour: "ink" }).transparent).toBe(true);
    }
    for (const style of ["photo", "week"] as const) {
      expect(buildSharePaint({ ...base, style, colour: "ink" }).transparent).toBe(false);
    }
  });

  it("the toast and Day secured Share open the carousel, hosted at the root layout", () => {
    const host = read("components/share/StickerCarouselHost.tsx");
    expect(host).toContain("registerStickerCarousel((next) => setToast(next))");
    expect(host).toContain("<ShareSystemSheet");
    expect(read("app/_layout.tsx")).toContain("<StickerCarouselHost />");
    // Hosted in the tabs layout the sheet never presented over Day secured (a pushed root-stack screen).
    const tabs = read("app/(tabs)/_layout.tsx");
    expect(tabs).not.toContain("registerStickerCarousel(");
    expect(tabs).not.toContain("<ShareSystemSheet");
    expect(read("app/task/secured.tsx")).toContain("openStickerCarousel({");
    expect(read("lib/sticker-carousel.ts")).not.toContain("Stub until chunk 05");
  });
});
