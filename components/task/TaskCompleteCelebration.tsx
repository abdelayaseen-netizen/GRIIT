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
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Camera, Image as GalleryIcon, Share2 } from "lucide-react-native";
import ViewShot from "react-native-view-shot";
import { DS_COLORS } from "@/lib/design-system";
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
import { celebStyles, styles } from "@/components/task/task-complete-styles";

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
  isHardMode,
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
  const celebPoints = isHardMode ? 8 : 5;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.CELEB_BG }]} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: taskName,
          headerBackVisible: true,
          headerStyle: { backgroundColor: DS_COLORS.CELEB_BG },
          headerTintColor: DS_COLORS.WHITE,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={celebStyles.wrap}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Text style={celebStyles.fireEmoji}>🔥</Text>
          <Text style={celebStyles.title}>Secured.</Text>
          <Text style={celebStyles.subtitle}>
            +{celebPoints} points · {taskName}
          </Text>

          {variableReward ? (
            <View style={[celebStyles.rewardPill, { backgroundColor: variableReward.bg }]}>
              <Text style={[celebStyles.rewardText, { color: variableReward.color }]}>{variableReward.label}</Text>
            </View>
          ) : null}

          {!postedInline && (
            <View style={celebStyles.photoSection}>
              {photoUrl ? (
                <View style={celebStyles.photoPreview}>
                  <Image
                    source={{ uri: photoUri || photoUrl }}
                    style={celebStyles.photoImage}
                    contentFit="cover"
                    accessibilityLabel="Proof photo"
                  />
                  <TouchableOpacity
                    style={celebStyles.photoChangeBadge}
                    onPress={() => {
                      clearPhoto();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo"
                  >
                    <Text style={celebStyles.photoChangeBadgeText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={celebStyles.photoPickerRow}>
                  <TouchableOpacity
                    style={celebStyles.photoPickerBtn}
                    onPress={handleTakePhoto}
                    disabled={photoUploading}
                    accessibilityRole="button"
                    accessibilityLabel="Take a photo"
                  >
                    <Camera size={20} color={DS_COLORS.TEXT_ON_DARK_60} />
                    <Text style={celebStyles.photoPickerText}>Take photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={celebStyles.photoPickerBtn}
                    onPress={handlePickImage}
                    disabled={photoUploading}
                    accessibilityRole="button"
                    accessibilityLabel="Choose from gallery"
                  >
                    <GalleryIcon size={20} color={DS_COLORS.TEXT_ON_DARK_60} />
                    <Text style={celebStyles.photoPickerText}>Choose photo</Text>
                  </TouchableOpacity>
                </View>
              )}
              {photoUploading ? (
                <ActivityIndicator size="small" color={DS_COLORS.WHITE} style={{ marginTop: 8 }} />
              ) : null}
            </View>
          )}

          <Text style={celebStyles.captionLabel}>Add a caption (optional)</Text>
          <TextInput
            style={celebStyles.captionInput}
            placeholder="Just finished my workout 💪"
            placeholderTextColor={DS_COLORS.DISCOVER_HERO_AVATAR_RING}
            value={postCaption}
            onChangeText={setPostCaption}
            maxLength={500}
            editable={!postedInline}
          />

          {postedInline ? <Text style={celebStyles.postedOk}>Posted!</Text> : null}
          {shareFeedErr ? <Text style={celebStyles.postedErr}>{shareFeedErr}</Text> : null}

          <TouchableOpacity
            style={[celebStyles.shareToFeedBtn, postedInline && { opacity: 0.85 }]}
            onPress={() => void handleShareToFeed()}
            disabled={shareBusy || postedInline}
            accessibilityRole="button"
            accessibilityLabel="Share to GRIIT feed"
          >
            {shareBusy ? (
              <ActivityIndicator color={DS_COLORS.WHITE} />
            ) : (
              <Text style={celebStyles.shareToFeedText}>Post to GRIIT</Text>
            )}
          </TouchableOpacity>

          {Platform.OS !== "web" ? (
            <TouchableOpacity
              style={celebStyles.shareCardBtn}
              onPress={() => setShowShareSheet(true)}
              accessibilityRole="button"
              accessibilityLabel="Share a GRIIT card"
            >
              <Share2 size={20} color={DS_COLORS.WHITE} />
              <Text style={celebStyles.shareCardBtnText}>Share card</Text>
            </TouchableOpacity>
          ) : null}

          {(photoUrl || photoUri) ? (
            <TouchableOpacity
              style={celebStyles.shareStoriesBtn}
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
              <Text style={celebStyles.shareStoriesBtnText}>Share to Stories</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={celebStyles.doneBtn}
            onPress={onDone}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text style={celebStyles.doneBtnText}>Skip — go home</Text>
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
