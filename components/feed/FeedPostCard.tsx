import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TextInput,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Camera, Heart } from "lucide-react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
import { relativeTime } from "@/lib/utils/relativeTime";
import { FeedCardHeader } from "./FeedCardHeader";
import { FeedEngagementRow } from "./FeedEngagementRow";
import { WhoRespectedSheet } from "./WhoRespectedSheet";
import type { FeedCommentPreview, LiveFeedPost } from "./feedTypes";
import { Avatar } from "@/components/Avatar";
import { ImageViewerModal } from "@/components/shared/ImageViewerModal";
import { track } from "@/lib/analytics";
import { FLAGS } from "@/lib/feature-flags";

function placeholderBg(challengeName: string): string {
  const s = challengeName.toLowerCase();
  if (s.includes("water") || s.includes("gallon") || s.includes("hydrat")) return DS_COLORS.FEED_PLACEHOLDER_WATER;
  if (s.includes("cold") || s.includes("ice") || s.includes("shower")) return DS_COLORS.FEED_PLACEHOLDER_COLD;
  return DS_COLORS.FEED_PLACEHOLDER_GENERAL;
}

type Props = {
  post: LiveFeedPost;
  onProfilePress: () => void;
  onRespect: () => void;
  onComment: () => void;
  onShare: () => void;
  onMenuPress?: () => void;
  previewComment?: FeedCommentPreview | null;
  onSubmitComment?: (text: string) => Promise<void>;
};

