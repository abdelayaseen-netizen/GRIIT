/**
 * LIVE feed card component. Renders 4 types: secured_day, milestone, challenge_promo, rank_up.
 * Left border stripe 3px, cardRadius 16, cardShadow. Uses theme and design tokens.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Flame,
  Trophy,
  Zap,
  Users,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS, DS_SPACING, DS_RADIUS } from "@/lib/design-system";

const STRIPE_WIDTH = 3 as const;

export type LiveFeedCardType = "secured_day" | "milestone" | "challenge_promo" | "rank_up";

export interface LiveFeedCardData {
  type: LiveFeedCardType;
  /** secured_day */
  username?: string;
  day?: number;
  challengeName?: string;
  streakDays?: number;
  minutesAgo?: number;
  respectCount?: number;
  /** milestone */
  rankBadge?: string;
  hitDays?: number;
  topPercent?: number;
  /** challenge_promo */
  percentSecured?: number;
  openChallengeId?: string;
  /** rank_up */
  rankName?: string;
  disciplineDelta?: number;
  onRespect?: () => void;
  onChase?: () => void;
  onOpenChallenge?: (id: string) => void;
  onViewProfile?: () => void;
}

interface LiveFeedCardProps {
  data: LiveFeedCardData;
}

function AvatarPlaceholder({ size = 40 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.pill }]} />
  );
}

const LiveFeedCardInner = function LiveFeedCardInner({ data }: LiveFeedCardProps) {
  const { colors } = useTheme();

  if (data.type === "secured_day") {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderLeftWidth: STRIPE_WIDTH, borderLeftColor: colors.accent }]}>
        <View style={styles.cardInner}>
          <View style={styles.row1}>
            <AvatarPlaceholder size={40} />
            <View style={styles.body}>
              <Text style={[styles.username, { color: colors.text.primary }]} numberOfLines={1}>
                {data.username ?? "user"}
              </Text>
              <Text style={[styles.securedLine, { color: colors.text.secondary }]}>
                secured Day {data.day ?? 0} of {data.challengeName ?? "Challenge"}
              </Text>
              <Text style={[styles.meta, { color: colors.success }]}>
                🔥 Streak: {data.streakDays ?? 0} days
              </Text>
              <Text style={[styles.metaMuted, { color: colors.text.muted }]}>
                · {data.minutesAgo ?? 0}m ago
              </Text>
            </View>
          </View>
          <View style={styles.pillRow}>
            <TouchableOpacity
              style={[styles.pillBtn, { borderColor: colors.border }]}
              onPress={data.onRespect}
              activeOpacity={0.8}
              accessibilityLabel="Send respect"
              accessibilityRole="button"
            >
              <Flame size={14} color={colors.accent} />
              <Text style={[styles.pillBtnText, { color: colors.accent }]}>Respect {data.respectCount ?? 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pillBtn, { borderColor: colors.border }]}
              onPress={data.onChase}
              activeOpacity={0.8}
              accessibilityLabel="Chase this user"
              accessibilityRole="button"
            >
              <Users size={14} color={colors.text.secondary} />
              <Text style={[styles.pillBtnText, { color: colors.text.secondary }]}>Chase</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (data.type === "milestone") {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderLeftWidth: STRIPE_WIDTH, borderLeftColor: colors.streak.gold }]}>
        <View style={styles.cardInner}>
          <View style={styles.row1}>
            <View style={[styles.iconCircle, { backgroundColor: colors.warningLight }]}>
              <Trophy size={20} color={colors.streak.gold} />
            </View>
            <View style={styles.body}>
              <Text style={[styles.username, { color: colors.text.primary }]}>{data.username ?? "user"}</Text>
              <Text style={[styles.securedLine, { color: colors.text.primary }]}>
                Hit <Text style={[styles.bold, { color: colors.accent }]}>{data.hitDays ?? 0} days</Text> straight
              </Text>
              <Text style={[styles.metaMuted, { color: colors.text.muted }]}>
                Top {data.topPercent ?? 0}% this week
              </Text>
              <TouchableOpacity style={[styles.pillBtn, { borderColor: colors.border, alignSelf: "flex-start", marginTop: 8 }]} onPress={data.onRespect} activeOpacity={0.8} accessibilityLabel="Send respect" accessibilityRole="button">
                <Flame size={14} color={colors.accent} />
                <Text style={[styles.pillBtnText, { color: colors.accent }]}>Respect {data.respectCount ?? 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (data.type === "challenge_promo") {
    return (
      <View style={[styles.card, { backgroundColor: colors.accentLight, borderLeftWidth: STRIPE_WIDTH, borderLeftColor: colors.accent }]}>
        <View style={styles.cardInner}>
          <View style={styles.row1}>
            <View style={[styles.iconCircle, { backgroundColor: colors.accent + "20" }]}>
              <Zap size={20} color={colors.accent} />
            </View>
            <View style={styles.body}>
              <Text style={[styles.percentBig, { color: colors.text.primary }]}>
                <Text style={[styles.bold, { color: colors.text.primary }]}>{data.percentSecured ?? 0}%</Text> of participants secured today
              </Text>
              <Text style={[styles.securedLine, { color: colors.text.secondary }]}>
                in {data.challengeName ?? "Challenge"}
              </Text>
              <Text style={[styles.areYouIn, { color: colors.accent }]}>Are you in?</Text>
              <TouchableOpacity
                style={[styles.openChallengeBtn, { backgroundColor: colors.accent }]}
                onPress={() => data.openChallengeId && data.onOpenChallenge?.(data.openChallengeId)}
                activeOpacity={0.85}
                accessibilityLabel="Open challenge"
                accessibilityRole="button"
              >
                <Text style={styles.openChallengeBtnText}>Open Challenge &gt;</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (data.type === "rank_up") {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderLeftWidth: STRIPE_WIDTH, borderLeftColor: colors.success }]}>
        <View style={styles.cardInner}>
          <View style={styles.row1}>
            <AvatarPlaceholder size={40} />
            <View style={styles.body}>
              <Text style={[styles.securedLine, { color: colors.text.primary }]}>
                {data.username ?? "user"} moved to Rank <Text style={[styles.bold, { color: colors.accent }]}>&quot;{data.rankName ?? "Rank"}&quot;</Text>
              </Text>
              <Text style={[styles.meta, { color: colors.success }]}>
                📈 +{data.disciplineDelta ?? 0} Discipline this week
              </Text>
              <TouchableOpacity
                style={[styles.viewProfileBtn, { borderColor: colors.border }]}
                onPress={data.onViewProfile}
                activeOpacity={0.8}
                accessibilityLabel="View profile"
                accessibilityRole="button"
              >
                <Text style={[styles.viewProfileBtnText, { color: colors.text.secondary }]}>View Profile &gt;</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return null;
};

export default React.memo(LiveFeedCardInner);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: DS_RADIUS.cardAlt,
    marginBottom: DS_SPACING.cardGap,
    overflow: "hidden",
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  cardInner: {
    flex: 1,
    padding: DS_SPACING.lg,
  },
  row1: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_SPACING.md,
  },
  avatar: {
    backgroundColor: DS_COLORS.chipFill,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  securedLine: {
    fontSize: 14,
    marginBottom: 2,
  },
  percentBig: {
    fontSize: 16,
    marginBottom: 2,
  },
  bold: {
    fontWeight: "700",
  },
  meta: {
    fontSize: 14,
    marginBottom: 2,
  },
  metaMuted: {
    fontSize: 13,
  },
  areYouIn: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  openChallengeBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  openChallengeBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.white,
  },
  viewProfileBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  viewProfileBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
