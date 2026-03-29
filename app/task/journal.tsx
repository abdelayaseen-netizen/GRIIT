// LEGACY: consider migrating to task/complete.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import {
  ChevronLeft,
  BookOpen,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Zap,
  Heart,
  Check,
  Camera,
  ImagePlus,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "@/contexts/AppContext";
import { DS_COLORS } from "@/lib/design-system";
import type { MoodLevel, BodyState, JournalCategory } from "@/types";
import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";
import { captureError } from "@/lib/sentry";
import { ROUTES } from "@/lib/routes";

const JOURNAL_CATEGORY_LABELS: Record<JournalCategory, string> = {
  self_reflection: "Self-reflection",
  emotions: "Emotions & feelings",
  mental_clarity: "Mental clarity",
  physical_state: "Physical state",
  gratitude: "Gratitude",
  wins_losses: "Wins & losses",
  discipline_check: "Discipline check",
  free_write: "Free write",
};

const MOOD_OPTIONS: { value: MoodLevel; label: string; icon: React.ElementType; color: string }[] = [
  { value: "very_bad", label: "Awful", icon: Angry, color: DS_COLORS.danger },
  { value: "bad", label: "Low", icon: Frown, color: DS_COLORS.taskAmber },
  { value: "neutral", label: "Okay", icon: Meh, color: DS_COLORS.moodYellow },
  { value: "good", label: "Good", icon: Smile, color: DS_COLORS.acceptGreen },
  { value: "very_good", label: "Great", icon: Laugh, color: DS_COLORS.taskEmerald },
];

const ENERGY_LEVELS = [1, 2, 3, 4, 5];

const BODY_STATE_OPTIONS: { value: BodyState; label: string; color: string }[] = [
  { value: "fresh", label: "Fresh", color: DS_COLORS.acceptGreen },
  { value: "ok", label: "OK", color: DS_COLORS.moodYellow },
  { value: "sore", label: "Sore", color: DS_COLORS.taskAmber },
  { value: "exhausted", label: "Exhausted", color: DS_COLORS.danger },
];

const MIN_ENTRY_LENGTH = 20;
const MAX_ENTRY_LENGTH = 2000;
const DRAFT_KEY_PREFIX = "journal_draft_";

