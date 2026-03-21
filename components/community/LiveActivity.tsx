import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Flame } from "lucide-react-native";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";

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

const AVATAR_COLORS = [
  DS_COLORS.DISCOVER_CORAL,
  DS_COLORS.DISCOVER_BLUE,
  DS_COLORS.DISCOVER_GREEN,
  DS_COLORS.WARNING,
  DS_COLORS.CATEGORY_MIND,
] as const;

function avatarColorByIndex(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length] ?? DS_COLORS.DISCOVER_CORAL;
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

export function LiveActivity({ items, currentUserId }: { items: LiveActivityItem[]; currentUserId?: string | null }) {
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const prepared = useMemo(() => items.slice(0, 15), [items]);
  const onlySelf =
    !!currentUserId &&
    prepared.length > 0 &&
    prepared.every((it) => it.userId === currentUserId);

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
                  <Flame size={12} color={isLiked ? DS_COLORS.DISCOVER_CORAL : DS_COLORS.BORDER} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
        {onlySelf ? (
          <Text style={styles.onlySelfHint}>Invite a friend to see this board light up.</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: DS_SPACING.xl,
    marginTop: 18,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  headerRight: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_MUTED,
  },
  card: {
    marginHorizontal: DS_SPACING.xl,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.card,
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
    borderBottomColor: DS_COLORS.chipFill,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: DS_COLORS.TEXT_ON_DARK,
    fontSize: 12,
    fontWeight: "700",
  },
  body: {
    flex: 1,
  },
  line: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_PRIMARY,
    fontWeight: "600",
  },
  time: {
    fontSize: 10,
    color: DS_COLORS.grayMuted,
    marginTop: 2,
  },
  kudosBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DS_COLORS.chipFill,
    alignItems: "center",
    justifyContent: "center",
  },
  kudosBtnLiked: {
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  emptyText: {
    fontSize: 12,
    color: DS_COLORS.TEXT_MUTED,
    textAlign: "center",
    padding: DS_SPACING.xl,
  },
  onlySelfHint: {
    fontSize: 13,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: DS_SPACING.lg,
    paddingBottom: DS_SPACING.md,
  },
});
