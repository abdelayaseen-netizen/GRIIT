import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Target } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";

export interface CommunityLeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  rank: number;
  points: number;
}

const AVATAR_PALETTE = [
  DS_COLORS.DISCOVER_CORAL,
  DS_COLORS.DISCOVER_BLUE,
  DS_COLORS.DISCOVER_GREEN,
  DS_COLORS.WARNING,
  DS_COLORS.CATEGORY_MIND,
] as const;

function avatarColorForName(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length] ?? DS_COLORS.DISCOVER_CORAL;
}

function rankColor(rank: number): string {
  if (rank === 1) return DS_COLORS.milestoneGold;
  if (rank === 2) return DS_COLORS.milestoneSilver;
  if (rank === 3) return DS_COLORS.milestoneBronze;
  return DS_COLORS.TEXT_MUTED;
}

export const Leaderboard = React.memo(function Leaderboard({
  entries,
  currentUserName,
  currentUserRank,
  currentUserPoints,
  onStartEarning,
}: {
  entries: CommunityLeaderboardEntry[];
  currentUserName: string;
  currentUserRank: number | null;
  currentUserPoints: number;
  onStartEarning: () => void;
}) {
  const topTen = entries.slice(0, 10);
  const hasData = topTen.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Weekly leaderboard</Text>
        <Text style={styles.resetPill}>Resets Sunday</Text>
      </View>

      {!hasData ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Target size={22} color={DS_COLORS.DISCOVER_CORAL} />
          </View>
          <Text style={styles.emptyTitle}>Unclaimed territory.</Text>
          <Text style={styles.emptySubtitle}>Complete your first goal to plant your flag.</Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={onStartEarning}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Start earning points"
          >
            <Text style={styles.emptyCtaText}>Start earning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {topTen.map((entry, index) => {
            const seed = entry.displayName || entry.username || entry.userId;
            const isLast = index === topTen.length - 1;
            const isTop = entry.rank <= 3;
            return (
              <View key={entry.userId} style={[styles.row, !isLast && styles.rowDivider]}>
                <Text style={[styles.rank, { color: rankColor(entry.rank), fontWeight: isTop ? "700" : "600" }]}>
                  {entry.rank}.
                </Text>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: avatarColorForName(seed) },
                    entry.rank === 1 && styles.firstRing,
                  ]}
                >
                  <Text style={styles.avatarInitial}>{seed.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.username} numberOfLines={1}>
                  {entry.displayName || entry.username}
                </Text>
                <Text style={styles.points}>{entry.points} pts</Text>
              </View>
            );
          })}
        </View>
      )}

      {!(currentUserRank == null && currentUserPoints === 0) ? (
        <View style={[styles.youRowWrap, hasData ? styles.youRowWrapWithDivider : null]}>
          {currentUserRank != null ? (
            <View style={styles.youRow}>
              <Text style={[styles.rank, styles.youRank]}>{currentUserRank}.</Text>
              <View style={[styles.avatar, { backgroundColor: avatarColorForName(currentUserName) }]}>
                <Text style={styles.avatarInitial}>{currentUserName.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.username} numberOfLines={1}>
                {currentUserName}
              </Text>
              <Text style={styles.points}>{currentUserPoints} pts</Text>
            </View>
          ) : (
            <View style={styles.youUnrankedWrap}>
              <Text style={styles.youUnranked}>You: unranked</Text>
              <Text style={styles.youHint}>Complete 1 goal to enter the board</Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: DS_SPACING.xl,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.lg,
    marginTop: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DS_SPACING.sm,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  resetPill: {
    fontSize: 10,
    color: DS_COLORS.TEXT_MUTED,
    backgroundColor: DS_COLORS.chipFill,
    paddingVertical: 3,
    paddingHorizontal: DS_SPACING.sm,
    borderRadius: DS_RADIUS.SM,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  rowDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: DS_COLORS.chipFill,
  },
  rank: {
    width: 24,
    textAlign: "center",
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  firstRing: {
    borderWidth: 2,
    borderColor: DS_COLORS.milestoneGold,
  },
  avatarInitial: {
    color: DS_COLORS.TEXT_ON_DARK,
    fontSize: 12,
    fontWeight: "700",
  },
  username: {
    flex: 1,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  points: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: "700",
    color: DS_COLORS.DISCOVER_CORAL,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 18,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: DS_COLORS.TEXT_MUTED,
    marginTop: DS_SPACING.xs,
  },
  emptyCta: {
    borderWidth: 1,
    borderColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 20,
    paddingVertical: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.xl,
    marginTop: DS_SPACING.md,
  },
  emptyCtaText: {
    fontSize: 12,
    fontWeight: "600",
    color: DS_COLORS.DISCOVER_CORAL,
  },
  youRowWrap: {
    marginTop: DS_SPACING.sm,
    borderRadius: 10,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    paddingHorizontal: 10,
    paddingVertical: DS_SPACING.xs,
  },
  youRowWrapWithDivider: {
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.chipFill,
    paddingTop: 10,
  },
  youRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: DS_SPACING.sm,
  },
  youRank: {
    color: DS_COLORS.TEXT_PRIMARY,
    fontWeight: "700",
  },
  youUnrankedWrap: {
    paddingVertical: DS_SPACING.sm,
  },
  youUnranked: {
    color: DS_COLORS.TEXT_MUTED,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: "600",
  },
  youHint: {
    marginTop: DS_SPACING.xs,
    fontSize: 11,
    color: DS_COLORS.DISCOVER_CORAL,
    fontWeight: "600",
  },
});
