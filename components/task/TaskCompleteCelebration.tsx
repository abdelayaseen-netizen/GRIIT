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
import { DS_COLORS, DS_DAYLIGHT } from "@/lib/design-system";
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_DAYLIGHT.color.canvas }]} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "New proof",
          headerBackVisible: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: DS_DAYLIGHT.color.canvas },
          headerTintColor: DS_DAYLIGHT.color.ink,
          headerTitleStyle: {
            fontSize: DS_DAYLIGHT.size.title,
            fontWeight: DS_DAYLIGHT.weight.semibold,
            color: DS_DAYLIGHT.color.ink,
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
          {taskName ? (
            <Text style={d.subtitle}>{taskName}</Text>
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
                    colors={["transparent", DS_DAYLIGHT.color.photoGradientSoft]}
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
                    <Camera size={17} color={DS_DAYLIGHT.color.white} strokeWidth={2} />
                    <Text style={d.photoPrimaryText}>Take a photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={d.photoSecondaryBtn}
                    onPress={handlePickImage}
                    disabled={photoUploading}
                    accessibilityRole="button"
                    accessibilityLabel="Choose from library"
                  >
                    <GalleryIcon size={17} color={DS_DAYLIGHT.color.inkSecondary} strokeWidth={2} />
                    <Text style={d.photoSecondaryText}>Choose from library</Text>
                  </TouchableOpacity>
                </View>
              )}
              {photoUploading ? (
                <ActivityIndicator size="small" color={DS_DAYLIGHT.color.accent} style={{ marginTop: 8 }} />
              ) : null}
            </View>
          )}

          <TextInput
            style={d.captionInput}
            placeholder="Say something about today…"
            placeholderTextColor={DS_DAYLIGHT.color.placeholder}
            value={postCaption}
            onChangeText={setPostCaption}
            maxLength={120}
            editable={!postedInline}
          />
          <Text
            style={[
              d.captionCount,
              { color: postCaption.length === 120 ? DS_DAYLIGHT.color.accent : DS_DAYLIGHT.color.inkMuted2 },
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
              <ActivityIndicator color={DS_DAYLIGHT.color.white} />
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
              <Share2 size={20} color={DS_DAYLIGHT.color.inkSecondary} />
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
            <Text style={d.doneBtnText}>Skip — go home</Text>
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
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: "stretch",
  },
  title: {
    fontSize: DS_DAYLIGHT.size.greeting,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  rewardPill: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: DS_DAYLIGHT.radius.pill,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  rewardText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.accent,
  },
  photoSection: {
    marginTop: 18,
  },
  photoPreview: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: DS_DAYLIGHT.radius.cardMd,
    overflow: "hidden",
    backgroundColor: DS_DAYLIGHT.color.photoPlaceholder,
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
    fontSize: DS_DAYLIGHT.size.title,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.textOnPhoto,
  },
  photoChangeBadge: {
    position: "absolute",
    top: 13,
    right: 13,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: DS_DAYLIGHT.radius.pill,
    backgroundColor: DS_DAYLIGHT.color.glassChipOnPhotoBg,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.glassChipOnPhotoBorder,
  },
  photoChangeBadgeText: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.textOnPhoto,
  },
  photoPickerRow: {
    flexDirection: "row",
    gap: 10,
  },
  photoPrimaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: DS_DAYLIGHT.radius.field,
    backgroundColor: DS_DAYLIGHT.color.ink,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoPrimaryText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.white,
  },
  photoSecondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: DS_DAYLIGHT.radius.field,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_DAYLIGHT.color.dashedBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoSecondaryText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.inkSecondary,
  },
  captionInput: {
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: DS_DAYLIGHT.radius.field,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    fontSize: DS_DAYLIGHT.size.bodyLg,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.ink,
  },
  captionCount: {
    alignSelf: "flex-end",
    marginTop: 6,
    fontSize: DS_DAYLIGHT.size.metaSm,
  },
  postedOk: {
    marginTop: 12,
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.accent,
    textAlign: "center",
  },
  postedErr: {
    marginTop: 12,
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_COLORS.danger,
    textAlign: "center",
  },
  shareProofBtn: {
    marginTop: 20,
    height: 56,
    borderRadius: DS_DAYLIGHT.radius.buttonLg,
    backgroundColor: DS_DAYLIGHT.color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  shareProofText: {
    fontSize: DS_DAYLIGHT.size.title,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.white,
  },
  helperText: {
    marginTop: 13,
    textAlign: "center",
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  secondaryBtn: {
    marginTop: 12,
    height: 50,
    borderRadius: DS_DAYLIGHT.radius.field,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.inkSecondary,
  },
  doneBtn: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 8,
  },
  doneBtnText: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted,
  },
});
