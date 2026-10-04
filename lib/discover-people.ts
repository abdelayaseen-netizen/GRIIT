import type { DiscoverCategory } from "@/components/discover/CategoryChips";

/** Backend getDiscoverFeatured still accepts the v3 chip set. */
export function discoverFeaturedChip(
  category: DiscoverCategory,
): "all" | "body" | "mind" | "faith" | "focus" {
  if (category === "fitness" || category === "body") return "body";
  if (category === "mind") return "mind";
  if (category === "faith") return "faith";
  if (category === "discipline" || category === "focus") return "focus";
  return "all";
}

export function discoverCategoryMatches(
  stored: string | null | undefined,
  selected: DiscoverCategory,
): boolean {
  if (selected === "all" || selected === "for_you" || selected === "trending") {
    return true;
  }
  const c = (stored ?? "").toLowerCase();
  if (selected === "fitness") return c === "fitness" || c === "body";
  if (selected === "discipline") return c === "discipline" || c === "focus";
  return c === selected;
}

export function discoverPeopleWithoutSelf<T extends { user_id: string }>(
  people: readonly T[],
  selfId?: string | null,
): T[] {
  if (!selfId) return [...people];
  return people.filter((p) => p.user_id !== selfId);
}

/** The featured card already shows this challenge. The grid must not repeat it. */
export function discoverGridWithoutHero<T extends { id: string }>(
  challenges: readonly T[],
  heroId?: string | null,
): T[] {
  if (!heroId) return [...challenges];
  return challenges.filter((c) => c.id !== heroId);
}
