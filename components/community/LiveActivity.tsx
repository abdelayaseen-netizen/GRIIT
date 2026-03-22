import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Image } from "expo-image";
import { Flame } from "lucide-react-native";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system";
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
}

type FeedReactionKey = "fire" | "respect" | "discipline";

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
  if (m.is_hard_mode) badges.push({ label: "Hard mode", color: "#A32D2D", bg: "#FCEBEB" });
  if (m.heart_rate_verified) badges.push({ label: "HR verified", color: "#854F0B", bg: "#FAEEDA" });
  if (m.location_verified) badges.push({ label: "Location", color: "#0F6E56", bg: "#E1F5EE" });
  if (m.has_photo) badges.push({ label: "Photo proof", color: "#185FA5", bg: "#E6F1FB" });
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

const REACTION_OPTIONS = [
  { key: "fire" as const, emoji: "🔥", label: "Let's go" },
  { key: "respect" as const, emoji: "💪", label: "Respect" },
  { key: "discipline" as const, emoji: "🫡", label: "Discipline" },
];

export function LiveActivity({ items, currentUserId }: { items: LiveActivityItem[]; currentUserId?: string | null }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedReactions, setSelectedReactions] = useState<Record<string, FeedReactionKey>>({});
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const handleReact = useCallback(async (eventId: string, reaction: FeedReactionKey) => {
    setSelectedReactions((prev) => ({ ...prev, [eventId]: reaction }));
    setExpandedId(null);
    try {
      await trpcMutate(TRPC.feed.react, { eventId, reaction });
    } catch (err) {
      console.error("[LiveActivity] react failed:", err);
      setSelectedReactions((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
    }
  }, []);

  const handleComment = useCallback(
    async (eventId: string) => {
      if (!commentText.trim()) return;
      try {
        await trpcMutate(TRPC.feed.comment, { eventId, text: commentText.trim() });
        setCommentText("");
        setCommentingId(null);
      } catch (err) {
        console.error("[LiveActivity] comment failed:", err);
      }
    },
    [commentText]
  );

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
          <FlatList
            data={prepared}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            renderItem={({ item, index }) => {
              const seed = item.displayName || item.username || item.userId || "?";
              const isLast = index === prepared.length - 1;
              const isCommenting = commentingId === item.id;
              const picked = selectedReactions[item.id];
              return (
                <View>
                  <View style={[styles.row, !isLast && !isCommenting && styles.rowDivider]}>
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
                      {expandedId === item.id ? (
                        <View style={styles.reactionPicker}>
                          {REACTION_OPTIONS.map((r) => (
                            <TouchableOpacity
                              key={r.key}
                              style={[styles.reactionChip, picked === r.key && styles.reactionChipActive]}
                              onPress={() => void handleReact(item.id, r.key)}
                              accessibilityLabel={r.label}
                            >
                              <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity
                            style={styles.commentChip}
                            onPress={() => {
                              setCommentingId(item.id);
                              setExpandedId(null);
                            }}
                            accessibilityLabel="Write a comment"
                          >
                            <Text style={styles.commentChipText}>...</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.kudosBtn, !!picked && styles.kudosBtnLiked]}
                          onPress={() => setExpandedId(item.id)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={`React to ${seed}'s activity`}
                        >
                          {picked ? (
                            <Text style={{ fontSize: 12 }}>
                              {picked === "fire" ? "🔥" : picked === "respect" ? "💪" : "🫡"}
                            </Text>
                          ) : (
                            <Flame size={12} color={DS_COLORS.BORDER} />
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {isCommenting ? (
                    <View style={[styles.commentRow, !isLast && styles.rowDivider]}>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Nice work..."
                        placeholderTextColor={DS_COLORS.TEXT_MUTED}
                        value={commentText}
                        onChangeText={setCommentText}
                        maxLength={200}
                        autoFocus
                        onSubmitEditing={() => void handleComment(item.id)}
                        returnKeyType="send"
                      />
                      <TouchableOpacity style={styles.sendBtn} onPress={() => void handleComment(item.id)}>
                        <Text style={styles.sendBtnText}>Send</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              );
            }}
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
  reactionArea: { alignItems: "flex-end", minWidth: 36 },
  reactionPicker: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: 16,
    padding: 4,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    maxWidth: 200,
  },
  reactionChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  reactionChipActive: { backgroundColor: DS_COLORS.ACCENT_TINT },
  reactionEmoji: { fontSize: 14 },
  commentChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.WHITE,
  },
  commentChipText: { fontSize: 12, fontWeight: "700", color: DS_COLORS.TEXT_MUTED },
  commentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
  },
  commentInput: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.chipFill,
    paddingHorizontal: 14,
    fontSize: 13,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  sendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: GRIIT_COLORS.primary,
  },
  sendBtnText: { fontSize: 12, fontWeight: "700", color: DS_COLORS.TEXT_ON_DARK },
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
