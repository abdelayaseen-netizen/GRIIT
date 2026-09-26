/** Visibility enum is PUBLIC | FRIENDS | PRIVATE. Solo custom is never PUBLIC. */
export function soloCreateVisibility(
  participationType: string | undefined,
  requested?: string | null,
): string {
  const pt = (participationType ?? "solo").toLowerCase();
  if (pt === "solo") return "PRIVATE";
  if (pt === "team") return "PRIVATE";
  const vis = String(requested ?? "FRIENDS").toUpperCase();
  if (vis === "PUBLIC" || vis === "FRIENDS" || vis === "PRIVATE") return vis;
  return "FRIENDS";
}
