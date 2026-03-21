import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { track, trackEvent } from "@/lib/analytics";
import { mapAuthError } from "@/lib/auth-helpers";
import { trpcQuery } from "@/lib/trpc";
import {
  DS_COLORS,
  DS_SPACING,
  DS_RADIUS,
  DS_TYPOGRAPHY,
  DS_BORDERS,
  DS_SHADOWS,
} from "@/lib/design-system";
import { GRIITWordmark } from "@/src/components/ui";
import { InlineError } from "@/components/InlineError";
import { useInlineError } from "@/hooks/useInlineError";

type UsernameStatus = "idle" | "checking" | "available" | "taken";

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

export default function SignupScreen() {
  const router = useRouter();
  const { error, showError, clearError } = useInlineError();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    displayName: false,
    username: false,
    email: false,
    password: false,
  });
  const isSubmittingRef = useRef(false);

  const displayNameRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    trackEvent("signup_started");
  }, []);

  const normalizedUsername = username.replace(/^@+/, "").trim().toLowerCase();
  const usernameValid =
    normalizedUsername.length >= 3 && /^[a-z0-9_.]+$/.test(normalizedUsername);
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
    if (norm.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    if (!/^[a-z0-9_.]+$/.test(norm)) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    try {
      const result = await trpcQuery<{ user_id: string } | null>(
        "profiles.getPublicByUsername",
        { username: norm }
      );
      setUsernameStatus(result ? "taken" : "available");
    } catch (err) {
      // error swallowed — handle in UI
      setUsernameStatus("idle");
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      checkUsername(username);
    }, 500);
    return () => clearTimeout(t);
  }, [username, checkUsername]);

  const handleUsernameChange = (text: string) => {
    setUsername(text.replace(/^@+/, ""));
  };

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
        const msg = mapAuthError(signUpError);
        showError(msg);
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
        setLoading(false);
        isSubmittingRef.current = false;
        showError("Please try again.");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            username: normalizedUsername,
            display_name: displayName.trim(),
            updated_at: new Date().toISOString(),
            onboarding_completed: true,
          },
          { onConflict: "user_id" }
        );

      if (profileError) {
        // error swallowed — handle in UI
      }

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
  const usernameInvalidLength = normalizedUsername.length > 0 && normalizedUsername.length < 3;
  const usernameInvalidChars = normalizedUsername.length >= 3 && !/^[a-z0-9_.]+$/.test(normalizedUsername);
  const usernameInvalid = usernameInvalidLength || usernameInvalidChars;
  const emailInvalid = email.trim().length > 0 && !/^\S+@\S+\.\S+$/.test(email.trim());
  const passwordInvalid = password.length > 0 && password.length < 8;

  const getInputBorderColor = (field: keyof typeof touched, isValid: boolean) => {
    if (touched[field] && !isValid) return DS_COLORS.danger;
    if (focusedField === field) return DS_COLORS.accent;
    return DS_COLORS.border;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <InlineError message={error} onDismiss={clearError} />
          <View style={styles.logoArea}>
            <GRIITWordmark subtitle="Build Discipline Daily" compact />
          </View>

          <Text style={styles.formTitle}>Create your account</Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: DS_COLORS.textPrimary }]}>Display Name</Text>
            <TextInput
              ref={displayNameRef}
              style={[
                styles.input,
                { borderColor: getInputBorderColor("displayName", !displayNameInvalid), backgroundColor: DS_COLORS.surface, color: DS_COLORS.textPrimary },
              ]}
              placeholder="What should we call you?"
              placeholderTextColor={DS_COLORS.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              onFocus={() => setFocusedField("displayName")}
              onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, displayName: true })); }}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => usernameRef.current?.focus()}
              editable={!loading}
              accessibilityLabel="Display name"
              accessibilityRole="text"
            />
            {touched.displayName && displayNameInvalid && (
              <Text style={styles.inlineError}>Name must be at least 2 characters</Text>
            )}

            <Text style={[styles.label, { color: DS_COLORS.textPrimary }]}>Username</Text>
            <TextInput
              ref={usernameRef}
              style={[
                styles.input,
                { borderColor: getInputBorderColor("username", !usernameInvalid && usernameStatus !== "taken"), backgroundColor: DS_COLORS.surface, color: DS_COLORS.textPrimary },
              ]}
              placeholder="@username"
              placeholderTextColor={DS_COLORS.textSecondary}
              value={username}
              onChangeText={handleUsernameChange}
              onFocus={() => setFocusedField("username")}
              onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, username: true })); }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              editable={!loading}
              accessibilityLabel="Username"
              accessibilityRole="text"
            />
            {username.length > 0 && (
              <View style={styles.usernameHint}>
                {usernameStatus === "checking" && (
                  <ActivityIndicator size="small" color={DS_COLORS.textSecondary} />
                )}
                {usernameStatus === "available" && (
                  <Text style={styles.availableText}>✓ Available</Text>
                )}
                {usernameStatus === "taken" && (
                  <Text style={styles.takenText}>✗ Username taken</Text>
                )}
              </View>
            )}
            {touched.username && usernameInvalidLength && (
              <Text style={styles.inlineError}>Username must be at least 3 characters</Text>
            )}
            {touched.username && usernameInvalidChars && !usernameInvalidLength && (
              <Text style={styles.inlineError}>Only lowercase letters, numbers, underscores, and periods</Text>
            )}

            <Text style={[styles.label, { color: DS_COLORS.textPrimary }]}>Email</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, { borderColor: getInputBorderColor("email", !emailInvalid), backgroundColor: DS_COLORS.surface, color: DS_COLORS.textPrimary }]}
              placeholder="you@example.com"
              placeholderTextColor={DS_COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, email: true })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
              accessibilityLabel="Email"
              accessibilityRole="text"
            />
            {touched.email && emailInvalid && (
              <Text style={styles.inlineError}>Enter a valid email address</Text>
            )}

            <Text style={[styles.label, { color: DS_COLORS.textPrimary }]}>Password</Text>
            <View style={[styles.passwordRow, { borderColor: getInputBorderColor("password", !passwordInvalid), backgroundColor: DS_COLORS.surface }]}>
              <TextInput
                ref={passwordRef}
                style={[styles.passwordInput, { color: DS_COLORS.textPrimary }]}
                placeholder="At least 8 characters"
                placeholderTextColor={DS_COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, password: true })); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={() => canSubmit && handleSignup()}
                editable={!loading}
                accessibilityLabel="Password"
                accessibilityRole="text"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                <View
                  style={[
                    styles.strengthBar,
                    styles.strengthWeak,
                    strength !== "weak" && styles.strengthBarInactive,
                  ]}
                />
                <View
                  style={[
                    styles.strengthBar,
                    styles.strengthMedium,
                    strength === "weak" && styles.strengthBarInactive,
                    strength === "strong" && styles.strengthBarInactive,
                  ]}
                />
                <View
                  style={[
                    styles.strengthBar,
                    styles.strengthStrong,
                    strength !== "strong" && styles.strengthBarInactive,
                  ]}
                />
                <Text style={[styles.strengthLabel, { color: DS_COLORS.textSecondary }]}>
                  {strength === "weak" && "Weak"}
                  {strength === "medium" && "Medium"}
                  {strength === "strong" && "Strong"}
                </Text>
              </View>
            )}
            {touched.password && passwordInvalid && (
              <Text style={styles.inlineError}>Password must be at least 8 characters</Text>
            )}

            <TouchableOpacity
              style={[styles.button, !canSubmit && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={!canSubmit}
              activeOpacity={0.8}
              testID="signup-button"
              accessibilityLabel="Create account"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
            >
              {loading ? (
                <ActivityIndicator color={DS_COLORS.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.replace(ROUTES.AUTH_LOGIN as never)}
                disabled={loading}
                accessibilityLabel="Log in"
                accessibilityRole="link"
                accessibilityState={{ disabled: loading }}
              >
                <Text style={styles.footerLink}>Log in</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginTop: 8 }}>
              <Text style={styles.termsText}>By creating an account you agree to our </Text>
              <TouchableOpacity
                onPress={() => router.push(ROUTES.LEGAL_TERMS as never)}
                accessibilityLabel="Terms of Service"
                accessibilityRole="link"
              >
                <Text style={[styles.termsText, styles.termsLink]}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> and </Text>
              <TouchableOpacity
                onPress={() => router.push(ROUTES.LEGAL_PRIVACY as never)}
                accessibilityLabel="Privacy Policy"
                accessibilityRole="link"
              >
                <Text style={[styles.termsText, styles.termsLink]}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}>.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingTop: DS_SPACING.xxl,
    paddingBottom: DS_SPACING.section,
  },
  logoArea: { alignItems: "center", marginBottom: DS_SPACING.xxxl },
  formTitle: {
    fontSize: DS_TYPOGRAPHY.pageTitle.fontSize,
    fontWeight: "800",
    color: DS_COLORS.textPrimary,
    marginTop: DS_SPACING.xxxl,
    marginBottom: DS_SPACING.xxl,
  },
  form: { width: "100%" },
  label: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "600",
    marginBottom: DS_SPACING.sm,
  },
  input: {
    borderWidth: DS_BORDERS.width,
    borderRadius: DS_RADIUS.input,
    paddingHorizontal: DS_SPACING.xl,
    paddingVertical: DS_SPACING.lg,
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.lg,
  },
  usernameHint: { flexDirection: "row", alignItems: "center", marginTop: -DS_SPACING.sm, marginBottom: DS_SPACING.sm },
  availableText: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.success, fontWeight: "500" },
  takenText: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.danger, fontWeight: "500" },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: DS_BORDERS.width,
    borderRadius: DS_RADIUS.input,
    paddingHorizontal: DS_SPACING.xl,
    marginBottom: DS_SPACING.sm,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: DS_SPACING.lg,
    fontSize: DS_TYPOGRAPHY.body.fontSize,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: DS_SPACING.lg,
  },
  strengthBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
  },
  strengthBarInactive: { opacity: 0.25 },
  strengthWeak: { backgroundColor: DS_COLORS.danger },
  strengthMedium: { backgroundColor: DS_COLORS.warning },
  strengthStrong: { backgroundColor: DS_COLORS.success },
  strengthLabel: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, marginLeft: DS_SPACING.xs },
  inlineError: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    color: DS_COLORS.danger,
    marginTop: DS_SPACING.xs,
    marginLeft: DS_SPACING.xs,
    marginBottom: DS_SPACING.xs,
  },
  button: {
    backgroundColor: DS_COLORS.accent,
    borderRadius: DS_RADIUS.buttonPill,
    paddingVertical: DS_SPACING.lg,
    alignItems: "center",
    marginTop: DS_SPACING.sm,
    ...DS_SHADOWS.button,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: DS_SPACING.lg,
  },
  footerText: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, color: DS_COLORS.textSecondary },
  footerLink: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, fontWeight: "600", color: DS_COLORS.accent },
  termsText: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    marginTop: DS_SPACING.xxl,
  },
  termsLink: { color: DS_COLORS.accent, fontWeight: "600" },
});
