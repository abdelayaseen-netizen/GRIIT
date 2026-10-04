/** Tab that opened the task flow. Posting and Done return here by name. */

export const ORIGIN_TABS = ["home", "discover", "create", "activity", "profile"] as const;

export type OriginTab = (typeof ORIGIN_TABS)[number];

export function originTabFromParam(value: string | null | undefined): OriginTab {
  const tab = (value ?? "").trim().toLowerCase();
  if (tab === "discover" || tab === "create" || tab === "activity" || tab === "profile") return tab;
  return "home";
}

/** Named tab route. Home is the tabs index, `/(tabs)`, which is app/(tabs)/index.tsx. */
export function originTabHref(tab: OriginTab): "/(tabs)" | "/(tabs)/discover" | "/(tabs)/create" | "/(tabs)/activity" | "/(tabs)/profile" {
  if (tab === "discover") return "/(tabs)/discover";
  if (tab === "create") return "/(tabs)/create";
  if (tab === "activity") return "/(tabs)/activity";
  if (tab === "profile") return "/(tabs)/profile";
  return "/(tabs)";
}
