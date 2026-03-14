import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingStore } from "@/store/onboardingStore";
import { PERSONAS, STARTER_CHALLENGES, INTENSITY_OPTIONS } from "@/constants/onboardingData";
import { supabase } from "@/lib/supabase";
import { trpcMutate } from "@/lib/trpc";
import { mapAuthError } from "@/lib/auth-helpers";
import { DS_COLORS } from "@/lib/design-system";

export default function OnboardingSignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

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

  const summaryLine = [personaLabel?.label, challengeLabel?.label, intensityLabel?.label]
    .filter(Boolean)
    .join(" · ");

  const handleApple = async () => {
    setFormError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "apple" });
      if (error) throw error;
    } catch (e) {
      setFormError(mapAuthError(e as { message: string }));
    }
  };

  const handleGoogle = async () => {
    setFormError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) throw error;
    } catch (e) {
      setFormError(mapAuthError(e as { message: string }));
    }
  };

  const handleCreateAccount = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    setFormError(null);
    if (!trimmedEmail || !trimmedName || password.length < 8) {
      setFormError("Enter email, name, and a password (8+ characters).");
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            display_name: trimmedName,
          },
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) {
        setFormError(mapAuthError(signUpError));
        setLoading(false);
        return;
      }

      let session = data.session;
      if (!session && data.user) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) {
          setFormError(mapAuthError(signInError));
          setLoading(false);
          return;
        }
        session = signInData.session;
      }

      if (!session) {
        setFormError("Unable to sign in. Try again or check your email.");
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
      setFormError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBorder = (key: string) =>
    focusedField === key ? DS_COLORS.accent : DS_COLORS.border;

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
            <View style={styles.summaryPill}>
              <Text style={styles.summaryText}>{summaryLine}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.socialBtnApple}
            onPress={handleApple}
            disabled={loading}
            accessibilityLabel="Sign in with Apple"
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.socialBtnAppleText}>Sign in with Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialBtnGoogle}
            onPress={handleGoogle}
            disabled={loading}
            accessibilityLabel="Sign in with Google"
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.socialBtnGoogleText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={[styles.input, { borderColor: inputBorder("email") }]}
            placeholder="Email"
            placeholderTextColor={DS_COLORS.textMuted}
            value={email}
            onChangeText={(t) => { setEmail(t); setFormError(null); }}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            accessibilityLabel="Email"
          />
          <TextInput
            style={[styles.input, { borderColor: inputBorder("name") }]}
            placeholder="Name"
            placeholderTextColor={DS_COLORS.textMuted}
            value={name}
            onChangeText={(t) => { setName(t); setFormError(null); }}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="words"
            editable={!loading}
            accessibilityLabel="Name"
          />
          <View style={[styles.passwordWrap, { borderColor: inputBorder("password") }]}>
            <TextInput
              ref={passwordRef}
              style={styles.passwordInput}
              placeholder="Password (8+ characters)"
              placeholderTextColor={DS_COLORS.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); setFormError(null); }}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
              accessibilityLabel="Password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
              hitSlop={12}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              accessibilityRole="button"
            >
              {showPassword ? (
                <EyeOff size={22} color={DS_COLORS.textSecondary} />
              ) : (
                <Eye size={22} color={DS_COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {formError ? (
            <Text style={styles.inlineError}>{formError}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.cta, loading && styles.ctaDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
            activeOpacity={0.9}
            accessibilityLabel="Create account"
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
          >
            {loading ? (
              <ActivityIndicator color={DS_COLORS.textPrimary} size="small" />
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
    color: DS_COLORS.textPrimary,
    lineHeight: 34,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  summaryPill: {
    backgroundColor: DS_COLORS.white,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
    lineHeight: 18,
  },
  socialBtnApple: {
    backgroundColor: DS_COLORS.white,
    borderWidth: 1,
    borderColor: DS_COLORS.textPrimary,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  socialBtnAppleText: {
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  socialBtnGoogle: {
    backgroundColor: DS_COLORS.textPrimary,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  socialBtnGoogleText: {
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.white,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DS_COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
    marginHorizontal: 12,
  },
  input: {
    backgroundColor: DS_COLORS.backgroundAlt,
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: DS_COLORS.textPrimary,
    marginBottom: 10,
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.backgroundAlt,
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: DS_COLORS.textPrimary,
    paddingVertical: 0,
  },
  inlineError: {
    fontSize: 14,
    color: DS_COLORS.danger,
    marginBottom: 12,
  },
  cta: {
    backgroundColor: DS_COLORS.accent,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  ctaDisabled: {
    opacity: 0.8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
});
