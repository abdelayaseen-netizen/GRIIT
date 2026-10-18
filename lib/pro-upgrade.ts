/**
 * Build 92 chunk 05.3: the GRIIT Pro upgrade sheet opened from a Pro sticker (P1-18).
 * Copy from the Part 1 README table "Upgrade sheet". Prices come from RevenueCat
 * offerings; nothing here knows a number.
 */
import type { PurchasesOffering, PurchasesPackage } from "@/lib/subscription";

export const PRO_SHEET_TITLE = "GRIIT Pro";
export const PRO_SHEET_FREE_LINE = "Everything in Free stays free.";
export const PRO_SHEET_BULLETS = [
  "Streak glow and Progress ring stickers",
  "4 freezes instead of 2",
  "Stats for every challenge",
  "Auto-verify runs with Strava",
] as const;
export const PRO_SHEET_PRICE_SOURCE = "Price from the App Store via RevenueCat.";
export const PRO_SHEET_TRY = "Try GRIIT Pro";
export const PRO_SHEET_NOT_NOW = "Not now";
export const PRO_SHEET_PRICE_LOADING = "Loading prices…";
export const PRO_SHEET_PRICE_UNAVAILABLE = "Prices aren't available right now.";
export const PRO_SHEET_PURCHASE_FAILED = "Purchase didn't go through. Try again.";

export type ProPackages = { monthly: PurchasesPackage | null; annual: PurchasesPackage | null };

function isKind(pkg: PurchasesPackage, kind: "monthly" | "annual"): boolean {
  const hay = `${pkg.packageType} ${pkg.identifier} ${pkg.product?.title ?? ""}`.toLowerCase();
  return kind === "annual" ? /annual|year/.test(hay) : /month/.test(hay);
}

/** The monthly and annual packages of the current offering, when present. */
export function proPackagesFromOffering(offering: PurchasesOffering | null | undefined): ProPackages {
  const pkgs = offering?.availablePackages ?? [];
  return {
    monthly: pkgs.find((p) => isKind(p, "monthly")) ?? null,
    annual: pkgs.find((p) => isKind(p, "annual")) ?? null,
  };
}

/** "{price} a month or {price} a year." — only the prices RevenueCat returned. */
export function proPriceLine(prices: { monthly: string | null; annual: string | null }): string {
  const m = prices.monthly?.trim() ?? "";
  const a = prices.annual?.trim() ?? "";
  if (m && a) return `${m} a month or ${a} a year.`;
  if (m) return `${m} a month.`;
  if (a) return `${a} a year.`;
  return "";
}

/** "Try GRIIT Pro" buys the annual package when there is one (the paywall's default), else monthly. */
export function proTrialPackage(pkgs: ProPackages): PurchasesPackage | null {
  return pkgs.annual ?? pkgs.monthly;
}
