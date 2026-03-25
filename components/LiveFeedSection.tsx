import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, Share } from "react-native";
import { Image } from "expo-image";
import { MessageCircle, Share as ShareIcon } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useAuth } from "@/contexts/AuthContext";
import { DS_COLORS, DS_SHADOWS, DS_SPACING } from "@/lib/design-system";
import { getAvatarColor } from "@/lib/utils";
import { relativeTime } from "@/lib/utils/relativeTime";
import CommentSheet, { type FeedComment } from "@/components/CommentSheet";
import { captureError } from "@/lib/sentry";

export type LiveFeedPost = {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  streakCount: number;
  challengeId: string | null;
  challengeName: string;
  currentDay: number;
  totalDays: number;
  eventType: string;
  isCompleted: boolean;
  hasProof: boolean;
  photoUrl: string | null;
  verified: boolean;
  caption: string | null;
  createdAt: string;
  respectCount: number;
  reactedByMe: boolean;
  commentCount: number;
  visibility: "public" | "friends" | "private";
};

type LiveFeedResponse = { movingCount: number; posts: LiveFeedPost[] };

function SkeletonCard() {
  return (
    <View style={[styles.card, styles.skeleton]}>
      <View style={styles.skelRow}>
        <View style={styles.skelAvatar} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={styles.skelLineLg} />
          <View style={styles.skelLineSm} />
        </View>
      </View>
      <View style={styles.skelProof} />
    </View>
  );
}

