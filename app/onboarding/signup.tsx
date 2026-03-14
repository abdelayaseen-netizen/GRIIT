import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboardingStore";
import { PERSONAS, STARTER_CHALLENGES, INTENSITY_OPTIONS } from "@/constants/onboardingData";
import { supabase } from "@/lib/supabase";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_COLORS } from "@/lib/design-system";

const PADDING_H = 20;
const PROGRESS_FRACTION = 8 / 9;

function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function validateUsername(normalized: string): boolean {
  return normalized.length >= 3 && normalized.length <= 20;
}

export default function OnboardingSignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [fieldError, setFieldError] = useState<"email" | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const nameRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const motivation = useOnboardingStore((s) => s.motivation);
  const persona = useOnboardingStore((s) => s.persona);
  const barrier = useOnboardingStore((s) => s.barrier);
  const intensity = useOnboardingStore((s) => s.intensity);
  const socialStyle = useOnboardingStore((s) => s.socialStyle);
  const trainingTime = useOnboardingStore((s) => s.trainingTime);
  const selectedChallengeId = useOnboardingStore((s) => s.selectedChallengeId);
  const setCurrentStep = useOnboardingStore((s) => s.setCurrentStep);

  useEffect(() => {
    setCurrentStep(8);
  }, [setCurrentStep]);

  const personaLabel = PERSONAS.find((p) => p.id === persona);
  const challengeLabel = STARTER_CHALLENGES.find((c) => c.id === selectedChallengeId);
  const intensityLabel = INTENSITY_OPTIONS.find((i) => i.id === intensity);
  const summaryParts = [personaLabel?.icon, personaLabel?.label, challengeLabel?.label, intensityLabel?.label].filter(Boolean);
  const summaryLine = summaryParts.join(" · ");

  const normalizedUsername = normalizeUsername(username);
  const usernameValid = validateUsername(normalizedUsername);
  const emailValid = email.trim().includes("@") && email.trim().includes(".");
  const nameValid = name.trim().length > 0;
  const passwordValid = password.length >= 8;
  const canSubmit = emailValid && nameValid && usernameValid && passwordValid && !loading;

  const inputBorder = useCallback(
    (field: string) => {
      if (field === "email" && fieldError === "email") return DS_COLORS.errorText;
      if (field === "username" && usernameError) return DS_COLORS.errorText;
      return focusedField === field ? DS_COLORS.borderFocus : DS_COLORS.border;
    },
    [focusedField, fieldError, usernameError]
  );

  const handleUsernameBlur = useCallback(() => {
    if (username.trim().length === 0) {
      setUsernameError("");
      return;
    }
    if (!validateUsername(normalizedUsername)) {
      setUsernameError("Username must be 3-20 characters, lowercase, no spaces");
    } else {
      setUsernameError("");
    }
  }, [username, normalizedUsername]);

  const handleSignUp = useCallback(async (): Promise<void> => {
    if (loading) return;
    setLoading(true);
    setFormError("");
    setFieldError(null);
    setUsernameError("");

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!normalizedEmail || !trimmedName || !normalizedUsername || password.length < 8) {
      setFormError("Please fill in all fields correctly.");
      setLoading(false);
      return;
    }
    if (!validateUsername(normalizedUsername)) {
      setUsernameError("Username must be 3-20 characters.");
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            display_name: trimmedName,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("already registered")) {
          setFieldError("email");
          setFormError("Account already exists. Sign in instead.");
        } else {
          setFormError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError || !signInData?.session) {
        setFormError("Account created! Please sign in to continue.");
        router.replace("/auth/login" as never);
        setLoading(false);
        return;
      }

      const userId = signInData.user.id;

      await supabase.from("profiles").upsert(
        {
          user_id: userId,
          username: normalizedUsername,
          display_name: trimmedName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      try {
        await trpcMutate(TRPC.user.completeOnboarding, {
          motivation: motivation ?? undefined,
          persona: persona ?? undefined,
          barrier: barrier ?? undefined,
          intensity: intensity ?? undefined,
          socialStyle: socialStyle ?? undefined,
          trainingTime: trainingTime ?? undefined,
          selectedChallengeId: selectedChallengeId ?? undefined,
          displayName: trimmedName,
          username: normalizedUsername,
        });
      } catch (e) {
        console.warn("[AUTH] completeOnboarding tRPC failed:", e);
      }

      router.replace("/(tabs)" as never);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    email,
    name,
    password,
    normalizedUsername,
    motivation,
    persona,
    barrier,
    intensity,
    socialStyle,
    trainingTime,
    selectedChallengeId,
    router,
  ]);

  const handleApple = useCallback(async (): Promise<void> => {
    setFormError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "apple" });
      if (error) setFormError(error.message);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Sign in failed.");
    }
  }, []);

  const handleGoogle = useCallback(async (): Promise<void> => {
    setFormError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) setFormError(error.message);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Sign in failed.");
    }
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${PROGRESS_FRACTION * 100}%` }]} />
            </View>
            <Text style={styles.stepLabel}>8 of 9</Text>
          </View>

          <Text style={styles.title}>Save your progress</Text>
          <Text style={styles.subtitle}>You&apos;ve built your plan. Let&apos;s make it yours.</Text>

          {summaryLine ? (
            <View style={styles.summaryPill}>
              <Text style={styles.summaryText}>{summaryLine}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.btnApple}
            onPress={handleApple}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Apple"
          >
            <Text style={styles.btnAppleText}>Sign in with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnGoogle}
            onPress={handleGoogle}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
          >
            <Text style={styles.btnGoogleText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={[styles.input, { borderColor: inputBorder("email") }]}
            placeholder="Email"
            placeholderTextColor={DS_COLORS.textMuted}
            value={email}
            onChangeText={(t) => { setEmail(t); setFormError(""); setFieldError(null); }}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => nameRef.current?.focus()}
            editable={!loading}
            accessibilityLabel="Email"
          />

          <TextInput
            ref={nameRef}
            style={[styles.input, { borderColor: inputBorder("name") }]}
            placeholder="Full Name"
            placeholderTextColor={DS_COLORS.textMuted}
            value={name}
            onChangeText={(t) => { setName(t); setFormError(""); }}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => usernameRef.current?.focus()}
            editable={!loading}
            accessibilityLabel="Full Name"
          />

          <TextInput
            ref={usernameRef}
            style={[styles.input, { borderColor: inputBorder("username") }]}
            placeholder="Username (e.g. yaseen_griit)"
            placeholderTextColor={DS_COLORS.textMuted}
            value={username}
            onChangeText={(t) => { setUsername(t); setFormError(""); setUsernameError(""); }}
            onFocus={() => setFocusedField("username")}
            onBlur={handleUsernameBlur}
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!loading}
            accessibilityLabel="Username"
          />
          <Text style={styles.hint}>Letters, numbers, underscores only</Text>
          {usernameError ? <Text style={styles.inlineError} accessibilityLiveRegion="polite">{usernameError}</Text> : null}

          <View style={[styles.passwordWrap, { borderColor: inputBorder("password") }]}>
            <TextInput
              ref={passwordRef}
              style={styles.passwordInput}
              placeholder="Password (8+ characters)"
              placeholderTextColor={DS_COLORS.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); setFormError(""); }}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={() => canSubmit && handleSignUp()}
              editable={!loading}
              accessibilityLabel="Password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={22} color={DS_COLORS.textSecondary} />
              ) : (
                <Eye size={22} color={DS_COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {formError ? <Text style={styles.inlineError} accessibilityLiveRegion="polite">{formError}</Text> : null}

          <TouchableOpacity
            style={[styles.cta, !canSubmit && styles.ctaDisabled]}
            onPress={handleSignUp}
            disabled={!canSubmit}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Create account"
            accessibilityState={{ disabled: !canSubmit }}
          >
            {loading ? (
              <ActivityIndicator color={DS_COLORS.textPrimary} size="small" />
            ) : (
              <Text style={[styles.ctaText, !canSubmit && styles.ctaTextDisabled]}>Create account →</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: PADDING_H, paddingTop: 16, paddingBottom: 48 },
  progressWrap: { marginBottom: 8 },
  progressTrack: {
    height: 4,
    backgroundColor: DS_COLORS.border,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: DS_COLORS.accent,
    borderRadius: 999,
  },
  stepLabel: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: DS_COLORS.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS.textSecondary,
    marginBottom: 24,
  },
  summaryPill: {
    backgroundColor: DS_COLORS.card,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  summaryText: { fontSize: 13, color: DS_COLORS.textSecondary },
  divider: { height: 20 },
  btnApple: {
    height: 52,
    borderRadius: 14,
    backgroundColor: DS_COLORS.card,
    borderWidth: 1,
    borderColor: DS_COLORS.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  btnAppleText: { fontSize: 16, fontWeight: "600", color: DS_COLORS.textPrimary },
  btnGoogle: {
    height: 52,
    borderRadius: 14,
    backgroundColor: DS_COLORS.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  btnGoogleText: { fontSize: 16, fontWeight: "600", color: DS_COLORS.white },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: DS_COLORS.border },
  dividerText: { fontSize: 13, color: DS_COLORS.textSecondary, marginHorizontal: 12 },
  input: {
    backgroundColor: DS_COLORS.card,
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: DS_COLORS.textPrimary,
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: DS_COLORS.textMuted,
    marginTop: -4,
    marginBottom: 8,
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.card,
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: DS_COLORS.textPrimary,
    paddingVertical: 0,
  },
  inlineError: {
    fontSize: 13,
    color: DS_COLORS.errorText,
    marginBottom: 12,
  },
  cta: {
    height: 56,
    borderRadius: 28,
    backgroundColor: DS_COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  ctaDisabled: {
    backgroundColor: DS_COLORS.buttonDisabledBg,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  ctaTextDisabled: {
    color: DS_COLORS.buttonDisabledText,
  },
});