function FeedPostCardInner({
  post,
  onProfilePress,
  onRespect,
  onComment,
  onShare,
  onMenuPress,
  previewComment,
  onSubmitComment,
}: Props) {
  const pct = Math.min(100, Math.max(0, (post.currentDay / Math.max(1, post.totalDays)) * 100));
  const proofUri = post.proofPhotoUrl || post.photoUrl;
  const showProof = post.hasProof || Boolean(proofUri);

  const [showWhoRespected, setShowWhoRespected] = React.useState(false);
  const [showQuickComment, setShowQuickComment] = React.useState(false);
  const [quickDraft, setQuickDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const viewerOpenedAtRef = React.useRef<number>(0);

  const taskOrDayTag = post.taskName?.trim()
    ? post.taskName.trim()
    : `Day ${post.currentDay} of ${post.totalDays}`;

  const lastTapRef = React.useRef<number>(0);
  const tapTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartScale = React.useRef(new Animated.Value(0)).current;
  const heartOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
    };
  }, []);

  const handleImagePress = React.useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      if (!post.reactedByMe) {
        onRespect();
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      heartScale.setValue(0);
      heartOpacity.setValue(1);
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1,
          friction: 3,
          tension: 150,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      tapTimeoutRef.current = setTimeout(() => {
        if (FLAGS.PR3_IMAGE_VIEWER && proofUri) {
          setViewerOpen(true);
          viewerOpenedAtRef.current = Date.now();
          track({ name: "image_viewer_opened", source: "feed", post_id: post.id });
        }
        tapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  }, [post.reactedByMe, post.id, onRespect, heartScale, heartOpacity, proofUri]);

  const handleQuickSend = React.useCallback(async () => {
    const text = quickDraft.trim();
    if (!text || sending || !onSubmitComment) return;
    setSending(true);
    try {
      await onSubmitComment(text);
      setQuickDraft("");
      setShowQuickComment(false);
    } catch {
      // Error handled upstream
    } finally {
      setSending(false);
    }
  }, [quickDraft, sending, onSubmitComment]);

  return (
    <View style={styles.card}>
      <FeedCardHeader post={post} onProfilePress={onProfilePress} onMenuPress={onMenuPress} />

      {showProof ? (
        <View style={styles.proofWrap}>
          <View style={styles.proofMedia}>
            <Pressable
              style={styles.heroPressable}
              onPress={handleImagePress}
              accessibilityRole="button"
              accessibilityLabel="Tap photo to view full screen, double tap to respect"
            >
              <View style={styles.proofImageArea}>
                {proofUri ? (
                  <Image
                    source={{ uri: proofUri }}
                    style={styles.proofImage}
                    contentFit="cover"
                    accessibilityRole="image"
                  />
                ) : (
                  <View style={[styles.placeholder, { backgroundColor: placeholderBg(post.challengeName) }]}>
                    <Camera size={40} color={DS_COLORS.TEXT_PRIMARY} style={{ opacity: 0.35 }} />
                  </View>
                )}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.heartOverlay,
                    {
                      opacity: heartOpacity,
                      transform: [{ scale: heartScale }],
                    },
                  ]}
                >
                  <Heart size={80} color={DS_COLORS.FEED_RESPECT_ICON_FILL} fill={DS_COLORS.FEED_RESPECT_ICON_FILL} />
                </Animated.View>
              </View>

              <View style={styles.overlayAnchored}>
                <View style={styles.overlayBackdrop}>
                  <Text style={styles.overlayChallenge} numberOfLines={2}>
                    {post.challengeName}
                  </Text>
                  <Text style={styles.overlayTag} numberOfLines={2}>
                    {taskOrDayTag}
                  </Text>
                  {post.caption?.trim() ? (
                    <Text
                      style={styles.overlayCaption}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      accessibilityRole="text"
                    >
                      {post.caption}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      ) : post.caption?.trim() ? (
        <Text style={styles.captionFallback} accessibilityRole="text">
          {post.caption}
        </Text>
      ) : null}

      <View style={styles.progressBlock}>
        {!FLAGS.PR3_FEED_DEDUPE ? (
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>
              Day {post.currentDay} of {post.totalDays}
            </Text>
          </View>
        ) : null}
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>

      {post.respectCount > 0 && post.lastReactorName ? (
        <View style={styles.respectedByRow}>
          <Text style={styles.respectedByText}>
            <Text style={styles.respectedByBold}>{post.lastReactorName}</Text>
            {post.respectCount > 1
              ? ` and ${post.respectCount - 1} other${post.respectCount > 2 ? "s" : ""}`
              : ""}
            {" respected this"}
          </Text>
        </View>
      ) : null}

      <FeedEngagementRow
        respectCount={post.respectCount}
        reactedByMe={post.reactedByMe}
        commentCount={post.commentCount}
        onRespect={onRespect}
        onComment={onSubmitComment ? () => setShowQuickComment((v) => !v) : onComment}
        onShare={onShare}
        onRespectCountPress={() => setShowWhoRespected(true)}
      />

      {showQuickComment && onSubmitComment ? (
        <View style={styles.quickCommentRow}>
          <TextInput
            style={styles.quickCommentInput}
            placeholder="Add a comment..."
            placeholderTextColor={DS_COLORS.TEXT_MUTED}
            value={quickDraft}
            onChangeText={setQuickDraft}
            maxLength={200}
            autoFocus
            returnKeyType="send"
            onSubmitEditing={() => void handleQuickSend()}
          />
          <Pressable
            onPress={() => void handleQuickSend()}
            disabled={!quickDraft.trim() || sending}
            style={[styles.quickSendBtn, (!quickDraft.trim() || sending) && styles.quickSendBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Send comment"
          >
            <Text style={styles.quickSendText}>{sending ? "..." : "Post"}</Text>
          </Pressable>
        </View>
      ) : null}

      {previewComment ? (
        <View style={styles.commentPreview}>
          <Avatar
            url={previewComment.avatarUrl}
            name={previewComment.displayName || previewComment.username || "?"}
            userId={previewComment.userId}
            size={24}
          />
          <View style={styles.commentBody}>
            <Text style={styles.commentLine} numberOfLines={2}>
              <Text style={styles.commentUser}>{previewComment.displayName || previewComment.username}</Text>
              <Text style={styles.commentText}> {previewComment.text}</Text>
            </Text>
            <Text style={styles.commentTime}>{relativeTime(previewComment.createdAt)}</Text>
          </View>
        </View>
      ) : null}

      <WhoRespectedSheet visible={showWhoRespected} eventId={post.id} onClose={() => setShowWhoRespected(false)} />

      {FLAGS.PR3_IMAGE_VIEWER && proofUri ? (
        <ImageViewerModal
          visible={viewerOpen}
          imageUri={proofUri}
          onClose={() => {
            const duration = viewerOpenedAtRef.current
              ? Date.now() - viewerOpenedAtRef.current
              : undefined;
            track({
              name: "image_viewer_closed",
              source: "feed",
              post_id: post.id,
              duration_ms: duration,
            });
            setViewerOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}

export const FeedPostCard = React.memo(FeedPostCardInner);

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.XL,
    overflow: "hidden",
  },
  captionFallback: {
    fontSize: 12,
    color: DS_COLORS.TEXT_PRIMARY,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  proofWrap: {
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: DS_RADIUS.MD,
    overflow: "hidden",
    backgroundColor: DS_COLORS.FEED_PROGRESS_TRACK,
  },
  proofMedia: {
    position: "relative",
    width: "100%",
  },
  heroPressable: {
    width: "100%",
    position: "relative",
  },
  proofImageArea: {
    width: "100%",
    aspectRatio: 4 / 5,
    position: "relative",
    overflow: "hidden",
  },
  proofImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  heartOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayAnchored: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 4,
  },
  overlayChallenge: {
    fontSize: 13,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.WHITE,
    opacity: 0.7,
  },
  overlayTag: {
    fontSize: 12,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.WHITE,
    opacity: 0.92,
  },
  overlayCaption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    color: DS_COLORS.WHITE,
    opacity: 1,
    marginTop: 2,
  },
  progressBlock: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 2,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS.FEED_PROGRESS_LABEL,
  },
  track: {
    height: 3,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.FEED_PROGRESS_TRACK,
    overflow: "hidden",
  },
  fill: {
    height: 3,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.ACCENT,
  },
  respectedByRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },
  respectedByText: {
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  respectedByBold: {
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  quickCommentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DS_COLORS.FEED_COMMENT_BORDER,
  },
  quickCommentInput: {
    flex: 1,
    fontSize: 13,
    color: DS_COLORS.TEXT_PRIMARY,
    backgroundColor: DS_COLORS.INPUT_BG,
    borderRadius: DS_RADIUS.XL,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
  },
  quickSendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: DS_RADIUS.XL,
    backgroundColor: DS_COLORS.ACCENT,
  },
  quickSendBtnDisabled: {
    opacity: 0.4,
  },
  quickSendText: {
    fontSize: 13,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_ON_DARK,
  },
  commentPreview: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 0.5,
    borderTopColor: DS_COLORS.FEED_COMMENT_BORDER,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  commentBody: { flex: 1 },
  commentLine: { fontSize: 12 },
  commentUser: {
    fontWeight: "500",
    color: DS_COLORS.FEED_USERNAME,
  },
  commentText: {
    fontWeight: "400",
    color: DS_COLORS.FEED_COMMENT_BODY,
  },
  commentTime: {
    marginTop: 2,
    fontSize: 11,
    color: DS_COLORS.FEED_META_MUTED,
  },
});
