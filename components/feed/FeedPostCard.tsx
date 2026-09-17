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
import { DS_V3 } from "@/lib/design-system";
import { relativeTime } from "@/lib/utils/relativeTime";
import { FeedCardHeader } from "./FeedCardHeader";
import { FeedEngagementRow } from "./FeedEngagementRow";
import { WhoRespectedSheet } from "./WhoRespectedSheet";
import type { FeedCommentPreview, LiveFeedPost } from "./feedTypes";
import { Avatar } from "@/components/Avatar";
import { ImageViewerModal } from "@/components/shared/ImageViewerModal";
import { track } from "@/lib/analytics";
import { FLAGS } from "@/lib/feature-flags";

/** Dead card — tokens must still be DS_V3 (contradiction 18). */
const V = {
  color: {
    inkMuted: DS_V3.color.textSecondary,
    photoGradientStrong: DS_V3.color.canvas,
    accent: DS_V3.color.brand,
    textOnPhoto: DS_V3.color.textPrimary,
    textOnPhotoDim: DS_V3.color.textSecondary,
    placeholder: DS_V3.color.textSecondary,
    canvas: DS_V3.color.canvas,
    photoPlaceholder: DS_V3.color.surface,
    glassChipOnPhotoBg: DS_V3.color.brandTint,
    glassChipOnPhotoBorder: DS_V3.color.border,
    ink: DS_V3.color.textPrimary,
    inkSecondary: DS_V3.color.textSecondary,
    inkMuted2: DS_V3.color.textSecondary,
    fieldNeutral: DS_V3.color.surface,
    cardBorder: DS_V3.color.border,
    white: DS_V3.color.onBrand,
    dividerStrong: DS_V3.color.border,
  },
  space: {
    cardPad: DS_V3.space.gutter,
    screenH: DS_V3.space.gutter,
  },
  radius: {
    card: DS_V3.radius.card,
    pill: DS_V3.radius.pill,
    field: DS_V3.radius.input,
  },
  size: {
    metaSm: DS_V3.type.caption.fontSize,
    bodyLg: DS_V3.type.heading.fontSize,
    meta: DS_V3.type.caption.fontSize,
    body: DS_V3.type.body.fontSize,
    bodySm: DS_V3.type.secondary.fontSize,
  },
  weight: {
    semibold: DS_V3.type.bodyStrong.fontWeight,
    regular: DS_V3.type.body.fontWeight,
  },
};

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
                  cachePolicy="memory-disk"
                  recyclingKey={post.id}
                  accessibilityRole="image"
                />
              ) : (
                <View style={styles.placeholder}>
                  <Camera size={40} color={V.color.inkMuted} style={{ opacity: 0.5 }} />
                </View>
              )}

              <LinearGradient
                colors={["transparent", V.color.photoGradientStrong]}
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
                <Heart size={80} color={V.color.accent} fill={V.color.accent} />
              </Animated.View>

              {post.respectCount > 0 ? (
                <View style={styles.kudosChip} pointerEvents="none">
                  <Heart size={13} color={V.color.textOnPhoto} fill={V.color.textOnPhoto} />
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
            placeholderTextColor={V.color.placeholder}
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
    backgroundColor: V.color.canvas,
    paddingTop: 6,
  },
  proofWrap: {
    marginHorizontal: V.space.cardPad,
    marginTop: 13,
    borderRadius: V.radius.card,
    overflow: "hidden",
    backgroundColor: V.color.photoPlaceholder,
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
    backgroundColor: V.color.photoPlaceholder,
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
    backgroundColor: V.color.glassChipOnPhotoBg,
    borderWidth: 1,
    borderColor: V.color.glassChipOnPhotoBorder,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: V.radius.pill,
  },
  kudosChipText: {
    fontSize: V.size.metaSm,
    fontWeight: V.weight.semibold,
    color: V.color.textOnPhoto,
  },
  overlayAnchored: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
  },
  overlayTitle: {
    fontSize: V.size.bodyLg,
    fontWeight: V.weight.semibold,
    color: V.color.textOnPhoto,
  },
  overlayMeta: {
    marginTop: 2,
    fontSize: V.size.meta,
    fontWeight: V.weight.regular,
    color: V.color.textOnPhotoDim,
  },
  captionWrap: {
    paddingHorizontal: V.space.cardPad,
    paddingTop: 9,
  },
  captionText: {
    fontSize: V.size.body,
    lineHeight: 22,
    fontWeight: V.weight.regular,
    color: V.color.ink,
  },
  captionName: {
    fontWeight: V.weight.semibold,
    color: V.color.ink,
  },
  respectedByRow: {
    paddingHorizontal: V.space.cardPad,
    paddingTop: 6,
  },
  respectedByText: {
    fontSize: V.size.meta,
    fontWeight: V.weight.regular,
    color: V.color.inkMuted2,
  },
  respectedByName: {
    color: V.color.inkSecondary,
  },
  quickCommentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: V.space.cardPad,
    paddingTop: 12,
  },
  quickCommentInput: {
    flex: 1,
    fontSize: V.size.bodySm,
    color: V.color.ink,
    backgroundColor: V.color.fieldNeutral,
    borderWidth: 1,
    borderColor: V.color.cardBorder,
    borderRadius: V.radius.field,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
  },
  quickSendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: V.radius.field,
    backgroundColor: V.color.accent,
  },
  quickSendBtnDisabled: {
    opacity: 0.4,
  },
  quickSendText: {
    fontSize: V.size.bodySm,
    fontWeight: V.weight.semibold,
    color: V.color.white,
  },
  commentPreview: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    paddingHorizontal: V.space.cardPad,
  },
  commentBody: { flex: 1 },
  commentLine: { fontSize: V.size.bodySm },
  commentUser: {
    fontWeight: V.weight.semibold,
    color: V.color.inkSecondary,
  },
  commentText: {
    fontWeight: V.weight.regular,
    color: V.color.inkSecondary,
  },
  commentTime: {
    marginTop: 2,
    fontSize: V.size.metaSm,
    color: V.color.inkMuted2,
  },
  divider: {
    height: 1,
    backgroundColor: V.color.dividerStrong,
    marginTop: 18,
    marginHorizontal: V.space.screenH,
  },
});
