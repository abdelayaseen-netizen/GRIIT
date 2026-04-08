import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TextInput,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Camera, CircleCheck, Heart, X } from "lucide-react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
import { relativeTime } from "@/lib/utils/relativeTime";
import { FeedCardHeader } from "./FeedCardHeader";
import { FeedEngagementRow } from "./FeedEngagementRow";
import { WhoRespectedSheet } from "./WhoRespectedSheet";
import type { FeedCommentPreview, LiveFeedPost } from "./feedTypes";
import { Avatar } from "@/components/Avatar";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

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
  const [lightboxVisible, setLightboxVisible] = React.useState(false);

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
        if (proofUri) {
          setLightboxVisible(true);
        }
        tapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  }, [post.reactedByMe, onRespect, heartScale, heartOpacity, proofUri]);

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

      {post.caption ? (
        <Text style={styles.captionBody} accessibilityRole="text">
          {post.caption}
        </Text>
      ) : null}

      {showProof ? (
        <View style={styles.proofWrap}>
          <Pressable
            onPress={handleImagePress}
            accessibilityRole="button"
            accessibilityLabel="Tap to view full image, double tap to respect"
          >
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
          </Pressable>
          <View style={styles.proofMeta}>
            <CircleCheck size={12} color={DS_COLORS.ACCENT} />
            <Text style={styles.taskTag}>
              {post.challengeName}
              {post.taskName ? ` · ${post.taskName}` : ` · Task ${post.currentDay} of ${post.totalDays}`}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.progressBlock}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>
            Day {post.currentDay} of {post.totalDays}
          </Text>
        </View>
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

      {proofUri ? (
        <Modal
          visible={lightboxVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLightboxVisible(false)}
          statusBarTranslucent
        >
          <View style={styles.lightboxOverlay}>
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => setLightboxVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close full image"
            />
            <Image
              source={{ uri: proofUri }}
              style={styles.lightboxImage}
              contentFit="contain"
              accessibilityLabel="Full size proof photo"
            />
            <TouchableOpacity
              style={styles.lightboxClose}
              onPress={() => setLightboxVisible(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={24} color={DS_COLORS.WHITE} />
            </TouchableOpacity>
          </View>
        </Modal>
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
  captionBody: {
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
  proofImage: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  placeholder: {
    width: "100%",
    aspectRatio: 4 / 3,
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
  proofMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
  },
  taskTag: {
    fontSize: 11,
    color: DS_COLORS.TEXT_SECONDARY,
    flex: 1,
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
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxClose: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.OVERLAY_WHITE_15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  lightboxImage: {
    width: SCREEN_W,
    height: SCREEN_H * 0.8,
  },
});
