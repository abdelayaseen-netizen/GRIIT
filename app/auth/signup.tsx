import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import { mapAuthError } from "@/lib/auth-helpers";
import { trpcQuery } from "@/lib/trpc";
import { GRIIT_COLORS, GRIIT_RADII } from "@/src/theme";

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
    } catch {
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
            display_name: displayName.trim(),
            username: normalizedUsername,
          },
        },
      });

      if (signUpError) {
        const msg = mapAuthError(signUpError);
        Alert.alert("Signup Failed", msg);
        return;
      }

      if (!data.session) {
        Alert.alert(
          "Check Your Email",
          `We sent a confirmation link to ${trimmedEmail}. Tap it to activate your account, then come back and log in.`,
          [{ text: "OK", onPress: () => router.replace(ROUTES.AUTH_LOGIN as never) }]
        );
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setLoading(false);
        isSubmittingRef.current = false;
        Alert.alert("Something went wrong", "Please try again.");
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
            onboarding_completed: false,
          },
          { onConflict: "user_id" }
        );

      if (profileError) {
        if (__DEV__) console.warn("Profile creation failed:", profileError);
      }

      track({ name: "signup_completed" });
      router.replace(ROUTES.ONBOARDING as never);
    } catch (err: unknown) {
      Alert.alert("Something went wrong", "Please try again.");
      if (__DEV__) console.error(err);
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
    if (touched[field] && !isValid) return GRIIT_COLORS.errorRed;
    if (focusedField === field) return GRIIT_COLORS.primaryAccent;
    return GRIIT_COLORS.borderLight;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: GRIIT_COLORS.background }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.logoArea}>
            <Text style={styles.logo} allowFontScaling={false}>
              G R I I T
            </Text>
            <Text style={styles.tagline}>Build Discipline Daily</Text>
          </View>

          <Text style={styles.formTitle}>Create your account</Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: GRIIT_COLORS.textPrimary }]}>Display Name</Text>
            <TextInput
              ref={displayNameRef}
              style={[
                styles.input,
                { borderColor: getInputBorderColor("displayName", !displayNameInvalid), backgroundColor: GRIIT_COLORS.cardBackground, color: GRIIT_COLORS.textPrimary },
              ]}
              placeholder="What should we call you?"
              placeholderTextColor={GRIIT_COLORS.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              onFocus={() => setFocusedField("displayName")}
              onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, displayName: true })); }}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => usernameRef.current?.focus()}
              editable={!loading}
            />
            {touched.displayName && displayNameInvalid && (
              <Text style={styles.inlineError}>Name must be at least 2 characters</Text>
            )}

            <Text style={[styles.label, { color: GRIIT_COLORS.textPrimary }]}>Username</Text>
            <TextInput
              ref={usernameRef}
              style={[
                styles.input,
                { borderColor: getInputBorderColor("username", !usernameInvalid && usernameStatus !== "taken"), backgroundColor: GRIIT_COLORS.cardBackground, color: GRIIT_COLORS.textPrimary },
              ]}
              placeholder="@username"
              placeholderTextColor={GRIIT_COLORS.textSecondary}
              value={username}
              onChangeText={handleUsernameChange}
              onFocus={() => setFocusedField("username")}
              onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, username: true })); }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              editable={!loading}
            />
            {username.length > 0 && (
              <View style={styles.usernameHint}>
                {usernameStatus === "checking" && (
                  <ActivityIndicator size="small" color={GRIIT_COLORS.textSecondary} />
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

            <Text style={[styles.label, { color: GRIIT_COLORS.textPrimary }]}>Email</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, { borderColor: getInputBorderColor("email", !emailInvalid), backgroundColor: GRIIT_COLORS.cardBackground, color: GRIIT_COLORS.textPrimary }]}
              placeholder="you@example.com"
              placeholderTextColor={GRIIT_COLORS.textSecondary}
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
            />
            {touched.email && emailInvalid && (
              <Text style={styles.inlineError}>Enter a valid email address</Text>
            )}

            <Text style={[styles.label, { color: GRIIT_COLORS.textPrimary }]}>Password</Text>
            <View style={[styles.passwordRow, { borderColor: getInputBorderColor("password", !passwordInvalid), backgroundColor: GRIIT_COLORS.cardBackground }]}>
              <TextInput
                ref={passwordRef}
                style={[styles.passwordInput, { color: GRIIT_COLORS.textPrimary }]}
                placeholder="At least 8 characters"
                placeholderTextColor={GRIIT_COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => { setFocusedField(null); setTouched((p) => ({ ...p, password: true })); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={() => canSubmit && handleSignup()}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                {showPassword ? (
                  <EyeOff size={22} color={GRIIT_COLORS.textSecondary} />
                ) : (
                  <Eye size={22} color={GRIIT_COLORS.textSecondary} />
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
                <Text style={[styles.strengthLabel, { color: GRIIT_COLORS.textSecondary }]}>
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
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.replace(ROUTES.AUTH_LOGIN as never)}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Log in</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By creating an account, you agree to our Terms and Privacy Policy
            </Text>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  logoArea: { alignItems: "center", marginBottom: 32 },
  logo: {
    fontSize: 32,
    fontWeight: "700",
    color: GRIIT_COLORS.textPrimary,
    letterSpacing: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : undefined,
  },
  tagline: {
    fontSize: 14,
    color: GRIIT_COLORS.textSecondary,
    marginTop: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: GRIIT_COLORS.textPrimary,
    marginTop: 32,
    marginBottom: 24,
  },
  form: { width: "100%" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: GRIIT_RADII.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  usernameHint: { flexDirection: "row", alignItems: "center", marginTop: -8, marginBottom: 8 },
  availableText: { fontSize: 12, color: GRIIT_COLORS.secondaryGreen, fontWeight: "500" },
  takenText: { fontSize: 12, color: GRIIT_COLORS.errorRed, fontWeight: "500" },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: GRIIT_RADII.card,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  strengthBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
  },
  strengthBarInactive: { opacity: 0.25 },
  strengthWeak: { backgroundColor: GRIIT_COLORS.errorRed },
  strengthMedium: { backgroundColor: GRIIT_COLORS.warningAmber },
  strengthStrong: { backgroundColor: GRIIT_COLORS.secondaryGreen },
  strengthLabel: { fontSize: 12, marginLeft: 4 },
  inlineError: {
    fontSize: 12,
    color: GRIIT_COLORS.errorRed,
    marginTop: 4,
    marginLeft: 4,
    marginBottom: 4,
  },
  button: {
    backgroundColor: GRIIT_COLORS.primaryAccent,
    borderRadius: GRIIT_RADII.buttonPill,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: { fontSize: 14, color: GRIIT_COLORS.textSecondary },
  footerLink: { fontSize: 14, fontWeight: "600", color: GRIIT_COLORS.primaryAccent },
  termsText: {
    fontSize: 12,
    color: GRIIT_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 24,
  },
});
