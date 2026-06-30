import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Camera, Image as GalleryIcon, Share2 } from "lucide-react-native";
import ViewShot from "react-native-view-shot";
import { DS_COLORS_V2, DS_RADIUS_V2, DS_SPACING_V2 } from "@/lib/design-system";
import { captureError } from "@/lib/sentry";
import { shareToInstagramStory } from "@/lib/share";
import { trackEvent } from "@/lib/analytics";
import { ShareSheetModal } from "@/components/share/ShareSheetModal";
import {
  StatementCard,
  TransparentCard,
  ProofPhotoCard,
  DayRecapCard,
  ChallengeCompleteCard,
  MinimalStreakCard,
  SHARE_CARD_DIMENSIONS,
} from "@/components/share/ShareCards";
import { styles } from "@/components/task/task-complete-styles";

type ShareCardPropsBundle = {
  statementShareProps: React.ComponentProps<typeof StatementCard>;
  transparentShareProps: React.ComponentProps<typeof TransparentCard>;
  proofShareProps: React.ComponentProps<typeof ProofPhotoCard>;
  recapShareProps: React.ComponentProps<typeof DayRecapCard>;
  completeShareProps: React.ComponentProps<typeof ChallengeCompleteCard>;
  minimalShareProps: React.ComponentProps<typeof MinimalStreakCard>;
};

export interface TaskCompleteCelebrationProps extends ShareCardPropsBundle {
  taskName: string;
  /** Task type raw string — used for per-type secured line. */
  taskTypeRaw?: string;
  /** Current streak count after securing — shown as "{n} day streak" chip. */
  streakCount?: number;
  isHardMode: boolean;
  variableReward: { label: string; color: string; bg: string } | null;
  postedInline: boolean;
  postCaption: string;
  setPostCaption: (t: string) => void;
  shareFeedErr: string;
  photoUrl: string | null;
  photoUri: string | null;
  photoUploading: boolean;
  handleTakePhoto: () => Promise<void>;
  handlePickImage: () => Promise<void>;
  clearPhoto: () => void;
  handleShareToFeed: () => void | Promise<void>;
  shareBusy: boolean;
  showShareSheet: boolean;
  setShowShareSheet: (v: boolean) => void;
  onDone: () => void;
  shareRef: React.RefObject<ViewShot | null>;
  transparentCardRef: React.RefObject<ViewShot | null>;
  proofCardRef: React.RefObject<ViewShot | null>;
  recapCardRef: React.RefObject<ViewShot | null>;
  completeCardRef: React.RefObject<ViewShot | null>;
  minimalStreakCardRef: React.RefObject<ViewShot | null>;
  completionIdForShare: string | undefined;
  hasPhotoForShare: boolean;
  isAllDayComplete: boolean;
  isChallengeCompleteShare: boolean;
}

