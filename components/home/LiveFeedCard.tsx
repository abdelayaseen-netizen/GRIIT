/**
 * LIVE feed card component. Renders 4 types: secured_day, milestone, challenge_promo, rank_up.
 * Left border stripe 3px, cardRadius 16, cardShadow. Uses design system tokens.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import {
  Flame,
  Trophy,
  Zap,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_SHADOWS } from "@/lib/design-system";
import { InlineError } from "@/components/InlineError";

function respectChasePlaceholder(setComingSoon: (msg: string) => void) {
  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  setComingSoon("Respect & Chase will be available in a future update.");
}

const STRIPE_WIDTH = 3 as const;

export type LiveFeedCardType = "secured_day" | "milestone" | "challenge_promo" | "rank_up";

export interface LiveFeedCardData {
  type: LiveFeedCardType;
  username?: string;
  day?: number;
  challengeName?: string;
  streakDays?: number;
  minutesAgo?: number;
  respectCount?: number;
  rankBadge?: string;
  hitDays?: number;
  topPercent?: number;
  percentSecured?: number;
  openChallengeId?: string;
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
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: DS_COLORS.BG_CARD_TINTED }]} />
  );
}

const LiveFeedCardInner = function LiveFeedCardInner({ data }: LiveFeedCardProps) {
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  if (data.type === "secured_day") {
    return (
      <View style={[styles.card, { backgroundColor: DS_COLORS.BG_CARD, borderLeftWidth: STRIPE_WIDTH, borderLeftColor: DS_COLORS.ACCENT_PRIMARY }]}>
        <View style={styles.cardInner}>
          <InlineError
            message={comingSoon}
            variant="warning"
            onDismiss={() => setComingSoon(null)}
          />
          <View style={styles.row1}>
            <AvatarPlaceholder size={44} />
            <View style={styles.body}>
              <Text style={[styles.username, { color: DS_COLORS.TEXT_PRIMARY }]} numberOfLines={1}>
                {data.username ?? "user"}
              </Text>
              <Text style={[styles.securedLine, { color: DS_COLORS.TEXT_SECONDARY }]}>
                secured Day {data.day ?? 0} of {data.challengeName ?? "Challenge"}
              </Text>
              <View style={styles.metaRow}>
                <Flame size={14} color={DS_COLORS.STREAK_ICON} />
                <Text style={[styles.streakText, { color: DS_COLORS.TEXT_ORANGE }]}>
                  Streak: {data.streakDays ?? 0} days
                </Text>
                <Text style={[styles.timeText, { color: DS_COLORS.TEXT_TERTIARY }]}>
                  · {data.minutesAgo ?? 0}m ago
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.pillRow}>
            <TouchableOpacity
              style={[styles.pillBtn, { backgroundColor: DS_COLORS.BG_CARD_TINTED, borderColor: DS_COLORS.BORDER_CARD }]}
              onPress={data.onRespect ?? (() => respectChasePlaceholder(setComingSoon))}
              activeOpacity={0.8}
              accessibilityLabel="Send respect"
              accessibilityRole="button"
            >
              <Text style={[styles.pillBtnText, { color: DS_COLORS.TEXT_PRIMARY }]}>🔥 Respect {data.respectCount ?? 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pillBtn, { backgroundColor: DS_COLORS.BG_CARD_TINTED, borderColor: DS_COLORS.BORDER_CARD }]}
              onPress={data.onChase ?? (() => respectChasePlaceholder(setComingSoon))}
              activeOpacity={0.8}
              accessibilityLabel="Chase this user"
              accessibilityRole="button"
            >
              <Text style={[styles.pillBtnText, { color: DS_COLORS.TEXT_PRIMARY }]}>👥 Chase</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (data.type === "milestone") {
    return (
      <View style={[styles.card, { backgroundColor: DS_COLORS.BG_CARD, borderLeftWidth: STRIPE_WIDTH, borderLeftColor: DS_COLORS.DIFFICULTY_MEDIUM_TEXT }]}>
        <View style={styles.cardInner}>
          <View style={styles.row1}>
            <View style={[styles.iconCircle, { backgroundColor: DS_COLORS.WARNING_LIGHT }]}>
              <Trophy size={20} color={DS_COLORS.DIFFICULTY_MEDIUM_TEXT} />
            </View>
            <View style={styles.body}>
              <Text style={[styles.username, { color: DS_COLORS.TEXT_PRIMARY }]}>{data.username ?? "user"}</Text>
              <Text style={[styles.securedLine, { color: DS_COLORS.TEXT_PRIMARY }]}>
                Hit <Text style={[styles.bold, { color: DS_COLORS.ACCENT_PRIMARY }]}>{data.hitDays ?? 0} days</Text> straight
              </Text>
              <Text style={[styles.metaMuted, { color: DS_COLORS.TEXT_TERTIARY }]}>
                Top {data.topPercent ?? 0}% this week
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (data.type === "challenge_promo") {
    return (
      <View style={[styles.card, { backgroundColor: DS_COLORS.STREAK_TINTED_BG, borderLeftWidth: STRIPE_WIDTH, borderLeftColor: DS_COLORS.ACCENT_PRIMARY }]}>
        <View style={styles.cardInner}>
          <View style={styles.row1}>
            <View style={[styles.iconCircle, { backgroundColor: DS_COLORS.TASK_ICON_BG }]}>
              <Zap size={20} color={DS_COLORS.ACCENT_PRIMARY} />
            </View>
            <View style={styles.body}>
              <Text style={[styles.percentBig, { color: DS_COLORS.TEXT_PRIMARY }]}>
                <Text style={[styles.bold, { color: DS_COLORS.TEXT_PRIMARY }]}>{data.percentSecured ?? 0}%</Text> of participants secured today
              </Text>
              <Text style={[styles.securedLine, { color: DS_COLORS.TEXT_SECONDARY }]}>
                in {data.challengeName ?? "Challenge"}
              </Text>
              <Text style={[styles.areYouIn, { color: DS_COLORS.ACCENT_PRIMARY }]}>Are you in?</Text>
              <TouchableOpacity
                style={[styles.openChallengeBtn, { backgroundColor: DS_COLORS.ACCENT_PRIMARY }]}
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
      <View style={[styles.card, { backgroundColor: DS_COLORS.BG_CARD, borderLeftWidth: STRIPE_WIDTH, borderLeftColor: DS_COLORS.ACCENT_GREEN }]}>
        <View style={styles.cardInner}>
          <View style={styles.row1}>
            <AvatarPlaceholder size={44} />
            <View style={styles.body}>
              <Text style={[styles.securedLine, { color: DS_COLORS.TEXT_PRIMARY }]}>
                {data.username ?? "user"} moved to Rank <Text style={[styles.bold, { color: DS_COLORS.ACCENT_PRIMARY }]}>"{data.rankName ?? "Rank"}"</Text>
              </Text>
              <Text style={[styles.meta, { color: DS_COLORS.ACCENT_GREEN }]}>
                📈 +{data.disciplineDelta ?? 0} Discipline this week
              </Text>
              <TouchableOpacity
                style={[styles.viewProfileBtn, { borderColor: DS_COLORS.BORDER_DEFAULT }]}
                onPress={data.onViewProfile}
                activeOpacity={0.8}
                accessibilityLabel="View profile"
                accessibilityRole="button"
              >
                <Text style={[styles.viewProfileBtnText, { color: DS_COLORS.TEXT_SECONDARY }]}>View Profile &gt;</Text>
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
    borderRadius: DS_RADIUS.LG,
    marginBottom: DS_SPACING.MD,
    overflow: "hidden",
    backgroundColor: DS_COLORS.BG_CARD,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER_CARD,
    ...DS_SHADOWS.card,
  },
  cardInner: {
    flex: 1,
    padding: DS_SPACING.BASE,
  },
  row1: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_SPACING.MD,
  },
  avatar: {
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  securedLine: {
    fontSize: 15,
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  streakText: {
    fontSize: 13,
    fontWeight: "600",
  },
  timeText: {
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
    marginTop: 8,
  },
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: DS_RADIUS.PILL,
    borderWidth: 1,
  },
  pillBtnText: {
    fontSize: 13,
    fontWeight: "500",
  },
  openChallengeBtn: {
    paddingVertical: 12,
    borderRadius: DS_RADIUS.MD,
    alignItems: "center",
    marginTop: 4,
  },
  openChallengeBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.WHITE,
  },
  viewProfileBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 1,
    marginTop: 6,
  },
  viewProfileBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
