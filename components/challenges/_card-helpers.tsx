import {
  Dumbbell,
  Brain,
  BookHeart,
  Target,
  type LucideIcon,
} from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";

export type ChallengeCategory = "body" | "mind" | "faith" | "focus";
export type ChallengeDifficulty = "EASY" | "MED" | "HARD";

export interface CategoryStyle {
  Icon: LucideIcon;
  tint: string;
  iconColor: string;
}

/** Single source of truth for category-to-icon-and-color mapping.
 *  Used by TeamChallengeCard / CompactChallengeRow / DailyCard. */
export function getCategoryStyle(category: ChallengeCategory): CategoryStyle {
  switch (category) {
    case "body":
      return {
        Icon: Dumbbell,
        tint: DS_V3.color.brandTint,
        iconColor: DS_V3.color.brandText,
      };
    case "mind":
      return {
        Icon: Brain,
        tint: DS_V3.color.brandTint,
        iconColor: DS_V3.color.brandText,
      };
    case "faith":
      return {
        Icon: BookHeart,
        tint: DS_V3.color.brandTint,
        iconColor: DS_V3.color.brandText,
      };
    case "focus":
    default:
      return {
        Icon: Target,
        tint: DS_V3.color.brandTint,
        iconColor: DS_V3.color.brandText,
      };
  }
}

/** Display string for difficulty: "Easy" / "Medium" / "Hard". */
export function difficultyDescriptive(d: ChallengeDifficulty): string {
  if (d === "EASY") return "Easy";
  if (d === "HARD") return "Hard";
  return "Medium";
}

/** Pluralized day unit. */
export function dayUnit(days: number): string {
  return days === 1 ? "day" : "days";
}
