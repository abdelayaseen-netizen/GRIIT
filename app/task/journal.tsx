import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
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
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import type { MoodLevel, BodyState, JournalCategory } from "@/types";

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
  { value: "very_bad", label: "Awful", icon: Angry, color: "#EF4444" },
  { value: "bad", label: "Low", icon: Frown, color: "#F97316" },
  { value: "neutral", label: "Okay", icon: Meh, color: "#EAB308" },
  { value: "good", label: "Good", icon: Smile, color: "#22C55E" },
  { value: "very_good", label: "Great", icon: Laugh, color: "#10B981" },
];

const ENERGY_LEVELS = [1, 2, 3, 4, 5];

const BODY_STATE_OPTIONS: { value: BodyState; label: string; color: string }[] = [
  { value: "fresh", label: "Fresh", color: "#22C55E" },
  { value: "ok", label: "OK", color: "#EAB308" },
  { value: "sore", label: "Sore", color: "#F97316" },
  { value: "exhausted", label: "Exhausted", color: "#EF4444" },
];

const MIN_ENTRY_LENGTH = 20;
const MAX_ENTRY_LENGTH = 2000;
const DRAFT_KEY_PREFIX = "journal_draft_";

export default function JournalTaskScreen() {
  const router = useRouter();
  const { taskId, prompt, types, captureMood: captureMoodParam, captureEnergy: captureEnergyParam, captureBody, wordLimit: wordLimitParam } = useLocalSearchParams<{
    taskId: string;
    prompt: string;
    types: string;
    captureMood: string;
    captureEnergy: string;
    captureBody: string;
    wordLimit: string;
  }>();
  const { activeChallenge, completeTask } = useApp();

  const journalPrompt = prompt || "Write your thoughts...";
  const journalTypes: JournalCategory[] = types ? (JSON.parse(types) as JournalCategory[]) : [];
  const shouldCaptureMood = captureMoodParam !== "false";
  const shouldCaptureEnergy = captureEnergyParam !== "false";
  const shouldCaptureBody = captureBody === "true";
  const wordLimitWords = wordLimitParam ? parseInt(wordLimitParam, 10) : null;
  const hasWordLimit = wordLimitWords !== null && wordLimitWords > 0;

  const [entryText, setEntryText] = useState("");
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [bodyState, setBodyState] = useState<BodyState | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const draftTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          console.log("[Journal] Draft loaded:", draftKey);
        } catch (e) {
          console.log("[Journal] Failed to parse draft:", e);
        }
      }
      setDraftLoaded(true);
    });
  }, [draftKey, draftLoaded]);

  useEffect(() => {
    if (!draftLoaded) return;
    draftTimerRef.current = setInterval(() => {
      const draft = JSON.stringify({ entryText, mood, energy, bodyState });
      AsyncStorage.setItem(draftKey, draft).catch(() => {});
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
    return true;
  }, [entryText, mood, energy, bodyState, shouldCaptureMood, shouldCaptureEnergy, shouldCaptureBody, hasWordLimit, wordLimitWords, countWords]);

  const handleSubmit = async () => {
    if (!isValid()) {
      const issues: string[] = [];
      if (entryText.trim().length < MIN_ENTRY_LENGTH) issues.push(`Write at least ${MIN_ENTRY_LENGTH} characters`);
      if (shouldCaptureMood && mood === null) issues.push("Select your mood");
      if (shouldCaptureEnergy && energy === null) issues.push("Rate your energy");
      if (shouldCaptureBody && bodyState === null) issues.push("Select body state");
      Alert.alert("Almost there", issues.join("\n"));
      return;
    }

    if (!activeChallenge) {
      Alert.alert("Error", "No active challenge found");
      return;
    }
    if (!taskId) {
      Alert.alert("Error", "Task not found");
      return;
    }

    setLoading(true);
    try {
      completeTask({
        activeChallengeId: activeChallenge.id,
        taskId,
        noteText: entryText.trim(),
      });

      await AsyncStorage.removeItem(draftKey);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);

      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
        Animated.timing(confettiOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
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
              <Check size={32} color="#fff" />
            </View>
            <Text style={s.successTitle}>Journal saved</Text>
            <Text style={s.successSubtitle}>Your thoughts are recorded for today.</Text>
          </Animated.View>
          <Animated.View style={[s.successActions, { opacity: confettiOpacity }]}>
            <TouchableOpacity
              style={s.successPrimaryBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
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
                  Alert.alert("Save draft?", "Your entry will be saved as a draft.", [
                    { text: "Discard", style: "destructive", onPress: () => {
                      AsyncStorage.removeItem(draftKey);
                      router.back();
                    }},
                    { text: "Save & Exit", onPress: () => router.back() },
                  ]);
                } else {
                  router.back();
                }
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={22} color={Colors.text.primary} />
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <Text style={s.headerTitle}>Journal Entry</Text>
              <View style={s.headerTag}>
                <BookOpen size={10} color="#6366F1" />
                <Text style={s.headerTagText}>Journal</Text>
              </View>
            </View>
            <View style={s.headerRight} />
          </View>

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
                        >
                          <Icon size={22} color={isSelected ? opt.color : Colors.text.tertiary} />
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
                      const fillColor = level <= 2 ? "#EF4444" : level === 3 ? "#EAB308" : "#22C55E";
                      return (
                        <TouchableOpacity
                          key={level}
                          style={[s.energyItem, isSelected && { backgroundColor: `${fillColor}15`, borderColor: fillColor }]}
                          onPress={() => {
                            setEnergy(level);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          activeOpacity={0.7}
                        >
                          <Zap size={16} color={isSelected ? fillColor : Colors.text.tertiary} />
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
                  placeholderTextColor={Colors.text.tertiary}
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
            </ScrollView>

            <SafeAreaView edges={["bottom"]} style={s.footerSafe}>
              <View style={s.footer}>
                <TouchableOpacity
                  style={[s.submitBtn, !isValid() && s.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={loading || !isValid()}
                  activeOpacity={0.8}
                  testID="journal-submit-button"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={s.submitBtnInner}>
                      <Heart size={18} color="#fff" />
                      <Text style={s.submitBtnText}>Complete Journal</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F6",
  },
  flex: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
    backgroundColor: "#FAF8F6",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
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
    color: Colors.text.primary,
  },
  headerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6366F112",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#6366F1",
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#6366F1",
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  promptText: {
    fontSize: 17,
    fontWeight: "500" as const,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  typeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 14,
  },
  typeChip: {
    backgroundColor: "#6366F10D",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#6366F1",
  },

  checkinSection: {
    marginBottom: 20,
  },
  checkinLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
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
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
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
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  energyNumber: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.tertiary,
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
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  bodyChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
  },

  entrySection: {
    marginBottom: 20,
  },
  entryLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E6EF",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
    minHeight: 160,
    shadowColor: "#000",
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
    color: Colors.text.tertiary,
  },
  wordCountWarn: {
    color: "#DC2626",
  },
  wordCountNear: {
    color: "#F59E0B",
  },
  wordLimitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  limitReached: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#F59E0B",
    backgroundColor: "#F59E0B14",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  charCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },

  footerSafe: {
    backgroundColor: "#FAF8F6",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  submitBtn: {
    backgroundColor: "#6366F1",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
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
    color: "#fff",
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
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: "center" as const,
  },
  successActions: {
    width: "100%",
    gap: 12,
  },
  successPrimaryBtn: {
    backgroundColor: Colors.text.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  successPrimaryBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
  },
});
