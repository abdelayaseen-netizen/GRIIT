import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingStore } from "@/store/onboardingStore";
import { PERSONAS, STARTER_CHALLENGES, INTENSITY_OPTIONS } from "@/constants/onboardingData";
import { supabase } from "@/lib/supabase";
import { trpcMutate } from "@/lib/trpc";
import { mapAuthError } from "@/lib/auth-helpers";

const ACCENT = "#E07B4A";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "#888884";
const INPUT_BG = "#1A1A1A";
const BORDER = "#333333";

export default function OnboardingSignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const persona = useOnboardingStore((s) => s.persona);
  const selectedChallengeId = useOnboardingStore((s) => s.selectedChallengeId);
  const intensity = useOnboardingStore((s) => s.intensity);
  const motivation = useOnboardingStore((s) => s.motivation);
  const barrier = useOnboardingStore((s) => s.barrier);
  const socialStyle = useOnboardingStore((s) => s.socialStyle);
  const trainingTime = useOnboardingStore((s) => s.trainingTime);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  useEffect(() => {
    setCurrentStep(8);
  }, [setCurrentStep]);

  const personaLabel = PERSONAS.find((p) => p.id === persona);
  const challengeLabel = STARTER_CHALLENGES.find((c) => c.id === selectedChallengeId);
  const intensityLabel = INTENSITY_OPTIONS.find((i) => i.id === intensity);

  const summaryLine = [personaLabel?.icon, personaLabel?.label, challengeLabel?.label, intensityLabel?.label]
    .filter(Boolean)
    .join(" · ");

  const handleApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "apple" });
      if (error) throw error;
    } catch (e) {
      Alert.alert("Sign in", mapAuthError(e as { message: string }));
    }
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) throw error;
    } catch (e) {
      Alert.alert("Sign in", mapAuthError(e as { message: string }));
    }
  };

  const handleCreateAccount = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    if (!trimmedEmail || !trimmedName || password.length < 8) {
      Alert.alert("Missing fields", "Enter email, name, and a password (8+ characters).");
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            display_name: trimmedName,
          },
        },
      });

      if (signUpError) {
        Alert.alert("Signup Failed", mapAuthError(signUpError));
        setLoading(false);
        return;
      }

      if (!data.session) {
        Alert.alert(
          "Check Your Email",
          `We sent a confirmation link to ${trimmedEmail}. Open it to activate your account, then return and log in.`,
          [{ text: "OK", onPress: () => router.replace("/onboarding/signup" as never) }]
        );
        setLoading(false);
        return;
      }

      await trpcMutate("user.completeOnboarding", {
        motivation: motivation ?? undefined,
        persona: persona ?? undefined,
        barrier: barrier ?? undefined,
        intensity: intensity ?? undefined,
        socialStyle: socialStyle ?? undefined,
        trainingTime: trainingTime ?? undefined,
        selectedChallengeId: selectedChallengeId ?? undefined,
        displayName: trimmedName,
      });

      router.replace("/onboarding/first-task" as never);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      step={8}
      totalSteps={9}
      showBack={true}
      showSkip={false}
      showProgressBar={true}
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Save your progress</Text>
          <Text style={styles.subtitle}>
            You&apos;ve built your plan. Let&apos;s make it yours.
          </Text>

          {summaryLine ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{summaryLine}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.socialBtn} onPress={handleApple} disabled={loading}>
            <Text style={styles.socialBtnText}>Sign in with Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtnAlt} onPress={handleGoogle} disabled={loading}>
            <Text style={styles.socialBtnTextAlt}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={TEXT_MUTED}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={TEXT_MUTED}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (8+ characters)"
            placeholderTextColor={TEXT_MUTED}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.cta, loading && styles.ctaDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#0A0A0A" size="small" />
            ) : (
              <Text style={styles.ctaText}>Create account →</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    lineHeight: 34,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    lineHeight: 24,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryText: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  socialBtn: {
    backgroundColor: TEXT_PRIMARY,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  socialBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  socialBtnAlt: {
    backgroundColor: "transparent",
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  socialBtnTextAlt: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  dividerText: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginHorizontal: 12,
  },
  input: {
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  cta: {
    backgroundColor: ACCENT,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0A0A0A",
  },
});
