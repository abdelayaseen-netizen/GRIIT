import { describe, expect, it } from "vitest";
import { DS_COLORS } from "@/lib/design-system";

function normalizeHex(hex: string): string {
  const clean = hex.trim().replace("#", "");
  if (clean.length === 3) {
    return `#${clean
      .split("")
      .map((ch) => ch + ch)
      .join("")
      .toUpperCase()}`;
  }
  return `#${clean.toUpperCase()}`;
}

function srgbChannelToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  const rl = srgbChannelToLinear(r);
  const gl = srgbChannelToLinear(g);
  const bl = srgbChannelToLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(fg: string, bg: string): number {
  const lf = relativeLuminance(fg);
  const lb = relativeLuminance(bg);
  return (Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05);
}

type ContrastCase = {
  label: string;
  fg: string;
  bg: string;
  minRatio: number;
};

const CASES: ContrastCase[] = [
  { label: "TEXT_PRIMARY on BG_PAGE", fg: DS_COLORS.TEXT_PRIMARY, bg: DS_COLORS.BG_PAGE, minRatio: 4.5 },
  { label: "TEXT_SECONDARY on BG_PAGE", fg: DS_COLORS.TEXT_SECONDARY, bg: DS_COLORS.BG_PAGE, minRatio: 4.5 },
  { label: "TEXT_TERTIARY on BG_PAGE", fg: DS_COLORS.TEXT_TERTIARY, bg: DS_COLORS.BG_PAGE, minRatio: 3.0 },
  { label: "TEXT_ON_ACCENT on ACCENT", fg: DS_COLORS.TEXT_ON_ACCENT, bg: DS_COLORS.ACCENT, minRatio: 4.5 },
  { label: "TEXT_PRIMARY on BG_CARD", fg: DS_COLORS.TEXT_PRIMARY, bg: DS_COLORS.BG_CARD, minRatio: 4.5 },
  { label: "TEXT_SECONDARY on BG_CARD", fg: DS_COLORS.TEXT_SECONDARY, bg: DS_COLORS.BG_CARD, minRatio: 4.5 },
  { label: "TEXT_TERTIARY on BG_CARD", fg: DS_COLORS.TEXT_TERTIARY, bg: DS_COLORS.BG_CARD, minRatio: 3.0 },
  { label: "textPrimary on surface", fg: DS_COLORS.textPrimary, bg: DS_COLORS.surface, minRatio: 4.5 },
  { label: "textSecondary on surface", fg: DS_COLORS.textSecondary, bg: DS_COLORS.surface, minRatio: 4.5 },
];

describe("design system contrast checks", () => {
  it("reports all measured pairs", () => {
    expect(CASES.length).toBeGreaterThanOrEqual(8);
  });

  it("meets WCAG target ratios for audited pairs", () => {
    const failures = CASES.map((entry) => {
      const ratio = contrastRatio(entry.fg, entry.bg);
      return { ...entry, ratio };
    }).filter((entry) => entry.ratio < entry.minRatio);

    expect(failures, JSON.stringify(failures, null, 2)).toHaveLength(0);
  });
});
