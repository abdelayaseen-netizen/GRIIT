import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, Share } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MessageCircle, Upload } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/contexts/AuthContext";
import { DS_COLORS, DS_SHADOWS, DS_SPACING, GRIIT_COLORS } from "@/lib/design-system";
import { getAvatarColor } from "@/lib/utils";
import { relativeTime } from "@/lib/utils/relativeTime";
import CommentSheet, { type FeedComment } from "@/components/CommentSheet";
import { captureError } from "@/lib/sentry";
import { SkeletonFeedCard } from "@/components/skeletons";

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
  const router = useRouter();
  const avatarBg = getAvatarColor(post.username ?? post.displayName ?? "");
  const initial = (post.displayName || post.username || "?").trim().charAt(0).toUpperCase();
  const pct = Math.min(100, Math.max(0, (post.currentDay / Math.max(1, post.totalDays)) * 100));
  const displayUser = post.displayName || post.username || "Member";
  const profileUsername = post.username?.trim();

  return (
    <View style={[cardStyles.card, DS_SHADOWS.card]} accessibilityRole="summary">
      <TouchableOpacity
        activeOpacity={0.97}
        onPress={() => {
          if (post.challengeId) router.push(ROUTES.CHALLENGE_ID(post.challengeId) as never);
        }}
        disabled={!post.challengeId}
        accessibilityLabel={`${displayUser} — ${post.challengeName} — Day ${post.currentDay} of ${post.totalDays}`}
        accessibilityRole="button"
      >
        <View style={cardStyles.header}>
          <TouchableOpacity
            onPress={() => {
              if (profileUsername) {
                router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(profileUsername)) as never);
              }
            }}
            disabled={!profileUsername}
            accessibilityLabel={profileUsername ? `View ${profileUsername}'s profile` : "Profile unavailable"}
            accessibilityRole="button"
          >
            <View style={[cardStyles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={cardStyles.avatarText}>{initial}</Text>
            </View>
          </TouchableOpacity>
          <View style={cardStyles.headerRight}>
            <Text style={cardStyles.username} numberOfLines={1}>
              {displayUser}
              {post.streakCount > 0 ? ` · 🔥 ${post.streakCount}` : ""}
            </Text>
            <Text style={cardStyles.challengeName} numberOfLines={1}>
              {post.challengeName}
            </Text>
          </View>
          <Text style={cardStyles.timestamp}>{relativeTime(post.createdAt)}</Text>
        </View>

        <View style={cardStyles.progressSection}>
          <View style={cardStyles.progressLabel}>
            <Text style={cardStyles.dayText}>
              Day {post.currentDay} of {post.totalDays}
            </Text>
            <Text style={cardStyles.percentText}>{Math.round(pct)}%</Text>
          </View>
          <View style={cardStyles.progressTrack}>
            <View style={[cardStyles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>

        {post.hasProof ? (
          <View style={cardStyles.proofWrap}>
            {post.photoUrl ? (
              <Image
                source={{ uri: post.photoUrl }}
                style={cardStyles.proofPhoto}
                contentFit="cover"
                accessibilityRole="image"
                accessibilityLabel={`Proof photo for ${post.challengeName}`}
              />
            ) : (
              <View style={cardStyles.proofPlaceholder}>
                {post.verified ? (
                  <View style={cardStyles.verifiedBadge}>
                    <Text style={cardStyles.verifiedText}>✓ Verified</Text>
                  </View>
                ) : null}
                <Text style={cardStyles.proofEmoji}>📸</Text>
                <Text style={cardStyles.proofLabel}>PROOF PHOTO</Text>
              </View>
            )}
          </View>
        ) : null}

        {post.caption ? (
          <Text style={cardStyles.description} numberOfLines={4}>
            {post.caption}
          </Text>
        ) : null}
      </TouchableOpacity>

      <View style={cardStyles.actionRow}>
        <TouchableOpacity
          style={[cardStyles.respectButton, post.reactedByMe && cardStyles.respectButtonGiven]}
          onPress={onRespect}
          accessibilityLabel={
            post.reactedByMe
              ? `Remove respect from ${displayUser}`
              : `Give respect to ${displayUser}`
          }
          accessibilityRole="button"
          accessibilityState={{ selected: post.reactedByMe }}
        >
          <Text style={cardStyles.respectEmoji}>🔥</Text>
          <Text style={[cardStyles.respectText, post.reactedByMe && cardStyles.respectTextToggled]}>Respect</Text>
          {post.respectCount > 0 ? (
            <Text style={[cardStyles.respectCount, post.reactedByMe && cardStyles.respectCountToggled]}>
              · {post.respectCount}
            </Text>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={cardStyles.ghostButton}
          onPress={onComment}
          accessibilityLabel={`Comment on ${displayUser}'s post — ${post.commentCount} comments`}
          accessibilityRole="button"
        >
          <MessageCircle size={14} color={DS_COLORS.textSecondary} />
          {post.commentCount > 0 ? (
            <Text style={cardStyles.ghostButtonText}>{post.commentCount}</Text>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={cardStyles.shareButton}
          onPress={onShare}
          accessibilityLabel={`Share ${displayUser}'s ${post.challengeName} post`}
          accessibilityRole="button"
        >
          <Upload size={14} color={DS_COLORS.textSecondary} />
          <Text style={cardStyles.ghostButtonText}>Share</Text>
        </TouchableOpacity>
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
  const router = useRouter();
  const avatarBg = getAvatarColor(post.username ?? post.displayName ?? "");
  const initial = (post.displayName || post.username || "?").trim().charAt(0).toUpperCase();
  const profileUsername = post.username?.trim();
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
        <TouchableOpacity
          onPress={() => {
            if (profileUsername) {
              router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(profileUsername)) as never);
            }
          }}
          disabled={!profileUsername}
          accessibilityLabel={profileUsername ? `View ${profileUsername}'s profile` : "Profile unavailable"}
          accessibilityRole="button"
        >
          <View style={[styles.avatar26, { backgroundColor: avatarBg }]}>
            <Text style={styles.avatarLetter12}>{initial}</Text>
          </View>
        </TouchableOpacity>
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
      <View style={styles.feedHeader}>
        <View style={styles.feedHeaderLeft}>
          <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
          <Text style={styles.feedTitle}>Feed</Text>
          <Text style={styles.liveCountMeta}>{moving} active</Text>
        </View>
        <View style={styles.feedToggle}>
          <TouchableOpacity
            onPress={() => setScope("following")}
            style={[styles.togglePill, scope === "following" && styles.togglePillActive]}
            accessibilityRole="button"
            accessibilityLabel="Show feed from people you follow"
            accessibilityState={{ selected: scope === "following" }}
          >
            <Text style={[styles.toggleText, scope === "following" && styles.toggleTextActive]}>Following</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setScope("everyone")}
            style={[styles.togglePill, scope === "everyone" && styles.togglePillActive]}
            accessibilityRole="button"
            accessibilityLabel="Show feed from everyone"
            accessibilityState={{ selected: scope === "everyone" }}
          >
            <Text style={[styles.toggleText, scope === "everyone" && styles.toggleTextActive]}>Everyone</Text>
          </TouchableOpacity>
        </View>
      </View>

      {feedQuery.isPending ? (
        <View style={{ gap: 10 }}>
          <SkeletonFeedCard />
          <SkeletonFeedCard />
          <SkeletonFeedCard />
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
          removeClippedSubviews
          initialNumToRender={5}
          maxToRenderPerBatch={3}
          windowSize={10}
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

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    paddingBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: DS_COLORS.TEXT_ON_DARK,
    fontSize: 15,
    fontWeight: "600",
  },
  headerRight: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  challengeName: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
    marginTop: 1,
  },
  timestamp: {
    fontSize: 11,
    color: DS_COLORS.TEXT_TERTIARY,
  },
  progressSection: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  progressLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: GRIIT_COLORS.primary,
  },
  percentText: {
    fontSize: 12,
    color: DS_COLORS.TEXT_TERTIARY,
    fontWeight: "500",
  },
  progressTrack: {
    height: 6,
    backgroundColor: DS_COLORS.surfaceMuted,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: GRIIT_COLORS.primary,
  },
  proofWrap: {
    width: "100%",
  },
  proofPhoto: {
    width: "100%",
    height: 220,
  },
  proofPlaceholder: {
    marginHorizontal: 14,
    backgroundColor: DS_COLORS.BG_DARK,
    borderRadius: 12,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  verifiedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: GRIIT_COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  verifiedText: { fontSize: 10, fontWeight: "700", color: DS_COLORS.TEXT_ON_DARK },
  proofEmoji: { fontSize: 22, opacity: 0.35 },
  proofLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: DS_COLORS.TEXT_MUTED,
    letterSpacing: 1.5,
  },
  description: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
    fontSize: 14,
    color: DS_COLORS.textPrimary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: DS_COLORS.border,
    gap: 8,
  },
  respectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GRIIT_COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  respectButtonGiven: {
    backgroundColor: DS_COLORS.accentLight,
  },
  respectEmoji: { fontSize: 13 },
  respectText: {
    color: DS_COLORS.TEXT_ON_DARK,
    fontSize: 13,
    fontWeight: "600",
  },
  respectTextToggled: {
    color: GRIIT_COLORS.primary,
  },
  respectCount: {
    color: DS_COLORS.TEXT_ON_DARK,
    fontSize: 13,
    fontWeight: "500",
  },
  respectCountToggled: {
    color: GRIIT_COLORS.primary,
  },
  ghostButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: DS_COLORS.border,
    gap: 5,
  },
  ghostButtonText: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
    fontWeight: "500",
  },
  shareButton: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: DS_COLORS.border,
    gap: 5,
  },
});

const styles = StyleSheet.create({
  wrap: {
    marginTop: DS_SPACING.md,
    marginHorizontal: DS_SPACING.screenHorizontal,
    marginBottom: DS_SPACING.sm,
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  feedHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: DS_COLORS.DISCOVER_GREEN,
  },
  feedTitle: { fontSize: 16, fontWeight: "600", color: DS_COLORS.textPrimary },
  liveCountMeta: { fontSize: 12, color: DS_COLORS.TEXT_TERTIARY },
  feedToggle: {
    flexDirection: "row",
    backgroundColor: DS_COLORS.surfaceMuted,
    borderRadius: 20,
    padding: 2,
  },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
    backgroundColor: "transparent",
  },
  togglePillActive: {
    backgroundColor: DS_COLORS.card,
    ...DS_SHADOWS.button,
  },
  toggleText: { fontSize: 12, color: DS_COLORS.textSecondary, fontWeight: "500" },
  toggleTextActive: { color: DS_COLORS.textPrimary, fontWeight: "600" },

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

});
