/** Frame 54 freeze offer. ds/Sheet copy. Refusal is a real answer, not a call. */
export const USE_A_FREEZE_FOR_YESTERDAY_Q = "Use a freeze for yesterday?";
export const USE_THE_FREEZE = "Use the freeze";
export const NO_LET_IT_RESET = "No, let it reset";
export const NO_FREEZES_LEFT = "No freezes left";
export const SEE_PRO = "See Pro";
export const CLOSE = "Close";
export const FREEZE_REFILL_DAYS = 30;
export const FREEZE_SUCCESS_INVALIDATES = [
  ["home", "bootstrap"],
  ["profiles", "getStats"],
  ["streaks", "getFreezeStatus"],
  ["profiles", "getRecord"],
] as const;

export type FreezeSheetVariant = "offer" | "none";
export type FreezeSheetNetwork = "useFreeze" | "none" | "seePro";

export function freezeSheetVariant(remaining: number): FreezeSheetVariant {
  return remaining > 0 ? "offer" : "none";
}

/** None-left CTA. premium|trial already have the allotment — never "See Pro". */
export function freezeNoneShowsSeePro(subscriptionStatus: string | null | undefined): boolean {
  return subscriptionStatus !== "premium" && subscriptionStatus !== "trial";
}

export function freezeOfferBody(restoredDays: number, remaining: number): string {
  return `Your ${restoredDays}-day streak comes back. ${remaining} left, and it refills 30 days after you use it.`;
}

export function freezeNoneBody(date: string): string {
  return `Yours refills on ${date}. Pro carries four a month instead of one.`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function freezeRefillDateLabel(
  lastUsedIso: string | null | undefined,
  timeZone: string,
  now = new Date(),
): string {
  const tz = timeZone.trim() || "UTC";
  const base = lastUsedIso ? new Date(lastUsedIso) : now;
  const refill = new Date(base.getTime());
  refill.setUTCDate(refill.getUTCDate() + FREEZE_REFILL_DAYS);
  try {
    const day = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric" }).format(refill);
    const month = new Intl.DateTimeFormat("en-GB", { timeZone: tz, month: "long" }).format(refill);
    return `${day} ${month}`;
  } catch {
    return `${refill.getUTCDate()} ${MONTHS[refill.getUTCMonth()]}`;
  }
}

export function freezeSheetNetwork(action: "use" | "refuse" | "close" | "seePro"): FreezeSheetNetwork {
  if (action === "use") return "useFreeze";
  if (action === "seePro") return "seePro";
  return "none";
}

/** Refuse closes the sheet and acks the morning-after for that date key. No network. */
export function freezeRefuseAcksDateKey(): boolean {
  return true;
}

export function freezeUseCallsMutation(): boolean {
  return true;
}
