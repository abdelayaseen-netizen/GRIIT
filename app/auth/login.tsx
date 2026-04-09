import React, { useState, useRef, useCallback, useEffect } from "react";
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
import { Eye, EyeOff, ChevronLeft } from "lucide-react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "@/lib/supabase";
import { captureError } from "@/lib/sentry";
import { track } from "@/lib/analytics";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
import { ROUTES } from "@/lib/routes";
import FormInput from "@/components/shared/FormInput";

const PADDING_H = 20;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then(setAppleAuthAvailable);
    }
  }, []);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  const inputBorder = useCallback(
    (field: string) => (focusedField === field ? DS_COLORS.borderFocus : DS_COLORS.border),
    [focusedField]
  );

  const handleSignIn = useCallback(async (): Promise<void> => {
    if (loading) return;
    setLoading(true);
    setFormError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setFormError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setFormError(error.message);
        return;
      }
      if (!data.session) {
        setFormError("Sign in failed. Please try again.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, username, display_name")
        .eq("user_id", data.user.id)
        .single();

      if (profileError || !profile?.username) {
        try {
          track({ name: "login_completed", method: "email" });
        } catch {
          /* non-fatal */
        }
        router.replace(ROUTES.CREATE_PROFILE as never);
      } else {
        try {
          track({ name: "login_completed", method: "email" });
        } catch {
          /* non-fatal */
        }
        router.replace(ROUTES.TABS as never);
      }
    } catch (e) {
      captureError(e, { flow: "login_email" });
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [loading, email, password, router]);

  const handleForgotPassword = useCallback(() => {
    router.push(ROUTES.AUTH_FORGOT_PASSWORD as never);
  }, [router]);

  const handleApple = useCallback(async () => {
    setFormError("");
    setLoading(true);
    try {
      if (Platform.OS === "ios" && appleAuthAvailable) {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        if (!credential.identityToken) {
          setFormError("Apple Sign-In did not return a token.");
          return;
        }
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });
        if (error) {
          setFormError(error.message);
          return;
        }
        if (!data.session) {
          setFormError("Sign in failed. Please try again.");
          return;
        }
        const { data: profile } = await supabase.from("profiles").select("user_id, username").eq("user_id", data.user.id).single();
        if (!profile?.username) {
          try {
            track({ name: "login_completed", method: "apple" });
          } catch {
            /* non-fatal */
          }
          router.replace(ROUTES.CREATE_PROFILE as never);
        } else {
          try {
            track({ name: "login_completed", method: "apple" });
          } catch {
            /* non-fatal */
          }
          router.replace(ROUTES.TABS as never);
        }
      } else {
        const { error } = await supabase.auth.signInWithOAuth({ provider: "apple" });
        if (error) setFormError(error.message);
      }
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "ERR_REQUEST_CANCELED") {
        return;
      }
      captureError(e, { flow: "login_apple" });
      setFormError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }, [appleAuthAvailable, router]);

  const handleGoogle = useCallback(async () => {
    setFormError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) setFormError(error.message);
    } catch (e) {
      captureError(e, { flow: "login_google_oauth" });
      setFormError(e instanceof Error ? e.message : "Sign in failed.");
    }
  }, []);

  const handleSignUpLink = useCallback(() => {
    router.push(ROUTES.AUTH_SIGNUP as never);
  }, [router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(ROUTES.TABS_HOME as never);
    }
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={DS_COLORS.textPrimary} strokeWidth={2} />
          </TouchableOpacity>

          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.subtitle}>Sign in to continue building your streak.</Text>

          <View style={styles.gap32} />

          <FormInput
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setFormError("");
            }}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!loading}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            inputStyle={{ borderColor: inputBorder("email"), marginBottom: 12 }}
            containerStyle={{ marginBottom: 0 }}
            accessibilityLabel="Email address"
          />

          <View style={[styles.passwordWrap, { borderColor: inputBorder("password") }]}>
            <TextInput
              ref={passwordRef}
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={DS_COLORS.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); setFormError(""); }}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
              returnKeyType="go"
              onSubmitEditing={() => canSubmit && handleSignIn()}
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

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotLink}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Forgot password?"
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.gap16} />

          <TouchableOpacity
            style={[styles.cta, (!canSubmit || loading) && styles.ctaDisabled]}
            onPress={handleSignIn}
            disabled={!canSubmit || loading}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Log in to GRIIT"
            accessibilityState={{ disabled: !canSubmit || loading }}
          >
            {loading ? (
              <ActivityIndicator color={DS_COLORS.textPrimary} size="small" />
            ) : (
              <Text style={[styles.ctaText, (!canSubmit || loading) && styles.ctaTextDisabled]}>Sign in</Text>
            )}
          </TouchableOpacity>

          {formError ? (
            <Text style={styles.inlineError} accessibilityLiveRegion="polite">
              {formError}
            </Text>
          ) : null}

          <View style={styles.gap16} />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {Platform.OS === "ios" && appleAuthAvailable && (
            <TouchableOpacity
              style={styles.btnApple}
              onPress={handleApple}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Continue with Apple"
            >
              <Text style={styles.btnAppleText}>Sign in with Apple</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.btnGoogle}
            onPress={handleGoogle}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <Text style={styles.btnGoogleText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.gap24} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity
              onPress={handleSignUpLink}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Don't have an account — sign up instead"
            >
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: PADDING_H,
    paddingTop: 16,
    paddingBottom: 32,
  },
  backBtn: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD,
    color: DS_COLORS.textPrimary,
    marginTop: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS.textSecondary,
    marginBottom: 0,
  },
  gap32: { height: 32 },
  gap16: { height: 16 },
  gap24: { height: 24 },
  input: {
    backgroundColor: DS_COLORS.card,
    borderWidth: 1,
    borderRadius: DS_RADIUS.MD,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: DS_COLORS.textPrimary,
    marginBottom: 12,
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.card,
    borderWidth: 1,
    borderRadius: DS_RADIUS.MD,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: DS_COLORS.textPrimary,
    paddingVertical: 0,
  },
  forgotLink: { alignSelf: "flex-end", marginBottom: 8 },
  forgotText: { fontSize: 13, color: DS_COLORS.accent, fontWeight: "500" },
  cta: {
    height: 56,
    borderRadius: DS_RADIUS.joinCta,
    backgroundColor: DS_COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: {
    backgroundColor: DS_COLORS.buttonDisabledBg,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
  },
  ctaTextDisabled: {
    color: DS_COLORS.buttonDisabledText,
  },
  inlineError: {
    fontSize: 13,
    color: DS_COLORS.errorText,
    textAlign: "center",
    marginTop: 12,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: DS_COLORS.border },
  dividerText: { fontSize: 13, color: DS_COLORS.textSecondary, marginHorizontal: 12 },
  btnApple: {
    height: 52,
    borderRadius: DS_RADIUS.button,
    backgroundColor: DS_COLORS.card,
    borderWidth: 1,
    borderColor: DS_COLORS.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  btnAppleText: { fontSize: 16, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, color: DS_COLORS.textPrimary },
  btnGoogle: {
    height: 52,
    borderRadius: DS_RADIUS.button,
    backgroundColor: DS_COLORS.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGoogleText: { fontSize: 16, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, color: DS_COLORS.white },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { fontSize: 15, color: DS_COLORS.textSecondary },
  footerLink: { fontSize: 15, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, color: DS_COLORS.accent },
});