function StandardPostCard({
  post,
  onRespect,
  onComment,
  onShare,
}: {
  post: LiveFeedPost;
  onRespect: () => void;
  onComment: () => void;
  onShare: () => void;
}) {
  const avatarBg = getAvatarColor(post.username ?? post.displayName ?? "");
  const initial = (post.displayName || post.username || "?").trim().charAt(0).toUpperCase();
  const pct = Math.min(100, Math.max(0, (post.currentDay / Math.max(1, post.totalDays)) * 100));

  return (
    <View style={[styles.card, DS_SHADOWS.cardSubtle]} accessibilityRole="summary">
      <View style={styles.cardHeader}>
        <View style={[styles.avatar38, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarLetter14}>{initial}</Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username13}>{post.displayName || post.username}</Text>
            <View style={styles.streakPill}>
              <Text style={styles.streakPillText}>🔥 {post.streakCount}</Text>
            </View>
          </View>
          <Text style={styles.challenge11} numberOfLines={1}>
            {post.challengeName}
          </Text>
        </View>
        <Text style={styles.time11}>{relativeTime(post.createdAt)}</Text>
      </View>

      <View style={styles.progressBlock}>
        <Text style={styles.dayLabel}>
          Day {post.currentDay} of {post.totalDays}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>

      {post.hasProof ? (
        <View style={styles.proofOuter}>
          <View style={styles.proofDark}>
            <View style={styles.proofTopRow}>
              {post.verified ? (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              ) : (
                <View />
              )}
            </View>
            <View style={styles.proofCenter}>
              {post.photoUrl ? (
                <Image source={{ uri: post.photoUrl }} style={styles.proofImage} contentFit="cover" />
              ) : (
                <>
                  <Text style={styles.proofEmoji}>📸</Text>
                  <Text style={styles.proofLabel}>PROOF PHOTO</Text>
                </>
              )}
            </View>
          </View>
        </View>
      ) : null}

      {post.caption ? (
        <Text style={styles.caption} numberOfLines={2}>
          {post.caption}
        </Text>
      ) : null}

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={onRespect}
          style={[styles.respectBtn, post.reactedByMe ? styles.respectBtnActive : styles.respectBtnInactive]}
          accessibilityRole="button"
          accessibilityLabel={
            post.reactedByMe
              ? "Remove respect"
              : post.respectCount > 0
                ? `Give respect — ${post.respectCount} respect given`
                : "Give respect"
          }
          accessibilityState={{ selected: post.reactedByMe }}
        >
          <Text style={[styles.respectBtnText, post.reactedByMe && styles.respectBtnTextActive]}>
            🔥 Respect{post.respectCount > 0 ? ` · ${post.respectCount}` : ""}
          </Text>
        </TouchableOpacity>
        <View style={styles.actionRight}>
          <TouchableOpacity
            style={styles.chip}
            onPress={onComment}
            accessibilityRole="button"
            accessibilityLabel={`Comment — ${post.commentCount} comments`}
          >
            <MessageCircle size={13} color={DS_COLORS.TEXT_SECONDARY} />
            <Text style={styles.chipText}> {post.commentCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chip}
            onPress={onShare}
            accessibilityRole="button"
            accessibilityLabel={`Share ${post.displayName || post.username}'s ${post.challengeName} post`}
          >
            <ShareIcon size={13} color={DS_COLORS.TEXT_SECONDARY} />
            <Text style={styles.chipText}> Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function MilestoneCard({
  post,
  onRespect,
  onComment,
}: {
  post: LiveFeedPost;
  onRespect: () => void;
  onComment: () => void;
}) {
  const avatarBg = getAvatarColor(post.username ?? post.displayName ?? "");
  const initial = (post.displayName || post.username || "?").trim().charAt(0).toUpperCase();
  return (
    <View style={[styles.milestoneCard, DS_SHADOWS.cardSubtle]}>
      <View style={styles.milestoneEyebrow}>
        <View style={styles.milestoneDot} />
        <Text style={styles.milestoneEyebrowText}>CHALLENGE COMPLETED</Text>
      </View>
      <Text style={styles.milestoneTitle}>{post.challengeName}</Text>
      <Text style={styles.milestoneSub}>
        Finished — Day {post.totalDays} of {post.totalDays}
      </Text>
      <View style={styles.milestoneUserRow}>
        <View style={[styles.avatar26, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarLetter12}>{initial}</Text>
        </View>
        <Text style={styles.milestoneUsername}>{post.displayName || post.username}</Text>
        <Text style={styles.milestoneTime}>{relativeTime(post.createdAt)}</Text>
      </View>
      <View style={styles.milestoneActions}>
        <TouchableOpacity
          style={styles.milestonePrimary}
          onPress={onRespect}
          accessibilityRole="button"
          accessibilityLabel={
            post.respectCount > 0
              ? `Give respect — ${post.respectCount} respect given`
              : "Give respect"
          }
        >
          <Text style={styles.milestonePrimaryText}>🔥 Respect{post.respectCount > 0 ? ` · ${post.respectCount}` : ""}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.milestoneSecondary}
          onPress={onComment}
          accessibilityRole="button"
          accessibilityLabel={`Comment on ${post.displayName || post.username}'s progress`}
        >
          <Text style={styles.milestoneSecondaryText}>💬 Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function LiveFeedSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [scope, setScope] = useState<"following" | "everyone">("everyone");
  const [commentPost, setCommentPost] = useState<LiveFeedPost | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [dotOpacity]);

  const feedQuery = useQuery({
    queryKey: ["liveFeed", scope, user?.id ?? ""],
    queryFn: () => trpcQuery(TRPC.feed.getLiveFeed, { scope, limit: 20 }) as Promise<LiveFeedResponse>,
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  const posts = (feedQuery.data?.posts ?? []).filter((post) => {
    if (post.visibility === "private" && post.userId !== user?.id) return false;
    return true;
  });
  // Feed deduplication:
  // 1) one post per user per challenge per calendar day
  // 2) no two consecutive posts from the same user
  // 3) limit to 20 after diversity filtering
  const seen = new Set<string>();
  const dedupedFeed = posts.filter((post) => {
    const dayKey = new Date(post.createdAt).toDateString();
    const challengeKey = post.challengeId ?? post.challengeName ?? "unknown";
    const key = `${post.userId}-${challengeKey}-${dayKey}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const diverseFeed = dedupedFeed.filter((post, i, arr) => {
    if (i === 0) return true;
    return post.userId !== arr[i - 1]?.userId;
  });
  const finalFeed = diverseFeed.slice(0, 20);
  const moving = feedQuery.data?.movingCount ?? 0;

  const commentsQuery = useQuery({
    queryKey: ["liveFeed", "comments", commentPost?.id],
    queryFn: async () => {
      if (!commentPost?.id) return [] as FeedComment[];
      const rows = (await trpcQuery(TRPC.feed.getComments, { eventId: commentPost.id, limit: 100 })) as Array<{
        id: string;
        user_id: string;
        text: string;
        created_at: string;
        display_name: string;
      }>;
      return rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        text: r.text,
        created_at: r.created_at,
        display_name: r.display_name,
      }));
    },
    enabled: !!commentPost?.id,
  });

  const updatePost = useCallback(
    (postId: string, updater: (p: LiveFeedPost) => LiveFeedPost) => {
      queryClient.setQueryData(
        ["liveFeed", scope, user?.id ?? ""],
        (old: LiveFeedResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.map((p) => (p.id === postId ? updater(p) : p)),
          };
        }
      );
    },
    [queryClient, scope, user?.id]
  );

  const onRespect = useCallback(
    async (post: LiveFeedPost) => {
      const prevR = post.reactedByMe;
      const prevC = post.respectCount;
      const nextC = Math.max(0, prevC + (prevR ? -1 : 1));
      updatePost(post.id, (p) => ({ ...p, reactedByMe: !prevR, respectCount: nextC }));
      try {
        const result = (await trpcMutate(TRPC.feed.react, { eventId: post.id })) as {
          reacted?: boolean;
          reactionCount?: number;
        };
        updatePost(post.id, (p) => ({
          ...p,
          reactedByMe: !!result.reacted,
          respectCount: Math.max(0, result.reactionCount ?? nextC),
        }));
      } catch (e) {
        captureError(e, "LiveFeedRespect");
        console.error("[LiveFeedSection] respect failed", e);
        updatePost(post.id, (p) => ({ ...p, reactedByMe: prevR, respectCount: prevC }));
      }
    },
    [updatePost]
  );

  const onShare = useCallback(async (post: LiveFeedPost) => {
    try {
      await Share.share({
        message: `${post.displayName} on GRIIT — ${post.challengeName}`,
        ...(post.photoUrl ? { url: post.photoUrl } : {}),
      });
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (msg !== "User did not share") {
        captureError(err, "LiveFeedShare");
        console.error("[LiveFeedSection] share failed", err);
      }
    }
  }, []);

  const submitComment = useCallback(
    async (text: string) => {
      if (!commentPost?.id) return;
      setCommentSubmitting(true);
      try {
        await trpcMutate(TRPC.feed.comment, { eventId: commentPost.id, text });
        await commentsQuery.refetch();
        updatePost(commentPost.id, (p) => ({ ...p, commentCount: p.commentCount + 1 }));
      } finally {
        setCommentSubmitting(false);
      }
    },
    [commentPost?.id, commentsQuery, updatePost]
  );

  const renderItem = useCallback(
    ({ item }: { item: LiveFeedPost }) => {
      if (item.isCompleted) {
        return (
          <MilestoneCard
            post={item}
            onRespect={() => void onRespect(item)}
            onComment={() => setCommentPost(item)}
          />
        );
      }
      return (
        <StandardPostCard
          post={item}
          onRespect={() => void onRespect(item)}
          onComment={() => setCommentPost(item)}
          onShare={() => void onShare(item)}
        />
      );
    },
    [onRespect, onShare]
  );

  const listEmpty = useMemo(() => {
    if (feedQuery.isPending) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No activity yet</Text>
        <Text style={styles.emptySub}>Be the first to check in today</Text>
      </View>
    );
  }, [feedQuery.isPending]);

  if (!user?.id) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
          <Text style={styles.liveLabel}>Live</Text>
          <Text style={styles.liveCount}>· {moving} moving</Text>
        </View>
        <View style={styles.toggleOuter}>
          <TouchableOpacity
            onPress={() => setScope("following")}
            style={[styles.togglePill, scope === "following" && styles.togglePillOn]}
            accessibilityRole="button"
            accessibilityLabel="Show feed from people you follow"
            accessibilityState={{ selected: scope === "following" }}
          >
            <Text style={[styles.toggleText, scope === "following" && styles.toggleTextOn]}>Following</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setScope("everyone")}
            style={[styles.togglePill, scope === "everyone" && styles.togglePillOn]}
            accessibilityRole="button"
            accessibilityLabel="Show feed from everyone"
            accessibilityState={{ selected: scope === "everyone" }}
          >
            <Text style={[styles.toggleText, scope === "everyone" && styles.toggleTextOn]}>Everyone</Text>
          </TouchableOpacity>
        </View>
      </View>

      {feedQuery.isPending ? (
        <View style={{ gap: 10 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : feedQuery.isError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn&apos;t load feed</Text>
          <TouchableOpacity
            onPress={() => void feedQuery.refetch()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading feed"
          >
            <Text style={styles.retry}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={finalFeed}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={listEmpty}
        />
      )}

      <CommentSheet
        visible={!!commentPost}
        postTitle={commentPost?.challengeName ?? ""}
        comments={commentsQuery.data ?? []}
        loading={commentsQuery.isPending}
        submitting={commentSubmitting}
        onClose={() => setCommentPost(null)}
        onSubmit={submitComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: DS_SPACING.md,
    marginHorizontal: DS_SPACING.screenHorizontal,
    marginBottom: DS_SPACING.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: DS_COLORS.DISCOVER_GREEN,
  },
  liveLabel: { fontSize: 14, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  liveCount: { fontSize: 12, color: DS_COLORS.TEXT_SECONDARY },
  toggleOuter: {
    flexDirection: "row",
    backgroundColor: DS_COLORS.ONBOARDING_BORDER,
    borderRadius: 99,
    padding: 3,
    marginLeft: "auto",
  },
  togglePill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 99,
    backgroundColor: "transparent",
  },
  togglePillOn: { backgroundColor: DS_COLORS.TEXT_PRIMARY },
  toggleText: { fontSize: 10, fontWeight: "700", color: DS_COLORS.TEXT_MUTED },
  toggleTextOn: { color: DS_COLORS.WHITE },

  card: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  avatar38: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter14: { fontSize: 14, fontWeight: "700", color: DS_COLORS.white },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  username13: { fontSize: 13, fontWeight: "400", color: DS_COLORS.TEXT_SECONDARY },
  streakPill: {
    backgroundColor: DS_COLORS.ACCENT_TINT,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
  },
  streakPillText: { fontSize: 10, fontWeight: "700", color: DS_COLORS.DISCOVER_CORAL },
  challenge11: { fontSize: 15, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY, marginTop: 0 },
  time11: { fontSize: 11, fontWeight: "400", color: DS_COLORS.TEXT_TERTIARY, flexShrink: 0, textAlign: "right" },

  progressBlock: { paddingHorizontal: 14, paddingTop: 10 },
  dayLabel: { fontSize: 12, fontWeight: "400", color: DS_COLORS.DISCOVER_CORAL, marginBottom: 5 },
  track: {
    height: 6,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: DS_COLORS.DISCOVER_CORAL },

  proofOuter: { marginHorizontal: 14, marginTop: 10 },
  proofDark: {
    backgroundColor: DS_COLORS.BG_DARK,
    borderRadius: 12,
    height: 150,
    overflow: "hidden",
    flexDirection: "column",
  },
  proofTopRow: { paddingHorizontal: 8, paddingTop: 8, flexDirection: "row", justifyContent: "flex-end" },
  verifiedBadge: {
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  verifiedText: { fontSize: 10, fontWeight: "700", color: DS_COLORS.WHITE },
  proofCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 5 },
  proofEmoji: { fontSize: 22, opacity: 0.18 },
  proofLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(255,255,255,0.22)",
    letterSpacing: 1.5,
  },
  proofImage: { width: "100%", height: "100%" },

  caption: {
    paddingHorizontal: 14,
    paddingTop: 10,
    fontSize: 13,
    color: DS_COLORS.grayDarker,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  respectBtn: { borderRadius: 99, paddingVertical: 8, paddingHorizontal: 14 },
  respectBtnInactive: { backgroundColor: DS_COLORS.DISCOVER_CORAL },
  respectBtnActive: { backgroundColor: DS_COLORS.ACCENT_TINT },
  respectBtnText: { fontSize: 12, fontWeight: "700", color: DS_COLORS.WHITE },
  respectBtnTextActive: { color: DS_COLORS.DISCOVER_CORAL },
  actionRight: { marginLeft: "auto", flexDirection: "row", gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.DISCOVER_DIVIDER,
    borderRadius: 99,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: DS_COLORS.TEXT_SECONDARY },

  milestoneCard: {
    backgroundColor: DS_COLORS.TEXT_PRIMARY,
    borderRadius: 16,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
  },
  milestoneEyebrow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 },
  milestoneDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: DS_COLORS.DISCOVER_CORAL },
  milestoneEyebrowText: {
    fontSize: 9,
    fontWeight: "700",
    color: DS_COLORS.DISCOVER_CORAL,
    letterSpacing: 1.2,
  },
  milestoneTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DS_COLORS.WHITE,
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  milestoneSub: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 },
  milestoneUserRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  avatar26: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter12: { fontSize: 12, fontWeight: "600", color: DS_COLORS.white },
  milestoneUsername: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.6)", flex: 1 },
  milestoneTime: { fontSize: 11, color: "rgba(255,255,255,0.3)" },
  milestoneActions: { flexDirection: "row", gap: 8 },
  milestonePrimary: {
    flex: 1,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 99,
    paddingVertical: 9,
    alignItems: "center",
  },
  milestonePrimaryText: { fontSize: 12, fontWeight: "700", color: DS_COLORS.WHITE },
  milestoneSecondary: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 99,
    paddingVertical: 9,
    alignItems: "center",
  },
  milestoneSecondaryText: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.5)" },

  empty: { paddingVertical: 32, alignItems: "center" },
  emptyTitle: { fontSize: 14, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 6 },
  emptySub: { fontSize: 12, color: DS_COLORS.TEXT_SECONDARY },
  retry: { fontSize: 13, color: DS_COLORS.DISCOVER_CORAL, fontWeight: "600", marginTop: 8 },

  skeleton: { padding: 14 },
  skelRow: { flexDirection: "row", gap: 10 },
  skelAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: DS_COLORS.chipFill },
  skelLineLg: { height: 12, borderRadius: 4, backgroundColor: DS_COLORS.chipFill, width: "70%" },
  skelLineSm: { height: 10, borderRadius: 4, backgroundColor: DS_COLORS.chipFill, width: "45%" },
  skelProof: { marginTop: 12, height: 120, borderRadius: 12, backgroundColor: DS_COLORS.chipFill },
});
