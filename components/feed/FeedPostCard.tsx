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
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Heart } from "lucide-react-native";
import { DS_DAYLIGHT } from "@/lib/design-system";
import { relativeTime } from "@/lib/utils/relativeTime";
import { FeedCardHeader } from "./FeedCardHeader";
import { FeedEngagementRow } from "./FeedEngagementRow";
import { WhoRespectedSheet } from "./WhoRespectedSheet";
import type { FeedCommentPreview, LiveFeedPost } from "./feedTypes";
import { Avatar } from "@/components/Avatar";
import { ImageViewerModal } from "@/components/shared/ImageViewerModal";
import { track } from "@/lib/analytics";
import { FLAGS } from "@/lib/feature-flags";

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

  const posterName = post.displayName || post.username || "";
  const posterFirst = posterName.trim().split(/\s+/)[0] || posterName;

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

  const captionText = post.caption?.trim();

  return (
    <View style={styles.card}>
      <FeedCardHeader post={post} onProfilePress={onProfilePress} onMenuPress={onMenuPress} />

      {showProof ? (
        <View style={styles.proofWrap}>
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
                <View style={styles.placeholder}>
                  <Camera size={40} color={DS_DAYLIGHT.color.inkMuted} style={{ opacity: 0.5 }} />
                </View>
              )}

              <LinearGradient
                colors={["transparent", DS_DAYLIGHT.color.photoGradientStrong]}
                style={styles.photoGradient}
                pointerEvents="none"
              />

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
                <Heart size={80} color={DS_DAYLIGHT.color.accent} fill={DS_DAYLIGHT.color.accent} />
              </Animated.View>

              {post.respectCount > 0 ? (
                <View style={styles.kudosChip} pointerEvents="none">
                  <Heart size={13} color={DS_DAYLIGHT.color.textOnPhoto} fill={DS_DAYLIGHT.color.textOnPhoto} />
                  <Text style={styles.kudosChipText}>{post.respectCount}</Text>
                </View>
              ) : null}

              <View style={styles.overlayAnchored} pointerEvents="none">
                <Text style={styles.overlayTitle} numberOfLines={2}>
                  {post.challengeName}
                </Text>
                <Text style={styles.overlayMeta} numberOfLines={1}>
                  {taskOrDayTag}
                </Text>
              </View>
            </View>
          </Pressable>
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

      {captionText ? (
        <View style={styles.captionWrap}>
          <Text style={styles.captionText} accessibilityRole="text">
            {posterFirst ? <Text style={styles.captionName}>{posterFirst} </Text> : null}
            {post.caption}
          </Text>
        </View>
      ) : null}

      {post.respectCount > 0 && post.lastReactorName ? (
        <View style={styles.respectedByRow}>
          <Text style={styles.respectedByText}>
            {"Respected by "}
            <Text style={styles.respectedByName}>{post.lastReactorName}</Text>
            {post.respectCount > 1
              ? ` and ${post.respectCount - 1} other${post.respectCount > 2 ? "s" : ""}`
              : ""}
          </Text>
        </View>
      ) : null}

      {showQuickComment && onSubmitComment ? (
        <View style={styles.quickCommentRow}>
          <TextInput
            style={styles.quickCommentInput}
            placeholder="Add a comment..."
            placeholderTextColor={DS_DAYLIGHT.color.placeholder}
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

      <View style={styles.divider} />

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
    backgroundColor: DS_DAYLIGHT.color.canvas,
    paddingTop: 6,
  },
  proofWrap: {
    marginHorizontal: DS_DAYLIGHT.space.cardPad,
    marginTop: 13,
    borderRadius: DS_DAYLIGHT.radius.card,
    overflow: "hidden",
    backgroundColor: DS_DAYLIGHT.color.photoPlaceholder,
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
    backgroundColor: DS_DAYLIGHT.color.photoPlaceholder,
  },
  photoGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "42%",
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
  kudosChip: {
    position: "absolute",
    top: 13,
    right: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: DS_DAYLIGHT.color.glassChipOnPhotoBg,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.glassChipOnPhotoBorder,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: DS_DAYLIGHT.radius.pill,
  },
  kudosChipText: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.textOnPhoto,
  },
  overlayAnchored: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
  },
  overlayTitle: {
    fontSize: DS_DAYLIGHT.size.bodyLg,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.textOnPhoto,
  },
  overlayMeta: {
    marginTop: 2,
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.textOnPhotoDim,
  },
  captionWrap: {
    paddingHorizontal: DS_DAYLIGHT.space.cardPad,
    paddingTop: 9,
  },
  captionText: {
    fontSize: DS_DAYLIGHT.size.body,
    lineHeight: 22,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.ink,
  },
  captionName: {
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
  respectedByRow: {
    paddingHorizontal: DS_DAYLIGHT.space.cardPad,
    paddingTop: 6,
  },
  respectedByText: {
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  respectedByName: {
    color: DS_DAYLIGHT.color.inkSecondary,
  },
  quickCommentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: DS_DAYLIGHT.space.cardPad,
    paddingTop: 12,
  },
  quickCommentInput: {
    flex: 1,
    fontSize: DS_DAYLIGHT.size.bodySm,
    color: DS_DAYLIGHT.color.ink,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    borderRadius: DS_DAYLIGHT.radius.field,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
  },
  quickSendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: DS_DAYLIGHT.radius.field,
    backgroundColor: DS_DAYLIGHT.color.accent,
  },
  quickSendBtnDisabled: {
    opacity: 0.4,
  },
  quickSendText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.white,
  },
  commentPreview: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    paddingHorizontal: DS_DAYLIGHT.space.cardPad,
  },
  commentBody: { flex: 1 },
  commentLine: { fontSize: DS_DAYLIGHT.size.bodySm },
  commentUser: {
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.inkSecondary,
  },
  commentText: {
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkSecondary,
  },
  commentTime: {
    marginTop: 2,
    fontSize: DS_DAYLIGHT.size.metaSm,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  divider: {
    height: 1,
    backgroundColor: DS_DAYLIGHT.color.dividerStrong,
    marginTop: 18,
    marginHorizontal: DS_DAYLIGHT.space.screenH,
  },
});
