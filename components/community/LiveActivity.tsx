import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Image } from "expo-image";
import { Flame } from "lucide-react-native";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

export interface LiveActivityItem {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  eventType: string;
  challengeName?: string | null;
  dayNumber?: number | null;
  createdAt: string;
  metadata?: {
    has_photo?: boolean;
    photo_url?: string | null;
    verification_method?: string | null;
    is_hard_mode?: boolean;
    heart_rate_verified?: boolean;
    location_verified?: boolean;
    task_name?: string | null;
    task_type?: string | null;
  };
  reactionCount?: number;
  reactedByMe?: boolean;
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
  if (item.eventType === "task_completed") {
    const taskName = item.metadata?.task_name ?? "a task";
    return `${who} completed ${taskName} in ${challenge}`;
  }
  if (item.eventType === "secured_day") {
    if (item.dayNumber != null) return `${who} completed Day ${item.dayNumber} of ${challenge}`;
    return `${who} secured a day in ${challenge}`;
  }
  return `${who} made progress in ${challenge}`;
}

function VerificationBadges({ item }: { item: LiveActivityItem }) {
  const m = item.metadata;
  if (!m) return null;
  const badges: { label: string; color: string; bg: string }[] = [];
  if (m.is_hard_mode)
    badges.push({ label: "Hard mode", color: DS_COLORS.BADGE_HARD_RED, bg: DS_COLORS.BADGE_HARD_BG });
  if (m.heart_rate_verified)
    badges.push({ label: "HR verified", color: DS_COLORS.BADGE_HR_AMBER, bg: DS_COLORS.BADGE_HR_BG });
  if (m.location_verified)
    badges.push({ label: "Location", color: DS_COLORS.BADGE_LOC_GREEN, bg: DS_COLORS.BADGE_LOC_BG });
  if (m.has_photo)
    badges.push({ label: "Photo proof", color: DS_COLORS.BADGE_PHOTO_BLUE, bg: DS_COLORS.BADGE_PHOTO_BG });
  if (badges.length === 0) return null;
  return (
    <View style={badgeStyles.wrap}>
      {badges.map((b) => (
        <View key={b.label} style={[badgeStyles.pill, { backgroundColor: b.bg }]}>
          <Text style={[badgeStyles.pillText, { color: b.color }]}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  wrap: { flexDirection: "row", gap: 4, marginTop: 4, flexWrap: "wrap" },
  pill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  pillText: { fontSize: 9, fontWeight: "700" },
});

export function LiveActivity({ items, currentUserId }: { items: LiveActivityItem[]; currentUserId?: string | null }) {
  const [selectedReactions, setSelectedReactions] = useState<Record<string, boolean>>({});
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});

  const handleReact = useCallback(async (eventId: string, currentlyReacted: boolean, currentCount: number) => {
    const optimisticReacted = !currentlyReacted;
    const optimisticCount = Math.max(0, currentCount + (optimisticReacted ? 1 : -1));
    setSelectedReactions((prev) => ({ ...prev, [eventId]: optimisticReacted }));
    setReactionCounts((prev) => ({ ...prev, [eventId]: optimisticCount }));
    try {
      const result = await trpcMutate(TRPC.feed.react, { eventId }) as { reacted?: boolean; reactionCount?: number };
      setSelectedReactions((prev) => ({ ...prev, [eventId]: !!result.reacted }));
      setReactionCounts((prev) => ({ ...prev, [eventId]: Math.max(0, result.reactionCount ?? optimisticCount) }));
    } catch (err) {
      console.error("[LiveActivity] react failed:", err);
      setSelectedReactions((prev) => ({ ...prev, [eventId]: currentlyReacted }));
      setReactionCounts((prev) => ({ ...prev, [eventId]: currentCount }));
    }
  }, []);

  const prepared = useMemo(() => items.slice(0, 15), [items]);
  const onlySelf =
    !!currentUserId &&
    prepared.length > 0 &&
    prepared.every((it) => it.userId === currentUserId);

  const renderLiveItem = useCallback(
    ({ item, index }: { item: LiveActivityItem; index: number }) => {
      const seed = item.displayName || item.username || item.userId || "?";
      const isLast = index === prepared.length - 1;
      const reacted = selectedReactions[item.id] ?? !!item.reactedByMe;
      const count = reactionCounts[item.id] ?? Math.max(0, item.reactionCount ?? 0);
      return (
        <View>
          <View style={[styles.row, !isLast && styles.rowDivider]}>
            <View style={[styles.avatar, { backgroundColor: avatarColorByIndex(index) }]}>
              <Text style={styles.avatarInitial}>{seed.charAt(0).toUpperCase()}</Text>
            </View>

            <View style={styles.body}>
              <Text style={styles.line}>{buildLine(item)}</Text>
              <Text style={styles.time}>{formatTimeAgoCompact(item.createdAt)}</Text>
              <VerificationBadges item={item} />
              {item.eventType === "task_completed" && item.metadata?.has_photo && item.metadata?.photo_url ? (
                <Image
                  source={{ uri: item.metadata.photo_url }}
                  style={styles.feedPhoto}
                  contentFit="cover"
                />
              ) : null}
            </View>

            <View style={styles.reactionArea}>
              <TouchableOpacity
                style={[styles.fireBtn, reacted && styles.fireBtnActive]}
                onPress={() => void handleReact(item.id, reacted, count)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Toggle fire reaction for ${seed}'s activity`}
              >
                <Flame size={12} color={reacted ? DS_COLORS.DISCOVER_CORAL : DS_COLORS.TEXT_MUTED} />
                <Text style={[styles.fireCount, reacted && styles.fireCountActive]}>{count}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
    [prepared.length, selectedReactions, reactionCounts, handleReact]
  );

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
          <FlatList
            data={prepared}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
            renderItem={renderLiveItem}
          />
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
  feedPhoto: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: DS_COLORS.chipFill,
  },
  reactionArea: { alignItems: "flex-end", minWidth: 60, gap: 6 },
  fireBtn: {
    minWidth: 44,
    height: 28,
    borderRadius: 14,
    backgroundColor: DS_COLORS.chipFill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
  },
  fireBtnActive: { backgroundColor: DS_COLORS.ACCENT_TINT },
  fireCount: { fontSize: 11, fontWeight: "700", color: DS_COLORS.TEXT_MUTED },
  fireCountActive: { color: DS_COLORS.DISCOVER_CORAL },
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