export default function JournalTaskScreen() {
  const router = useRouter();
  const { taskId, prompt, types, captureMood: captureMoodParam, captureEnergy: captureEnergyParam, captureBody, wordLimit: wordLimitParam, requirePhotoProof: requirePhotoProofParam } = useLocalSearchParams<{
    taskId: string;
    prompt: string;
    types: string;
    captureMood: string;
    captureEnergy: string;
    captureBody: string;
    wordLimit: string;
    requirePhotoProof: string;
  }>();
  const { activeChallenge, completeTask } = useApp();

  const journalPrompt = prompt || "Write your thoughts...";
  const journalTypes: JournalCategory[] = types ? (JSON.parse(types) as JournalCategory[]) : [];
  const shouldCaptureMood = captureMoodParam !== "false";
  const shouldCaptureEnergy = captureEnergyParam !== "false";
  const shouldCaptureBody = captureBody === "true";
  const wordLimitWords = wordLimitParam ? parseInt(wordLimitParam, 10) : null;
  const hasWordLimit = wordLimitWords !== null && wordLimitWords > 0;
  const requirePhotoProof = requirePhotoProofParam === "true";

  const [entryText, setEntryText] = useState("");
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [bodyState, setBodyState] = useState<BodyState | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftExitVisible, setDraftExitVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const draftTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { error, showError, clearError } = useInlineError();

  const draftKey = `${DRAFT_KEY_PREFIX}${taskId || "default"}`;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    AsyncStorage.getItem(draftKey).then((draft) => {
      if (draft && !draftLoaded) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.entryText) setEntryText(parsed.entryText);
          if (parsed.mood) setMood(parsed.mood);
          if (parsed.energy) setEnergy(parsed.energy);
          if (parsed.bodyState) setBodyState(parsed.bodyState);
        } catch (e) {
          captureError(e, "JournalTaskParseDraft");
          if (__DEV__) console.error("[JournalTask] parse draft failed:", e);
        }
      }
      setDraftLoaded(true);
    });
  }, [draftKey, draftLoaded]);

  useEffect(() => {
    if (!draftLoaded) return;
    draftTimerRef.current = setInterval(() => {
      const draft = JSON.stringify({ entryText, mood, energy, bodyState });
      AsyncStorage.setItem(draftKey, draft).catch((e) => {
        captureError(e, "JournalTaskSaveDraft");
        if (__DEV__) console.error("[JournalTask] save draft failed:", e);
      });
    }, 3000);
    return () => {
      if (draftTimerRef.current) clearInterval(draftTimerRef.current);
    };
  }, [entryText, mood, energy, bodyState, draftKey, draftLoaded]);

  const countWords = useCallback((text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, []);

  const isOverLimit = hasWordLimit && countWords(entryText) > wordLimitWords;
  const isNearLimit = hasWordLimit && countWords(entryText) >= Math.floor(wordLimitWords * 0.8);

  const isValid = useCallback(() => {
    if (entryText.trim().length < MIN_ENTRY_LENGTH) return false;
    if (hasWordLimit && countWords(entryText) > wordLimitWords) return false;
    if (shouldCaptureMood && mood === null) return false;
    if (shouldCaptureEnergy && energy === null) return false;
    if (shouldCaptureBody && bodyState === null) return false;
    if (requirePhotoProof && !photoUri) return false;
    return true;
  }, [entryText, mood, energy, bodyState, shouldCaptureMood, shouldCaptureEnergy, shouldCaptureBody, hasWordLimit, wordLimitWords, countWords, requirePhotoProof, photoUri]);

  const pickerOptions = { allowsEditing: true, aspect: [4, 3] as [number, number], quality: 0.8, base64: true as const };

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showError("Camera permission is required to add photo proof");
      return;
    }
    const result = await ImagePicker.launchCameraAsync(pickerOptions);
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setPhotoUri(a.uri);
      setPhotoBase64(a.base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pickerOptions is a stable config object; adding would recreate callback every render
  }, [showError]);

  const handlePickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showError("Gallery access is required to add photo proof");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ ...pickerOptions, mediaTypes: ["images"] });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setPhotoUri(a.uri);
      setPhotoBase64(a.base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pickerOptions is a stable config object; adding would recreate callback every render
  }, [showError]);

  const handleSubmit = async () => {
    if (!isValid()) {
      const issues: string[] = [];
      if (entryText.trim().length < MIN_ENTRY_LENGTH) issues.push(`Write at least ${MIN_ENTRY_LENGTH} characters`);
      if (shouldCaptureMood && mood === null) issues.push("Select your mood");
      if (shouldCaptureEnergy && energy === null) issues.push("Rate your energy");
      if (shouldCaptureBody && bodyState === null) issues.push("Select body state");
      if (requirePhotoProof && !photoUri) issues.push("Add photo proof (required)");
      showError(issues.join("\n"));
      return;
    }

    if (!activeChallenge) {
      showError("No active challenge found");
      return;
    }
    if (!taskId) {
      showError("Task not found");
      return;
    }

    setLoading(true);
    try {
      let proofUrl: string | undefined;
      if (requirePhotoProof && (photoUri || photoBase64)) {
        setUploading(true);
        if (photoBase64) {
          const contentType = photoUri?.toLowerCase().includes(".png") ? "image/png" : "image/jpeg";
          const result = await uploadProofImageFromBase64(photoBase64, contentType);
          if ("error" in result) {
            showError(result.error);
            return;
          }
          proofUrl = result.url;
        } else if (photoUri) {
          const { uploadProofImageFromUri } = await import("@/lib/uploadProofImage");
          const result = await uploadProofImageFromUri(photoUri);
          if ("error" in result) {
            showError(result.error);
            return;
          }
          proofUrl = result.url;
        }
        setUploading(false);
      }

      await completeTask({
        activeChallengeId: activeChallenge.id,
        taskId,
        noteText: entryText.trim(),
        proofUrl,
      });

      await AsyncStorage.removeItem(draftKey);

      setShowSuccess(true);

      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
        Animated.timing(confettiOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    } catch (error: unknown) {
      captureError(error, "JournalTaskSubmit");
      showError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const wordCount = countWords(entryText);

  const handleTextChange = useCallback((text: string) => {
    if (hasWordLimit) {
      const words = text.trim().split(/\s+/).filter(Boolean);
      if (words.length > wordLimitWords) {
        const limited = words.slice(0, wordLimitWords).join(" ");
        const trailingSpace = text.endsWith(" ") ? " " : "";
        setEntryText(limited + trailingSpace);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      }
    }
    setEntryText(text.slice(0, MAX_ENTRY_LENGTH));
  }, [hasWordLimit, wordLimitWords]);

  if (showSuccess) {
    return (
      <SafeAreaView style={s.container} edges={["top", "bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.successContainer}>
          <Animated.View style={[s.successContent, { transform: [{ scale: successScale }] }]}>
            <View style={s.successIconWrap}>
              <Check size={32} color={DS_COLORS.white} />
            </View>
            <Text style={s.successTitle}>Journal saved</Text>
            <Text style={s.successSubtitle}>Your thoughts are recorded for today.</Text>
          </Animated.View>
          <Animated.View style={[s.successActions, { opacity: confettiOpacity }]}>
            <TouchableOpacity
              style={s.successPrimaryBtn}
              onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Back to challenge"
            >
              <Text style={s.successPrimaryBtnText}>Back to challenge</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <SafeAreaView style={s.flex} edges={["top"]}>
          <View style={s.header}>
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => {
                if (entryText.trim().length > 0) {
                  setDraftExitVisible(true);
                } else {
                  router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never);
                }
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ChevronLeft size={22} color={DS_COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <Text style={s.headerTitle}>Journal Entry</Text>
              <View style={s.headerTag}>
                <BookOpen size={10} color={DS_COLORS.taskIndigo} />
                <Text style={s.headerTagText}>Journal</Text>
              </View>
            </View>
            <View style={s.headerRight} />
          </View>

          <InlineError message={error} onDismiss={clearError} />
          <KeyboardAvoidingView
            style={s.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
          >
            <ScrollView
              style={s.scrollView}
              contentContainerStyle={s.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={s.promptCard}>
                <Text style={s.promptLabel}>{"Today's prompt"}</Text>
                <Text style={s.promptText}>{journalPrompt}</Text>
                {journalTypes.length > 0 && (
                  <View style={s.typeChips}>
                    {journalTypes.map((jt) => (
                      <View key={jt} style={s.typeChip}>
                        <Text style={s.typeChipText}>{JOURNAL_CATEGORY_LABELS[jt] || jt}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {shouldCaptureMood && (
                <View style={s.checkinSection}>
                  <Text style={s.checkinLabel}>How are you feeling?</Text>
                  <View style={s.moodRow}>
                    {MOOD_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = mood === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[s.moodItem, isSelected && { backgroundColor: `${opt.color}15`, borderColor: opt.color }]}
                          onPress={() => {
                            setMood(opt.value);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          activeOpacity={0.7}
                          accessibilityRole="tab"
                          accessibilityLabel={`Mood: ${opt.label}`}
                          accessibilityState={{ selected: isSelected }}
                        >
                          <Icon size={22} color={isSelected ? opt.color : DS_COLORS.textMuted} />
                          <Text style={[s.moodLabel, isSelected && { color: opt.color }]}>{opt.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {shouldCaptureEnergy && (
                <View style={s.checkinSection}>
                  <Text style={s.checkinLabel}>Energy level</Text>
                  <View style={s.energyRow}>
                    {ENERGY_LEVELS.map((level) => {
                      const isSelected = energy === level;
                      const fillColor = level <= 2 ? DS_COLORS.danger : level === 3 ? DS_COLORS.moodYellow : DS_COLORS.acceptGreen;
                      return (
                        <TouchableOpacity
                          key={level}
                          style={[s.energyItem, isSelected && { backgroundColor: `${fillColor}15`, borderColor: fillColor }]}
                          onPress={() => {
                            setEnergy(level);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          activeOpacity={0.7}
                          accessibilityRole="tab"
                          accessibilityLabel={`Energy level ${level}`}
                          accessibilityState={{ selected: isSelected }}
                        >
                          <Zap size={16} color={isSelected ? fillColor : DS_COLORS.textMuted} />
                          <Text style={[s.energyNumber, isSelected && { color: fillColor }]}>{level}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {shouldCaptureBody && (
                <View style={s.checkinSection}>
                  <Text style={s.checkinLabel}>Body state</Text>
                  <View style={s.bodyRow}>
                    {BODY_STATE_OPTIONS.map((opt) => {
                      const isSelected = bodyState === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[s.bodyChip, isSelected && { backgroundColor: `${opt.color}15`, borderColor: opt.color }]}
                          onPress={() => {
                            setBodyState(opt.value);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          activeOpacity={0.7}
                          accessibilityRole="tab"
                          accessibilityLabel={`Body state: ${opt.label}`}
                          accessibilityState={{ selected: isSelected }}
                        >
                          <Text style={[s.bodyChipText, isSelected && { color: opt.color }]}>{opt.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={s.entrySection}>
                <Text style={s.entryLabel}>Your entry</Text>
                <TextInput
                  style={s.textArea}
                  placeholder="Write honestly. 2-5 sentences is enough."
                  placeholderTextColor={DS_COLORS.textMuted}
                  value={entryText}
                  onChangeText={handleTextChange}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  editable={!loading}
                  testID="journal-entry-input"
                />
                <View style={s.entryMeta}>
                  {hasWordLimit ? (
                    <View style={s.wordLimitRow}>
                      <Text style={[
                        s.wordCount,
                        isNearLimit && !isOverLimit && s.wordCountNear,
                        isOverLimit && s.wordCountWarn,
                      ]}>
                        {wordCount} / {wordLimitWords} words
                      </Text>
                      {wordCount === wordLimitWords && (
                        <Text style={s.limitReached}>Limit reached</Text>
                      )}
                    </View>
                  ) : (
                    <Text style={[s.wordCount, entryText.trim().length > 0 && entryText.trim().length < MIN_ENTRY_LENGTH && s.wordCountWarn]}>
                      Word count: {wordCount}
                    </Text>
                  )}
                  <Text style={s.charCount}>{entryText.length}/{MAX_ENTRY_LENGTH}</Text>
                </View>
              </View>

              {requirePhotoProof && (
                <View style={s.checkinSection}>
                  <Text style={s.checkinLabel}>Photo proof (required)</Text>
                  {photoUri ? (
                    <View style={s.photoProofPreview}>
                      <Image
                        source={{ uri: photoUri }}
                        style={s.photoProofThumb}
                        cachePolicy="memory-disk"
                        accessibilityLabel="Journal proof photo"
                      />
                      <View style={s.photoProofActions}>
                        <TouchableOpacity style={s.photoProofBtn} onPress={handleTakePhoto} activeOpacity={0.8} accessibilityLabel="Retake photo" accessibilityRole="button">
                          <Camera size={18} color={DS_COLORS.textPrimary} />
                          <Text style={s.photoProofBtnText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.photoProofBtn} onPress={handlePickFromGallery} activeOpacity={0.8} accessibilityLabel="Change photo from gallery" accessibilityRole="button">
                          <ImagePlus size={18} color={DS_COLORS.textPrimary} />
                          <Text style={s.photoProofBtnText}>Change</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={s.photoProofEmpty}>
                      <TouchableOpacity
                        style={s.photoProofPrimaryBtn}
                        onPress={handleTakePhoto}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Take photo"
                      >
                        <Camera size={22} color={DS_COLORS.white} />
                        <Text style={s.photoProofPrimaryBtnText}>Take photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.photoProofSecondaryBtn}
                        onPress={handlePickFromGallery}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Upload from gallery"
                      >
                        <ImagePlus size={20} color={DS_COLORS.textSecondary} />
                        <Text style={s.photoProofSecondaryBtnText}>Upload from gallery</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <SafeAreaView edges={["bottom"]} style={s.footerSafe}>
              <View style={s.footer}>
                <TouchableOpacity
                  style={[s.submitBtn, !isValid() && s.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={loading || !isValid()}
                  activeOpacity={0.8}
                  testID="journal-submit-button"
                  accessibilityLabel="Save journal entry"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: loading || !isValid() }}
                >
                  {loading ? (
                    <View style={s.submitBtnInner}>
                      <ActivityIndicator color={DS_COLORS.white} size="small" />
                      <Text style={s.submitBtnText}>{uploading ? "Uploading…" : "Saving…"}</Text>
                    </View>
                  ) : (
                    <View style={s.submitBtnInner}>
                      <Heart size={18} color={DS_COLORS.white} />
                      <Text style={s.submitBtnText}>Complete Journal</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>

      <Modal visible={draftExitVisible} transparent animationType="fade" onRequestClose={() => setDraftExitVisible(false)}>
        <Pressable
          style={s.draftExitBackdrop}
          onPress={() => setDraftExitVisible(false)}
          accessibilityLabel="Dismiss"
          accessibilityRole="button"
        >
          <Pressable style={s.draftExitCard} onPress={(e) => e.stopPropagation()} accessible={false}>
            <Text style={s.draftExitTitle}>Save draft?</Text>
            <Text style={s.draftExitBody}>Your entry will be saved as a draft.</Text>
            <TouchableOpacity
              style={s.draftExitBtnPrimary}
              onPress={() => setDraftExitVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Keep editing"
            >
              <Text style={s.draftExitBtnPrimaryText}>Keep editing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.draftExitBtnDanger}
              onPress={() => {
                void AsyncStorage.removeItem(draftKey);
                setDraftExitVisible(false);
                router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never);
              }}
              accessibilityRole="button"
              accessibilityLabel="Discard draft"
            >
              <Text style={s.draftExitBtnDangerText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.draftExitBtnSecondary}
              onPress={() => {
                setDraftExitVisible(false);
                router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never);
              }}
              accessibilityRole="button"
              accessibilityLabel="Save and exit"
            >
              <Text style={s.draftExitBtnSecondaryText}>Save & Exit</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.journalCardBg,
  },
  flex: {
    flex: 1,
  },
  draftExitBackdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: DS_COLORS.modalBackdrop,
  },
  draftExitCard: {
    backgroundColor: DS_COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  draftExitTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  draftExitBody: {
    fontSize: 14,
    color: DS_COLORS.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  draftExitBtnPrimary: {
    backgroundColor: DS_COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  draftExitBtnPrimaryText: { fontSize: 16, fontWeight: "700", color: DS_COLORS.textPrimary },
  draftExitBtnDanger: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: DS_COLORS.alertRedBorder,
    backgroundColor: DS_COLORS.dangerLight,
  },
  draftExitBtnDangerText: { fontSize: 16, fontWeight: "600", color: DS_COLORS.dangerDark },
  draftExitBtnSecondary: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  draftExitBtnSecondaryText: { fontSize: 16, fontWeight: "600", color: DS_COLORS.textPrimary },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
    backgroundColor: DS_COLORS.journalCardBg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
  },
  headerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: DS_COLORS.taskIndigoBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: DS_COLORS.taskIndigo,
  },
  headerRight: {
    width: 36,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  promptCard: {
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: DS_COLORS.taskIndigo,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: DS_COLORS.taskIndigo,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  promptText: {
    fontSize: 17,
    fontWeight: "500" as const,
    color: DS_COLORS.textPrimary,
    lineHeight: 24,
  },
  typeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 14,
  },
  typeChip: {
    backgroundColor: DS_COLORS.taskIndigoAlpha,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: DS_COLORS.taskIndigo,
  },

  checkinSection: {
    marginBottom: 20,
  },
  checkinLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 10,
  },
  moodRow: {
    flexDirection: "row",
    gap: 8,
  },
  moodItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: DS_COLORS.white,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: DS_COLORS.textMuted,
    marginTop: 4,
  },

  energyRow: {
    flexDirection: "row",
    gap: 8,
  },
  energyItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: DS_COLORS.white,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  energyNumber: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: DS_COLORS.textMuted,
    marginTop: 4,
  },

  bodyRow: {
    flexDirection: "row",
    gap: 8,
  },
  bodyChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: DS_COLORS.white,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  bodyChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: DS_COLORS.textMuted,
  },

  entrySection: {
    marginBottom: 20,
  },
  entryLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: DS_COLORS.white,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: DS_COLORS.textPrimary,
    lineHeight: 22,
    minHeight: 160,
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  entryMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  wordCount: {
    fontSize: 12,
    color: DS_COLORS.textMuted,
  },
  wordCountWarn: {
    color: DS_COLORS.dangerMid,
  },
  wordCountNear: {
    color: DS_COLORS.taskAmber,
  },
  wordLimitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  limitReached: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: DS_COLORS.taskAmber,
    backgroundColor: DS_COLORS.taskAmberAlpha,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  charCount: {
    fontSize: 12,
    color: DS_COLORS.textMuted,
  },

  footerSafe: {
    backgroundColor: DS_COLORS.journalCardBg,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  photoProofPreview: {
    marginTop: 8,
    gap: 10,
  },
  photoProofThumb: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: DS_COLORS.photoThumbBg,
  },
  photoProofActions: {
    flexDirection: "row",
    gap: 12,
  },
  photoProofBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: DS_COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  photoProofBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
  },
  photoProofEmpty: {
    marginTop: 8,
    gap: 10,
  },
  photoProofPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: DS_COLORS.taskIndigo,
    borderRadius: 12,
    paddingVertical: 14,
  },
  photoProofPrimaryBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.white,
  },
  photoProofSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    backgroundColor: DS_COLORS.white,
  },
  photoProofSecondaryBtnText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
  },
  submitBtn: {
    backgroundColor: DS_COLORS.taskIndigo,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: DS_COLORS.taskIndigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  submitBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },

  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  successContent: {
    alignItems: "center",
    marginBottom: 40,
  },
  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: DS_COLORS.acceptGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: DS_COLORS.acceptGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: DS_COLORS.textSecondary,
    textAlign: "center" as const,
  },
  successActions: {
    width: "100%",
    gap: 12,
  },
  successPrimaryBtn: {
    backgroundColor: DS_COLORS.textPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  successPrimaryBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
});
