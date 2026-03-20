import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Crosshair } from "lucide-react-native";

export interface CommunityLeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  rank: number;
  points: number;
}

function avatarColorForName(seed: string): string {
  const colors = ["#E8593C", "#5B7FD4", "#4CAF50", "#FF9800", "#9C27B0"];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length] ?? "#E8593C";
}

function rankColor(rank: number): string {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return "#999";
}

export function Leaderboard({
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
            <Crosshair size={22} color="#E8593C" />
          </View>
          <Text style={styles.emptyTitle}>The board is wide open.</Text>
          <Text style={styles.emptySubtitle}>Every goal you complete earns points.</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  resetPill: {
    fontSize: 10,
    color: "#999",
    backgroundColor: "#F5F2EB",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  rowDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#F5F2EB",
  },
  rank: {
    width: 24,
    textAlign: "center",
    fontSize: 13,
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
    borderColor: "#FFD700",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  username: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  points: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E8593C",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 18,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    backgroundColor: "#FFF3ED",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  emptyCta: {
    borderWidth: 1,
    borderColor: "#E8593C",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  emptyCtaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E8593C",
  },
  youRowWrap: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: "#FFF3ED",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  youRowWrapWithDivider: {
    borderTopWidth: 1,
    borderTopColor: "#F5F2EB",
    paddingTop: 10,
  },
  youRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  youRank: {
    color: "#1A1A1A",
    fontWeight: "700",
  },
  youUnrankedWrap: {
    paddingVertical: 8,
  },
  youUnranked: {
    color: "#999",
    fontSize: 13,
    fontWeight: "600",
  },
  youHint: {
    marginTop: 4,
    fontSize: 11,
    color: "#E8593C",
    fontWeight: "600",
  },
});