export function TaskCompleteCelebration({
  taskName,
  taskTypeRaw,
  streakCount,
  isHardMode: _isHardMode,
  variableReward,
  postedInline,
  postCaption,
  setPostCaption,
  shareFeedErr,
  photoUrl,
  photoUri,
  photoUploading,
  handleTakePhoto,
  handlePickImage,
  clearPhoto,
  handleShareToFeed,
  shareBusy,
  showShareSheet,
  setShowShareSheet,
  onDone,
  shareRef,
  transparentCardRef,
  proofCardRef,
  recapCardRef,
  completeCardRef,
  minimalStreakCardRef,
  completionIdForShare,
  hasPhotoForShare,
  isAllDayComplete,
  isChallengeCompleteShare,
  statementShareProps,
  transparentShareProps,
  proofShareProps,
  recapShareProps,
  completeShareProps,
  minimalShareProps,
}: TaskCompleteCelebrationProps) {
  // Per-type secured line (storyboard: "Photo proof secured.", "Journal entry secured.", etc.)
  const securedLine = (() => {
    switch (taskTypeRaw) {
      case "photo":   return "Photo proof secured.";
      case "timer":   return "Session time secured.";
      case "run":     return "Run entry secured.";
      case "workout": return "Workout secured.";
      case "journal": return "Journal entry secured.";
      case "counter":
      case "water":   return "Daily target secured.";
      case "reading": return "Reading log secured.";
      case "checkin": return "Location check-in secured.";
      default:        return null;
    }
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS_V2.surface.canvas }]} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Secured",
          headerBackVisible: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: DS_COLORS_V2.surface.canvas },
          headerTintColor: DS_COLORS_V2.text.primary,
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: "600",
            color: DS_COLORS_V2.text.primary,
          },
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={d.wrap}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Text style={d.title}>Secured.</Text>
          {securedLine ? (
            <Text style={d.securedLine}>{securedLine}</Text>
          ) : null}
          {taskName ? (
            <Text style={d.subtitle}>{taskName}</Text>
          ) : null}
          {typeof streakCount === "number" && streakCount > 0 ? (
            <View style={d.streakChip}>
              <Text style={d.streakChipText}>
                🔥 {streakCount} day{streakCount === 1 ? "" : " streak"}
              </Text>
            </View>
          ) : null}

          {variableReward ? (
            <View style={d.rewardPill}>
              <Text style={d.rewardText}>{variableReward.label}</Text>
            </View>
          ) : null}

          {!postedInline && (
            <View style={d.photoSection}>
              {photoUrl ? (
                <View style={d.photoPreview}>
                  <Image
                    source={{ uri: photoUri || photoUrl }}
                    style={d.photoImage}
                    contentFit="cover"
                    accessibilityLabel="Proof photo"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.55)"]}
                    style={d.photoGradient}
                    pointerEvents="none"
                  />
                  <Text style={d.photoOverlayTitle} numberOfLines={1} pointerEvents="none">
                    {taskName}
                  </Text>
                  <TouchableOpacity
                    style={d.photoChangeBadge}
                    onPress={() => {
                      clearPhoto();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo"
                  >
                    <Text style={d.photoChangeBadgeText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={d.photoPickerRow}>
                  <TouchableOpacity
                    style={d.photoPrimaryBtn}
                    onPress={handleTakePhoto}
                    disabled={photoUploading}
                    accessibilityRole="button"
                    accessibilityLabel="Take a photo"
                  >
                    <Camera size={17} color={DS_COLORS_V2.text.onDark} strokeWidth={2} />
                    <Text style={d.photoPrimaryText}>Take a photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={d.photoSecondaryBtn}
                    onPress={handlePickImage}
                    disabled={photoUploading}
                    accessibilityRole="button"
                    accessibilityLabel="Choose from library"
                  >
                    <GalleryIcon size={17} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
                    <Text style={d.photoSecondaryText}>Choose from library</Text>
                  </TouchableOpacity>
                </View>
              )}
              {photoUploading ? (
                <ActivityIndicator size="small" color={DS_COLORS_V2.brand.primary} style={{ marginTop: 8 }} />
              ) : null}
            </View>
          )}

          <TextInput
            style={d.captionInput}
            placeholder="Say something about today…"
            placeholderTextColor={DS_COLORS_V2.text.tertiary}
            value={postCaption}
            onChangeText={setPostCaption}
            maxLength={120}
            editable={!postedInline}
          />
          <Text
            style={[
              d.captionCount,
              { color: postCaption.length === 120 ? DS_COLORS_V2.brand.primary : DS_COLORS_V2.text.secondary },
            ]}
            accessibilityLiveRegion="polite"
          >
            {postCaption.length} / 120
          </Text>

          {postedInline ? <Text style={d.postedOk}>Posted!</Text> : null}
          {shareFeedErr ? <Text style={d.postedErr}>{shareFeedErr}</Text> : null}

          <TouchableOpacity
            style={[d.shareProofBtn, (shareBusy || postedInline) && { opacity: 0.6 }]}
            onPress={() => void handleShareToFeed()}
            disabled={shareBusy || postedInline}
            accessibilityRole="button"
            accessibilityLabel="Share to GRIIT feed"
          >
            {shareBusy ? (
              <ActivityIndicator color={DS_COLORS_V2.brand.primaryText} />
            ) : (
              <Text style={d.shareProofText}>Share proof</Text>
            )}
          </TouchableOpacity>
          <Text style={d.helperText}>Your circle will see it.</Text>

          {Platform.OS !== "web" ? (
            <TouchableOpacity
              style={d.secondaryBtn}
              onPress={() => setShowShareSheet(true)}
              accessibilityRole="button"
              accessibilityLabel="Share a GRIIT card"
            >
              <Share2 size={20} color={DS_COLORS_V2.text.secondary} />
              <Text style={d.secondaryBtnText}>Share card</Text>
            </TouchableOpacity>
          ) : null}

          {(photoUrl || photoUri) ? (
            <TouchableOpacity
              style={d.secondaryBtn}
              onPress={async () => {
                if (!photoUrl && !photoUri) return;
                const imageUri = photoUri || photoUrl || "";
                try {
                  await shareToInstagramStory(imageUri);
                  trackEvent("share_completed", { content_type: "instagram_story_celebration" });
                } catch (e) {
                  captureError(e, "CelebrationShareStory");
                }
              }}
              disabled={!photoUrl && !photoUri}
              accessibilityRole="button"
              accessibilityLabel="Share proof to Instagram Stories"
            >
              <Text style={d.secondaryBtnText}>Share to Stories</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={d.doneBtn}
            onPress={onDone}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text style={d.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS !== "web" ? (
        <>
          <ShareSheetModal
            visible={showShareSheet}
            onClose={() => setShowShareSheet(false)}
            shareRef={shareRef}
            transparentCardRef={transparentCardRef}
            proofCardRef={proofCardRef}
            recapCardRef={recapCardRef}
            completeCardRef={completeCardRef}
            minimalStreakCardRef={minimalStreakCardRef}
            hasPhoto={hasPhotoForShare}
            isAllDayComplete={isAllDayComplete}
            isChallengeComplete={isChallengeCompleteShare}
            statementProps={statementShareProps}
            transparentProps={transparentShareProps}
            proofProps={proofShareProps}
            recapProps={recapShareProps}
            completeProps={completeShareProps}
            minimalProps={minimalShareProps}
            completionId={completionIdForShare}
          />
          <View style={styles.offscreenCapture} pointerEvents="none" collapsable={false}>
            <ViewShot
              ref={shareRef}
              options={{ format: "png", quality: 1, result: "tmpfile" }}
              style={{ width: SHARE_CARD_DIMENSIONS.width, height: SHARE_CARD_DIMENSIONS.height }}
            >
              <StatementCard {...statementShareProps} />
            </ViewShot>
            <ViewShot
              ref={transparentCardRef}
              options={{ format: "png", quality: 1, result: "tmpfile" }}
              style={{ width: SHARE_CARD_DIMENSIONS.width, height: SHARE_CARD_DIMENSIONS.height }}
            >
              <TransparentCard {...transparentShareProps} />
            </ViewShot>
            {hasPhotoForShare ? (
              <ViewShot
                ref={proofCardRef}
                options={{ format: "png", quality: 1, result: "tmpfile" }}
                style={{ width: SHARE_CARD_DIMENSIONS.width, height: SHARE_CARD_DIMENSIONS.height }}
              >
                <ProofPhotoCard {...proofShareProps} />
              </ViewShot>
            ) : null}
            {isAllDayComplete ? (
              <ViewShot
                ref={recapCardRef}
                options={{ format: "png", quality: 1, result: "tmpfile" }}
                style={{ width: SHARE_CARD_DIMENSIONS.width, height: SHARE_CARD_DIMENSIONS.height }}
              >
                <DayRecapCard {...recapShareProps} />
              </ViewShot>
            ) : null}
            {isChallengeCompleteShare ? (
              <ViewShot
                ref={completeCardRef}
                options={{ format: "png", quality: 1, result: "tmpfile" }}
                style={{ width: SHARE_CARD_DIMENSIONS.width, height: SHARE_CARD_DIMENSIONS.height }}
              >
                <ChallengeCompleteCard {...completeShareProps} />
              </ViewShot>
            ) : null}
            <ViewShot
              ref={minimalStreakCardRef}
              options={{ format: "png", quality: 1, result: "tmpfile" }}
              style={{ width: SHARE_CARD_DIMENSIONS.width, height: SHARE_CARD_DIMENSIONS.height }}
            >
              <MinimalStreakCard {...minimalShareProps} />
            </ViewShot>
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
}

const d = StyleSheet.create({
  wrap: {
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: "stretch",
  },
  title: {
    fontSize: 27,
    fontWeight: "600",
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.5,
  },
  securedLine: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13.5,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
  streakChip: {
    alignSelf: "flex-start",
    marginTop: DS_SPACING_V2.xs,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
  },
  streakChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: DS_COLORS_V2.brand.primary,
  },
  rewardPill: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
  },
  rewardText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: DS_COLORS_V2.brand.primary,
  },
  photoSection: {
    marginTop: 18,
  },
  photoPreview: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: DS_RADIUS_V2.lg,
    overflow: "hidden",
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "38%",
  },
  photoOverlayTitle: {
    position: "absolute",
    left: 20,
    bottom: 18,
    fontSize: 17,
    fontWeight: "600",
    color: DS_COLORS_V2.text.onDark,
  },
  photoChangeBadge: {
    position: "absolute",
    top: 13,
    right: 13,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  photoChangeBadgeText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: DS_COLORS_V2.text.onDark,
  },
  photoPickerRow: {
    flexDirection: "row",
    gap: 10,
  },
  photoPrimaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.text.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoPrimaryText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: DS_COLORS_V2.text.onDark,
  },
  photoSecondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_COLORS_V2.surface.divider,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoSecondaryText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: DS_COLORS_V2.text.secondary,
  },
  captionInput: {
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    fontSize: 16,
    fontWeight: "400",
    color: DS_COLORS_V2.text.primary,
  },
  captionCount: {
    alignSelf: "flex-end",
    marginTop: 6,
    fontSize: 12.5,
  },
  postedOk: {
    marginTop: 12,
    fontSize: 13.5,
    fontWeight: "600",
    color: DS_COLORS_V2.brand.primary,
    textAlign: "center",
  },
  postedErr: {
    marginTop: 12,
    fontSize: 13.5,
    fontWeight: "400",
    color: DS_COLORS_V2.semantic.danger,
    textAlign: "center",
  },
  shareProofBtn: {
    marginTop: 20,
    height: 56,
    borderRadius: DS_RADIUS_V2.lg,
    backgroundColor: DS_COLORS_V2.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  shareProofText: {
    fontSize: 17,
    fontWeight: "600",
    color: DS_COLORS_V2.brand.primaryText,
  },
  helperText: {
    marginTop: 13,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
  secondaryBtn: {
    marginTop: 12,
    height: 50,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: DS_COLORS_V2.text.secondary,
  },
  doneBtn: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 8,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
});
