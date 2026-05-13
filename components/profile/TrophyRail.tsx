import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Zap } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { BADGE_ICONS, badgeAccentFor } from "@/lib/profile-badges";

export interface TrophyRailBadge {
  id: string;
  slug?: string;
  name: string;
  icon: string;
  color: string;
  progress?: number;
  total?: number;
  earnedAt?: string | null;
}

export interface TrophyRailProps {
  earned: TrophyRailBadge[];
  next: TrophyRailBadge[];
  onPressBadge: (badge: TrophyRailBadge, lit: boolean) => void;
  onSeeAllPress?: () => void;
}

export function TrophyRail(props: TrophyRailProps) {
  const earned = props.earned ?? [];
  const next = props.next ?? [];
  const total = earned.length + next.length;
  if (total === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Badges{" "}
          <Text style={styles.subCount}>
            {earned.length} of {total}
          </Text>
        </Text>
        <Pressable onPress={props.onSeeAllPress} accessibilityRole="link" accessibilityLabel="See all badges">
          <Text style={styles.seeAll}>see all</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {earned.map((b) => {
          const Icon = BADGE_ICONS[b.icon] ?? Zap;
          const accent = badgeAccentFor(b.color);
          return (
            <Pressable
              key={`earned-${b.id}`}
              style={styles.trophy}
              onPress={() => props.onPressBadge(b, true)}
              accessibilityRole="button"
              accessibilityLabel={`${b.name} badge, earned`}
            >
              <View style={[styles.badgeIconLit, { backgroundColor: accent.bg, borderColor: accent.stroke }]}>
                <Icon size={22} color={accent.stroke} />
              </View>
              <Text style={styles.badgeLbl} numberOfLines={2}>
                {b.name}
              </Text>
            </Pressable>
          );
        })}
        {next.map((b) => {
          const Icon = BADGE_ICONS[b.icon] ?? Zap;
          return (
            <Pressable
              key={`next-${b.id}`}
              style={styles.trophy}
              onPress={() => props.onPressBadge(b, false)}
              accessibilityRole="button"
              accessibilityLabel={`${b.name} badge, not yet earned`}
            >
              <View style={styles.badgeIconLocked}>
                <Icon size={22} color={DS_COLORS.TEXT_MUTED} />
              </View>
              <Text style={styles.badgeLbl} numberOfLines={2}>
                {b.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 18 },
  headerRow: { paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  title: { fontSize: 13, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY },
  subCount: { fontSize: 11, color: DS_COLORS.TEXT_MUTED, fontWeight: "400" },
  seeAll: { fontSize: 11, color: DS_COLORS.PROFILE_STAT_CORAL_ICON },
  rail: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  trophy: { width: 64, alignItems: "center", gap: 4 },
  badgeIconLit: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  badgeIconLocked: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.BG_PAGE,
    opacity: 0.7,
  },
  badgeLbl: { fontSize: 9, color: DS_COLORS.TEXT_MUTED, textAlign: "center", lineHeight: 11 },
});
