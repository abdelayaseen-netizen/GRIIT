import type { DiscoverCategory } from "@/components/discover/CategoryChips";
import { profilePrimaryName } from "@/lib/profile-display";

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

/** People row: drop the viewer, auto user_ accounts, and anyone with no real name. */
export function discoverPeopleVisible<
  T extends { user_id: string; username?: string | null; display_name?: string | null },
>(people: readonly T[], selfId?: string | null): T[] {
  return discoverPeopleWithoutSelf(people, selfId).filter((p) => {
    const username = (p.username ?? "").trim();
    if (/^user_/i.test(username)) return false;
    const name = profilePrimaryName({ username: p.username, display_name: p.display_name });
    return name.length > 0 && !/^user_/i.test(name);
  });
}

/** The featured card already shows this challenge. The grid must not repeat it. */
export function discoverGridWithoutHero<T extends { id: string }>(
  challenges: readonly T[],
  heroId?: string | null,
): T[] {
  if (!heroId) return [...challenges];
  return challenges.filter((c) => c.id !== heroId);
}
