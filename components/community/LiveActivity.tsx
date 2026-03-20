import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Flame } from "lucide-react-native";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";

export interface LiveActivityItem {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  eventType: string;
  challengeName?: string | null;
  dayNumber?: number | null;
  createdAt: string;
}

const AVATAR_COLORS = ["#E8593C", "#5B7FD4", "#4CAF50", "#FF9800", "#9C27B0"];

function avatarColorByIndex(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length] ?? "#E8593C";
}

function buildLine(item: LiveActivityItem): string {
  const who = item.displayName || item.username || "Someone";
  const challenge = item.challengeName || "challenge";

  if (item.eventType === "joined_challenge") return `${who} joined ${challenge}`;
  if (item.eventType === "completed_challenge") return `${who} completed ${challenge}`;
  if (item.eventType === "secured_day") {
    if (item.dayNumber != null) return `${who} completed Day ${item.dayNumber} of ${challenge}`;
    return `${who} secured a day in ${challenge}`;
  }
  return `${who} made progress in ${challenge}`;
}

export function LiveActivity({ items }: { items: LiveActivityItem[] }) {
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const prepared = useMemo(() => items.slice(0, 15), [items]);

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.dot} />
          <Text style={styles.headerTitle}>Live activity</Text>
        </View>
        <Text style={styles.headerRight}>People are moving</Text>
      </View>

      <View style={styles.card}>
        {prepared.length === 0 ? (
          <Text style={styles.emptyText}>
            No activity yet. Join a challenge to see the community in action.
          </Text>
        ) : (
          prepared.map((item, index) => {
            const seed = item.displayName || item.username || item.userId || "?";
            const isLiked = !!liked[item.id];
            const isLast = index === prepared.length - 1;
            return (
              <View key={item.id} style={[styles.row, !isLast && styles.rowDivider]}>
                <View style={[styles.avatar, { backgroundColor: avatarColorByIndex(index) }]}>
                  <Text style={styles.avatarInitial}>{seed.charAt(0).toUpperCase()}</Text>
                </View>

                <View style={styles.body}>
                  <Text style={styles.line}>{buildLine(item)}</Text>
                  <Text style={styles.time}>{formatTimeAgoCompact(item.createdAt)}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.kudosBtn, isLiked && styles.kudosBtnLiked]}
                  onPress={() => setLiked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Give kudos to ${seed}`}
                >
                  <Flame size={12} color={isLiked ? "#E8593C" : "#D9D5CC"} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 18,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E8593C",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerRight: {
    fontSize: 11,
    color: "#999",
  },
  card: {
    marginHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  rowDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#F5F2EB",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  body: {
    flex: 1,
  },
  line: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  time: {
    fontSize: 10,
    color: "#BBB",
    marginTop: 2,
  },
  kudosBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F9F6F1",
    alignItems: "center",
    justifyContent: "center",
  },
  kudosBtnLiked: {
    backgroundColor: "#FFF3ED",
  },
  emptyText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    padding: 24,
  },
});
