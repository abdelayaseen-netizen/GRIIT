import type { ComponentType } from "react";
import { Zap, Star, Trophy, Target, Check, Users, Heart, MessageCircle, Hammer, Flag } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

export type BadgeLucideProps = { size?: number; color?: string; strokeWidth?: number };

export const BADGE_ICONS: Record<string, ComponentType<BadgeLucideProps>> = {
  Zap,
  Star,
  Trophy,
  Target,
  Check,
  Users,
  Heart,
  MessageCircle,
  Hammer,
  Flag,
};

export function badgeAccentFor(color: string): { bg: string; stroke: string } {
  switch (color) {
    case "coral":
      return { bg: DS_COLORS.PROFILE_STAT_CORAL_BG, stroke: DS_COLORS.PROFILE_STAT_CORAL_ICON };
    case "amber":
      return { bg: DS_COLORS.PROFILE_STAT_AMBER_BG, stroke: DS_COLORS.PROFILE_STAT_AMBER_ICON };
    case "purple":
      return { bg: DS_COLORS.PROFILE_TIER_WARRIOR_BG, stroke: DS_COLORS.PROFILE_TIER_WARRIOR_TEXT };
    case "teal":
      return { bg: DS_COLORS.PROFILE_STAT_TEAL_BG, stroke: DS_COLORS.PROFILE_STAT_TEAL_ICON };
    case "blue":
      return { bg: DS_COLORS.PROFILE_STAT_BLUE_BG, stroke: DS_COLORS.PROFILE_STAT_BLUE_ICON };
    default:
      return { bg: DS_COLORS.PROFILE_STAT_CORAL_BG, stroke: DS_COLORS.PROFILE_STAT_CORAL_ICON };
  }
}
