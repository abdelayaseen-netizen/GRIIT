import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Flame, ChevronRight } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";

export type StreakAtRiskData = {
  challenge_id: string;
  challenge_slug: string | null;
  challenge_name: string;
  streak_length: number;
  hours_remaining: number;
  proof_type: "photo" | "text" | "location";
};

export interface StreakRiskBannerProps {
  /** Output of `feed.getStreakAtRisk`. Banner returns null when this is null. */
  data: StreakAtRiskData | null | undefined;
}

function formatRemaining(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "in 0m";
  if (hours < 1) {
    const minutes = Math.max(1, Math.round(hours * 60));
    return `in ${minutes}m`;
  }
  if (hours <= 24) {
    return `in ${Math.round(hours)}h`;
  }
  const days = Math.floor(hours / 24);
  const remainder = Math.round(hours - days * 24);
  if (remainder <= 0) return `in ${days}d`;
  return `in ${days}d ${remainder}h`;
}

export const StreakRiskBanner = React.memo(function StreakRiskBanner({
  data,
}: StreakRiskBannerProps) {
  const router = useRouter();
  if (!data) return null;

  const remaining = formatRemaining(data.hours_remaining);
  const target = (data.challenge_slug ?? data.challenge_id).trim() || data.challenge_id;
  const a11y = `Your ${data.streak_length}-day streak in ${data.challenge_name} ends ${remaining}. Tap to view.`;

  const handlePress = () => {
    if (!target) return;
    router.push(ROUTES.CHALLENGE_ID(target) as never);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      hitSlop={6}
      style={styles.container}
    >
      <View style={styles.iconWrap}>
        <Flame size={18} color={DS_COLORS.DANGER_ACCENT} strokeWidth={2} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          Your {data.streak_length}-day streak ends {remaining}
        </Text>
        <Text style={styles.subline} numberOfLines={1}>
          {data.challenge_name} · post proof to keep it
        </Text>
      </View>
      <ChevronRight size={18} color={DS_COLORS.DANGER_ACCENT} strokeWidth={2} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.md,
    marginHorizontal: DS_SPACING.lg,
    marginTop: DS_SPACING.md,
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.lg,
    backgroundColor: DS_COLORS.DANGER_BG_SUBTLE,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    borderColor: DS_COLORS.DANGER_BORDER_SUBTLE,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: DS_RADIUS.MD,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.WHITE,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.DANGER_TEXT_PRIMARY,
  },
  subline: {
    fontSize: 12,
    color: DS_COLORS.DANGER_TEXT_SECONDARY,
    marginTop: 2,
  },
});
