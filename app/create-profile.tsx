import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
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
import { Screen, Input, PrimaryButton } from "@/src/components/ui";
import { H1, Body, Caption } from "@/src/components/Typography";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";

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
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert("Error", "Username can only contain letters, numbers, and underscores");
      return;
    }
    handleSubmit({
      username: sanitizeUsername(username.trim().toLowerCase()),
      display_name: sanitizeDisplayName(displayName.trim() || username.trim()),
      bio: sanitizeBio(bio.trim()),
    });
  };

  const validUsername = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  const validDisplayName = (displayName.trim() || username.trim()).length >= 2;
  const canContinue = validUsername && validDisplayName;

  const header = (
    <View style={styles.topRow}>
      <Caption style={styles.gritLogo}>GRIIT</Caption>
      <View style={styles.progressWrap}>
        <View style={styles.progressLine} />
        <Caption tone="subtle">1/5</Caption>
      </View>
    </View>
  );

  return (
    <Screen scroll keyboardAvoiding header={header}>
      <View style={styles.header}>
        <Caption style={styles.stepLabel}>GETTING STARTED</Caption>
        <H1 style={styles.title}>Claim your name.</H1>
        <Body tone="muted" style={styles.subtitle}>
          This is how others will know you.
        </Body>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Caption style={styles.label}>Username</Caption>
          <Input
            placeholder="your_username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isPending}
          />
          <Caption tone="subtle" style={styles.hint}>
            Letters, numbers, and underscores only
          </Caption>
        </View>

        <View style={styles.inputGroup}>
          <Caption style={styles.label}>Display Name</Caption>
          <Input
            placeholder="Your Name"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            editable={!isPending}
          />
        </View>

        <View style={styles.inputGroup}>
          <Caption style={styles.label}>Bio</Caption>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself..."
            placeholderTextColor={colors.textSubtle}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isPending}
          />
        </View>

        <PrimaryButton
          title="Continue"
          onPress={handleCreateProfile}
          variant="black"
          disabled={!canContinue || isPending}
          loading={isPending}
          style={styles.continueBtn}
          testID="create-profile-continue"
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
    marginBottom: spacing.xl,
  },
  gritLogo: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressLine: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  header: { paddingTop: spacing.lg, marginBottom: spacing.xxl - 4 },
  stepLabel: {
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  title: { marginBottom: spacing.sm },
  subtitle: { marginBottom: 0 },
  form: { width: "100%", paddingBottom: spacing.xxl },
  inputGroup: { marginBottom: spacing.xl },
  label: { marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    minHeight: 54,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  hint: { marginTop: spacing.xs },
  continueBtn: { marginTop: spacing.xl },
});
