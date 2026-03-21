/**
 * Welcome — First-time user flow (pre-auth).
 * 4 steps: Welcome → Goals → Discipline level → Signup.
 * On signup success: save onboarding answers to profile, set onboarding_completed,
 * set griit_has_launched in AsyncStorage, navigate to Home.
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, Eye, EyeOff } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { trpcQuery } from "@/lib/trpc";
import { mapAuthError } from "@/lib/auth-helpers";
import { track, trackEvent } from "@/lib/analytics";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_SHADOWS, DS_BORDERS } from "@/lib/design-system";
import { GRIITWordmark } from "@/src/components/ui";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { InlineError } from "@/components/InlineError";
import { useInlineError } from "@/hooks/useInlineError";
const TOTAL_STEPS = 4;

const GOAL_OPTIONS: { id: string; label: string; emoji: string }[] = [
  { id: "fitness", label: "Fitness", emoji: "🏋️" },
  { id: "mental", label: "Mental clarity", emoji: "🧠" },
  { id: "learning", label: "Learning", emoji: "📚" },
  { id: "habits", label: "Break habits", emoji: "🔥" },
  { id: "morning", label: "Morning routine", emoji: "⏰" },
  { id: "consistency", label: "Consistency", emoji: "💪" },
];

const DISCIPLINE_OPTIONS: { id: string; label: string; subtitle: string; emoji: string }[] = [
  { id: "starting", label: "Just starting out", subtitle: "Building from zero", emoji: "🌱" },
  { id: "inconsistent", label: "Inconsistent", subtitle: "I try but can't stick with it", emoji: "🔄" },
  { id: "solid", label: "Pretty solid", subtitle: "I follow through most days", emoji: "💪" },
  { id: "relentless", label: "Relentless", subtitle: "I never miss", emoji: "🔥" },
];

function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  if (!password || password.length < 8) return "weak";
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const types = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (types >= 3) return "strong";
  if (types >= 2) return "medium";
  return "weak";
}

function isValidEmail(s: string): boolean {
  const t = s.trim();
  return t.includes("@") && t.includes(".") && t.length > 5;
}

type UsernameStatus = "idle" | "checking" | "available" | "taken";

export default function WelcomeScreen() {
  const router = useRouter();
  const { error, showError, clearError } = useInlineError();
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [disciplineLevel, setDisciplineLevel] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touched, setTouched] = useState({ displayName: false, username: false, email: false, password: false });
  const isSubmittingRef = useRef(false);

  const normalizedUsername = username.replace(/^@+/, "").trim().toLowerCase();
  const usernameValid = normalizedUsername.length >= 3 && /^[a-z0-9_.]+$/.test(normalizedUsername);
  const displayNameValid = displayName.trim().length >= 2;
  const emailValid = isValidEmail(email);
  const passwordValid = password.length >= 8;
  const canSubmit =
    displayNameValid &&
    usernameValid &&
    usernameStatus === "available" &&
    emailValid &&
    passwordValid &&
    !loading;

  const checkUsername = useCallback(async (value: string) => {
    const norm = value.replace(/^@+/, "").trim().toLowerCase();
    if (norm.length < 3 || !/^[a-z0-9_.]+$/.test(norm)) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    try {
      const result = await trpcQuery<{ user_id: string } | null>("profiles.getPublicByUsername", { username: norm });
      setUsernameStatus(result ? "taken" : "available");
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  const onboardingStartedRef = useRef(false);
  useEffect(() => {
    if (step === 1 && !onboardingStartedRef.current) {
      onboardingStartedRef.current = true;
      trackEvent("onboarding_started");
    }
  }, [step]);

  useEffect(() => {
    const t = setTimeout(() => checkUsername(username), 500);
    return () => clearTimeout(t);
  }, [username, checkUsername]);

  const toggleGoal = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoals((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const selectDiscipline = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDisciplineLevel(id);
  }, []);

  const goNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 2 && selectedGoals.length > 0) {
      trackEvent("onboarding_goal_selected", { goal: selectedGoals.join(",") });
    }
    if (step === 3 && disciplineLevel) {
      trackEvent("onboarding_discipline_selected", { level: disciplineLevel });
    }
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }, [step, selectedGoals, disciplineLevel]);

  const goBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const handleSkip = useCallback(() => {
    router.replace(ROUTES.AUTH_SIGNUP as never);
  }, [router]);

  const handleSignup = async () => {
    if (!canSubmit || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: displayName.trim(),
            display_name: displayName.trim(),
            username: normalizedUsername,
          },
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) {
        showError(mapAuthError(signUpError));
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      let session = data.session;
      if (!session && data.user) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) {
          setLoading(false);
          isSubmittingRef.current = false;
          showError(mapAuthError(signInError));
          return;
        }
        session = signInData.session;
      }

      if (!session) {
        setLoading(false);
        isSubmittingRef.current = false;
        showError("Please try again or check your email.");
        return;
      }

      const userId = data.user?.id ?? session.user?.id;
      if (!userId) {
        showError("Please try again.");
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      await supabase.from("profiles").upsert(
        {
          user_id: userId,
          username: normalizedUsername,
          display_name: displayName.trim(),
          updated_at: new Date().toISOString(),
          onboarding_completed: true,
          onboarding_answers: {
            goals: selectedGoals,
            discipline_level: disciplineLevel,
          },
        },
        { onConflict: "user_id" }
      );

      await AsyncStorage.setItem(STORAGE_KEYS.HAS_LAUNCHED, "true");
      track({ name: "signup_completed" });
      router.replace(ROUTES.TABS as never);
    } catch (err: unknown) {
      showError("Please try again.");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const strength = getPasswordStrength(password);
  const displayNameInvalid = displayName.trim().length > 0 && displayName.trim().length < 2;
  const usernameInvalid = (normalizedUsername.length > 0 && normalizedUsername.length < 3) || (normalizedUsername.length >= 3 && !/^[a-z0-9_.]+$/.test(normalizedUsername));
  const emailInvalid = email.trim().length > 0 && !isValidEmail(email);
  const passwordInvalid = password.length > 0 && password.length < 8;

  const getInputBorderColor = (field: keyof typeof touched, isValid: boolean) => {
    if (touched[field] && !isValid) return DS_COLORS.danger;
    if (focusedField === field) return DS_COLORS.accent;
    return DS_COLORS.border;
  };

  const progressDots = (
    <View style={s.progressRow}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[s.dot, i + 1 === step && s.dotActive]}
        />
      ))}
      <Text style={s.progressText}>{step} of {TOTAL_STEPS}</Text>
    </View>
  );

  if (step === 1) {
    return (
      <SafeAreaView style={s.screen} edges={["top", "bottom"]}>
        <TouchableOpacity style={s.skipBtn} onPress={handleSkip} accessibilityLabel="Skip" accessibilityRole="button">
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>
        <View style={s.step1Center}>
          <GRIITWordmark subtitle="Build discipline that lasts." compact />
          <Text style={s.heroSubtitle}>
            Commit to daily challenges. Prove yourself through action.
          </Text>
        </View>
        <View style={s.step1Bottom}>
          <TouchableOpacity style={s.primaryBtn} onPress={goNext} activeOpacity={0.85} accessibilityLabel="Let's go" accessibilityRole="button">
            <Text style={s.primaryBtnText}>Let&apos;s go</Text>
          </TouchableOpacity>
        </View>
        {progressDots}
      </SafeAreaView>
    );
  }

  if (step === 2) {
    return (
      <SafeAreaView style={s.screen} edges={["top", "bottom"]}>
        <TouchableOpacity style={s.backBtn} onPress={goBack} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.stepTitle}>What do you want to build?</Text>
        <Text style={s.stepSubtitle}>Pick as many as you like</Text>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.goalsGrid}
          showsVerticalScrollIndicator={false}
        >
          {GOAL_OPTIONS.map((g) => {
            const selected = selectedGoals.includes(g.id);
            return (
              <TouchableOpacity
                key={g.id}
                style={[s.goalCard, selected && s.goalCardSelected]}
                onPress={() => toggleGoal(g.id)}
                activeOpacity={0.8}
                accessibilityLabel={g.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                {selected && (
                  <View style={s.checkBadge}>
                    <Check size={14} color={DS_COLORS.accent} />
                  </View>
                )}
                <Text style={s.goalEmoji}>{g.emoji}</Text>
                <Text style={s.goalLabel}>{g.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity
          style={[s.primaryBtn, selectedGoals.length === 0 && s.btnDisabled]}
          onPress={goNext}
          disabled={selectedGoals.length === 0}
          activeOpacity={0.85}
          accessibilityLabel="Continue"
          accessibilityRole="button"
          accessibilityState={{ disabled: selectedGoals.length === 0 }}
        >
          <Text style={s.primaryBtnText}>Continue</Text>
        </TouchableOpacity>
        {progressDots}
      </SafeAreaView>
    );
  }

  if (step === 3) {
    return (
      <SafeAreaView style={s.screen} edges={["top", "bottom"]}>
        <TouchableOpacity style={s.backBtn} onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back">
          <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.stepTitle}>How disciplined are you right now?</Text>
        <Text style={s.stepSubtitle}>Be honest — there&apos;s no wrong answer</Text>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.disciplineList}
          showsVerticalScrollIndicator={false}
        >
          {DISCIPLINE_OPTIONS.map((d) => {
            const selected = disciplineLevel === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[s.disciplineRow, selected && s.disciplineRowSelected]}
                onPress={() => selectDiscipline(d.id)}
                activeOpacity={0.8}
                accessibilityLabel={d.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <View style={s.disciplineIconWrap}>
                  <Text style={s.disciplineEmoji}>{d.emoji}</Text>
                </View>
                <View style={s.disciplineTextWrap}>
                  <Text style={s.disciplineLabel}>{d.label}</Text>
                  <Text style={s.disciplineSubtitle}>{d.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity
          style={[s.primaryBtn, !disciplineLevel && s.btnDisabled]}
          onPress={goNext}
          disabled={!disciplineLevel}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Continue to next step"
          accessibilityState={{ disabled: !disciplineLevel }}
        >
          <Text style={s.primaryBtnText}>Continue</Text>
        </TouchableOpacity>
        {progressDots}
      </SafeAreaView>
    );
  }

  // Step 4 — Signup
  return (
    <SafeAreaView style={s.screen} edges={["top", "bottom"]}>
      <TouchableOpacity style={s.backBtn} onPress={goBack} accessibilityLabel="Go back" accessibilityRole="button">
        <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.keyboardView}
      >
        <ScrollView
          contentContainerStyle={s.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.stepTitle}>Lock in your commitment</Text>
          <Text style={s.stepSubtitle}>Create your GRIIT account to start your first challenge.</Text>

          <InlineError message={error} onDismiss={clearError} />

          <Text style={s.label}>Display Name</Text>
          <TextInput
            style={[s.input, { borderColor: getInputBorderColor("displayName", !displayNameInvalid) }]}
            placeholder="What should we call you?"
            placeholderTextColor={DS_COLORS.inputPlaceholder}
            value={displayName}
            onChangeText={setDisplayName}
            onFocus={() => setFocusedField("displayName")}
            onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, displayName: true })); }}
            editable={!loading}
            accessibilityLabel="Display name"
          />
          {touched.displayName && displayNameInvalid && (
            <Text style={s.inlineError}>Name must be at least 2 characters</Text>
          )}

          <Text style={s.label}>Username</Text>
          <TextInput
            style={[s.input, { borderColor: getInputBorderColor("username", !usernameInvalid && usernameStatus !== "taken") }]}
            placeholder="@username"
            placeholderTextColor={DS_COLORS.inputPlaceholder}
            value={username}
            onChangeText={(t) => setUsername(t.replace(/^@+/, ""))}
            onFocus={() => setFocusedField("username")}
            onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, username: true })); }}
            editable={!loading}
            accessibilityLabel="Username"
          />
          {username.length > 0 && (
            <View style={s.usernameHint}>
              {usernameStatus === "checking" && <ActivityIndicator size="small" color={DS_COLORS.textSecondary} />}
              {usernameStatus === "available" && <Text style={s.availableText}>✓ Available</Text>}
              {usernameStatus === "taken" && <Text style={s.takenText}>✗ Username taken</Text>}
            </View>
          )}

          <Text style={s.label}>Email</Text>
          <TextInput
            style={[s.input, { borderColor: getInputBorderColor("email", !emailInvalid) }]}
            placeholder="you@example.com"
            placeholderTextColor={DS_COLORS.inputPlaceholder}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedField("email")}
            onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, email: true })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            accessibilityLabel="Email"
          />
          {touched.email && emailInvalid && <Text style={s.inlineError}>Enter a valid email</Text>}

          <Text style={s.label}>Password</Text>
          <View style={[s.passwordRow, { borderColor: getInputBorderColor("password", !passwordInvalid) }]}>
            <TextInput
              style={s.passwordInput}
              placeholder="At least 8 characters"
              placeholderTextColor={DS_COLORS.inputPlaceholder}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, password: true })); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
              accessibilityLabel="Password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={22} color={DS_COLORS.textSecondary} /> : <Eye size={22} color={DS_COLORS.textSecondary} />}
            </TouchableOpacity>
          </View>
          {password.length > 0 && (
            <View style={s.strengthRow}>
              <View style={[s.strengthBar, strength !== "weak" && s.strengthInactive, { backgroundColor: DS_COLORS.danger }]} />
              <View style={[s.strengthBar, strength === "weak" && s.strengthInactive, { backgroundColor: DS_COLORS.warning }]} />
              <View style={[s.strengthBar, strength !== "strong" && s.strengthInactive, { backgroundColor: DS_COLORS.success }]} />
              <Text style={s.strengthLabel}>{strength === "weak" ? "Weak" : strength === "medium" ? "Medium" : "Strong"}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.primaryBtn, !canSubmit && s.btnDisabled]}
            onPress={handleSignup}
            disabled={!canSubmit}
            activeOpacity={0.85}
            accessibilityLabel="Create account"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
          >
            {loading ? <ActivityIndicator color={DS_COLORS.white} size="small" /> : <Text style={s.primaryBtnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.footer} onPress={() => router.replace(ROUTES.AUTH_LOGIN as never)} disabled={loading} accessibilityLabel="Already have an account? Log in" accessibilityRole="button" accessibilityState={{ disabled: loading }}>
            <Text style={s.footerText}>Already have an account? </Text>
            <Text style={s.footerLink}>Log in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      {progressDots}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  keyboardView: { flex: 1 },
  skipBtn: { position: "absolute", top: DS_SPACING.lg, right: DS_SPACING.xl, zIndex: 1 },
  skipText: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, color: DS_COLORS.textSecondary },
  backBtn: { position: "absolute", top: DS_SPACING.lg, left: DS_SPACING.lg, zIndex: 1 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING.sm,
    paddingVertical: DS_SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DS_COLORS.border,
  },
  dotActive: { backgroundColor: DS_COLORS.accent },
  progressText: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.textMuted },
  step1Center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.xxxl,
  },
  step1Bottom: { paddingHorizontal: DS_SPACING.xl, paddingBottom: DS_SPACING.xxl },
  heroSubtitle: {
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    marginTop: DS_SPACING.md,
    maxWidth: 280,
  },
  primaryBtn: {
    backgroundColor: DS_COLORS.accent,
    borderRadius: DS_RADIUS.buttonPill,
    paddingVertical: DS_SPACING.lg,
    alignItems: "center",
    ...DS_SHADOWS.button,
  },
  primaryBtnText: {
    color: DS_COLORS.white,
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700",
  },
  btnDisabled: { opacity: 0.4 },
  stepTitle: {
    fontSize: DS_TYPOGRAPHY.pageTitle.fontSize - 2,
    fontWeight: "800",
    color: DS_COLORS.textPrimary,
    marginTop: DS_SPACING.section,
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
  },
  stepSubtitle: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textSecondary,
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
    marginTop: DS_SPACING.sm,
    marginBottom: DS_SPACING.xxl,
  },
  scroll: { flex: 1 },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: DS_SPACING.screenHorizontalAlt,
    gap: DS_SPACING.lg,
    paddingBottom: DS_SPACING.xxl,
  },
  goalCard: {
    width: "47%",
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.lg,
    alignItems: "center",
    ...DS_SHADOWS.card,
  },
  goalCardSelected: {
    backgroundColor: DS_COLORS.accentSoft,
    borderWidth: DS_BORDERS.widthStrong,
    borderColor: DS_COLORS.accent,
  },
  checkBadge: {
    position: "absolute",
    top: DS_SPACING.sm,
    right: DS_SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: DS_COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  goalEmoji: { fontSize: 28, marginBottom: DS_SPACING.sm },
  goalLabel: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, fontWeight: "600", color: DS_COLORS.textPrimary },
  disciplineList: { paddingHorizontal: DS_SPACING.screenHorizontalAlt, gap: DS_SPACING.lg, paddingBottom: DS_SPACING.xxl },
  disciplineRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.xl,
    ...DS_SHADOWS.card,
  },
  disciplineRowSelected: {
    backgroundColor: DS_COLORS.accentSoft,
    borderLeftWidth: 4,
    borderLeftColor: DS_COLORS.accent,
  },
  disciplineIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DS_COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: DS_SPACING.lg,
  },
  disciplineEmoji: { fontSize: 22 },
  disciplineTextWrap: { flex: 1 },
  disciplineLabel: { fontSize: DS_TYPOGRAPHY.body.fontSize, fontWeight: "600", color: DS_COLORS.textPrimary },
  disciplineSubtitle: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, color: DS_COLORS.textSecondary, marginTop: 2 },
  formScroll: {
    paddingHorizontal: DS_SPACING.screenHorizontalAlt,
    paddingTop: 56,
    paddingBottom: DS_SPACING.section,
  },
  label: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, fontWeight: "600", color: DS_COLORS.textPrimary, marginBottom: DS_SPACING.sm, marginTop: DS_SPACING.lg },
  input: {
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1.5,
    borderRadius: DS_RADIUS.input,
    paddingHorizontal: DS_SPACING.xl,
    paddingVertical: DS_SPACING.lg,
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    color: DS_COLORS.textPrimary,
  },
  usernameHint: { flexDirection: "row", alignItems: "center", marginTop: 6, marginBottom: DS_SPACING.xs },
  availableText: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.success, fontWeight: "500" },
  takenText: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.danger, fontWeight: "500" },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1.5,
    borderRadius: DS_RADIUS.input,
    paddingHorizontal: DS_SPACING.xl,
    marginTop: 0,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: DS_SPACING.lg,
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    color: DS_COLORS.textPrimary,
  },
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: DS_SPACING.sm, marginBottom: DS_SPACING.sm },
  strengthBar: { width: 48, height: 4, borderRadius: 2 },
  strengthInactive: { opacity: 0.25 },
  strengthLabel: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.textSecondary, marginLeft: DS_SPACING.xs },
  inlineError: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.danger, marginTop: DS_SPACING.xs },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: DS_SPACING.xl },
  footerText: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, color: DS_COLORS.textSecondary },
  footerLink: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, fontWeight: "700", color: DS_COLORS.accent },
});
