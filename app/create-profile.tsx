import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { trpcMutate } from "@/lib/trpc";
import {
  getPendingChallengeId,
  getOnboardingAnswers,
  clearOnboardingAnswers,
  type OnboardingAnswers,
} from "@/lib/onboarding-pending";
import { sanitizeUsername, sanitizeDisplayName, sanitizeBio } from "@/lib/sanitize";
import { ROUTES } from "@/lib/routes";
import { Screen, Input, OnboardingCTA, GRIITWordmark, OnboardingProgress } from "@/src/components/ui";
import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING, DS_RADIUS, DS_MEASURES } from "@/lib/design-system";

export default function CreateProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [pendingChallengeId, setPendingChallengeId] = useState<string | null>(null);
  const [onboardingAnswers, setOnboardingAnswersState] = useState<OnboardingAnswers | null>(null);

  useEffect(() => {
    getPendingChallengeId().then(setPendingChallengeId).catch(() => {});
    getOnboardingAnswers().then(setOnboardingAnswersState).catch(() => {});
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.user_metadata) return;
      const meta = user.user_metadata as Record<string, unknown>;
      if (typeof meta.display_name === "string" && meta.display_name.trim() && !displayName) {
        setDisplayName(meta.display_name.trim());
      }
      if (typeof meta.username === "string" && meta.username.trim() && !username) {
        setUsername(meta.username.trim().replace(/^@+/, ""));
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (data: { username: string; display_name: string; bio: string }) => {
    setIsPending(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [{ text: "OK", onPress: () => router.replace(ROUTES.AUTH_LOGIN as never) }]
        );
        return;
      }
      const userId = sessionData.session.user.id;
      // If user came via onboarding-questions (pre-signup), persist those answers and mark onboarding_answers set
      const hasOnboardingPending = onboardingAnswers != null && Object.keys(onboardingAnswers).length > 0;
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            username: data.username,
            display_name: data.display_name,
            bio: data.bio,
            updated_at: new Date().toISOString(),
            onboarding_completed: hasOnboardingPending,
          },
          { onConflict: "user_id" }
        )
        .select()
        .maybeSingle();

      if (error) {
        const code = (error as { code?: string }).code;
        if (code === "23505") {
          Alert.alert("Error", "Username is already taken. Please choose another.");
          return;
        }
        Alert.alert("Error", error.message || "Failed to create profile");
        return;
      }

      if (hasOnboardingPending && onboardingAnswers) {
        await trpcMutate("profiles.update", {
          onboarding_completed: true,
          onboarding_answers: onboardingAnswers as Record<string, unknown>,
        });
      }

      if (pendingChallengeId) {
        try {
          await trpcMutate("challenges.join", { challengeId: pendingChallengeId });
        } catch {
          // Non-blocking; user can join from Discover again
        }
      }
      await clearOnboardingAnswers();
      router.replace(ROUTES.ONBOARDING as never);
    } catch (err: unknown) {
      Alert.alert("Error", (err as Error).message || "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username is required");
      return;
    }
    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      Alert.alert("Error", "Username can only contain letters, numbers, underscores, and periods");
      return;
    }
    handleSubmit({
      username: sanitizeUsername(username.trim().toLowerCase()),
      display_name: sanitizeDisplayName(displayName.trim() || username.trim()),
      bio: sanitizeBio(bio.trim()),
    });
  };

  const validUsername = username.length >= 3 && /^[a-zA-Z0-9_.]+$/.test(username);
  const validDisplayName = (displayName.trim() || username.trim()).length >= 2;
  const canContinue = validUsername && validDisplayName;

  const header = (
    <View style={styles.topRow}>
      <GRIITWordmark subtitle="" compact />
      <OnboardingProgress step={1} total={5} />
    </View>
  );

  return (
    <Screen scroll keyboardAvoiding header={header}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>CLAIM YOUR IDENTITY</Text>
        <Text style={styles.title}>Let&apos;s set up your profile.</Text>
        <Text style={styles.subtitle}>This is how others will know you.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <Input
            placeholder="your_username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isPending}
            containerStyle={styles.inputWrap}
          />
          <Text style={styles.hint}>Letters, numbers, and underscores only</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Display Name</Text>
          <Input
            placeholder="Your Name"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            editable={!isPending}
            containerStyle={styles.inputWrap}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself..."
            placeholderTextColor={DS_COLORS.inputPlaceholder}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isPending}
          />
        </View>

        <OnboardingCTA
          label="Continue"
          onPress={handleCreateProfile}
          variant="black"
          disabled={!canContinue || isPending}
          loading={isPending}
          style={styles.continueBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DS_SPACING.xxl,
  },
  header: { paddingTop: DS_SPACING.lg, marginBottom: DS_SPACING.xxl },
  stepLabel: {
    fontSize: DS_TYPOGRAPHY.eyebrow.fontSize,
    fontWeight: DS_TYPOGRAPHY.eyebrow.fontWeight,
    letterSpacing: DS_TYPOGRAPHY.eyebrow.letterSpacing,
    color: DS_COLORS.accent,
    marginBottom: DS_SPACING.sm,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.pageTitle.fontSize,
    fontWeight: DS_TYPOGRAPHY.pageTitle.fontWeight,
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.sm,
    letterSpacing: DS_TYPOGRAPHY.pageTitle.letterSpacing,
  },
  subtitle: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    color: DS_COLORS.textSecondary,
    marginBottom: DS_SPACING.xxl,
  },
  form: { width: "100%", paddingBottom: DS_SPACING.section },
  inputGroup: { marginBottom: DS_SPACING.xxl },
  label: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.inputLabelGap,
  },
  inputWrap: { minHeight: DS_MEASURES.inputHeight },
  input: {
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: DS_RADIUS.input,
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: DS_SPACING.md,
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    color: DS_COLORS.textPrimary,
    minHeight: DS_MEASURES.inputHeight,
  },
  textArea: {
    minHeight: 96,
    paddingTop: DS_SPACING.md,
  },
  hint: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: DS_SPACING.xs,
  },
  continueBtn: { marginTop: DS_SPACING.xxl },
});
