import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { ONBOARDING_COLORS as C, ONBOARDING_SPACING as S } from "@/constants/onboarding-theme";
import { DS_MEASURES, DS_RADIUS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import { useOnboardingStore } from "@/store/onboardingStore";
import { captureError } from "@/lib/sentry";

interface SignUpScreenProps {
  onAuthSuccess: (userId: string) => void;
}

export default function SignUpScreen({ onAuthSuccess }: SignUpScreenProps) {
  const router = useRouter();
  const setProfileSetupHints = useOnboardingStore((s) => s.setProfileSetupHints);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios") {
      void AppleAuthentication.isAvailableAsync().then(setAppleAuthAvailable);
    }
  }, []);

  const handleEmailSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in email and password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        if (
          signUpError.message.includes("already registered") ||
          signUpError.message.includes("already been registered") ||
          signUpError.message.includes("User already registered")
        ) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (signInError) {
            setError("Account exists but wrong password. Try again.");
            return;
          }
          if (signInData.session?.user) {
            setProfileSetupHints({ email: email.trim() });
            track({ name: "signup_completed", method: "email" });
            onAuthSuccess(signInData.session.user.id);
            return;
          }
        }
        setError(signUpError.message);
        return;
      }

      if (signUpData.session?.user) {
        setProfileSetupHints({ email: email.trim() });
        track({ name: "signup_completed", method: "email" });
        onAuthSuccess(signUpData.session.user.id);
        return;
      }

      if (signUpData.user) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setProfileSetupHints({ email: email.trim() });
          onAuthSuccess(signUpData.user.id);
          return;
        }
        if (signInData.session?.user) {
          setProfileSetupHints({ email: email.trim() });
          track({ name: "signup_completed", method: "email" });
          onAuthSuccess(signInData.session.user.id);
          return;
        }
      }

      setError("Sign up succeeded but could not create session. Try again.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignUp = useCallback(async () => {
    if (Platform.OS !== "ios" || !appleAuthAvailable) {
      setError("Apple Sign-In is available on iOS. Use email for now.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        setError("Apple Sign-In did not return a token.");
        return;
      }
      const { data, error: idError } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (idError) {
        setError(idError.message);
        return;
      }
      const user = data?.user;
      if (!user?.id) {
        setError("Sign in failed. Please try again.");
        return;
      }
      const displayNameFromApple = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(" ").trim()
        : "";
      setProfileSetupHints({
        displayNameFromApple: displayNameFromApple || undefined,
        email: credential.email ?? undefined,
      });
      track({ name: "signup_completed", method: "apple" });
      onAuthSuccess(user.id);
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "ERR_REQUEST_CANCELED") {
        return;
      }
      captureError(e, "OnboardingSignUpApple");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [appleAuthAvailable, onAuthSuccess, setProfileSetupHints]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepLabel}>STEP 2 OF 4</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Save progress. Track streaks. Never lose a day.</Text>
        </View>

        <View style={styles.authContainer}>
          {Platform.OS === "ios" && appleAuthAvailable ? (
            <Pressable
              style={styles.appleButton}
              onPress={handleAppleSignUp}
              disabled={loading}
              accessibilityLabel="Continue with Apple"
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}
            >
              <Text style={styles.appleButtonText}>Continue with Apple</Text>
            </Pressable>
          ) : null}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or use email</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={C.textTertiary}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={C.textTertiary}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError("");
            }}
            secureTextEntry
            accessibilityLabel="Password"
          />

          <Pressable
            style={styles.primaryButton}
            onPress={handleEmailSignUp}
            disabled={loading}
            accessibilityLabel="Create your GRIIT account"
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
          >
            {loading ? <ActivityIndicator color={C.WHITE} /> : <Text style={styles.primaryButtonText}>Create account</Text>}
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginMuted}>Have an account? </Text>
            <Pressable
              onPress={() => router.push(ROUTES.AUTH_LOGIN as never)}
              accessibilityRole="link"
              accessibilityLabel="Already have an account — log in instead"
            >
              <Text style={styles.loginLink}>Log in</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.termsText}>
            By continuing, you agree to GRIIT&apos;s Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scroll: { paddingHorizontal: S.screenPadding, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 28 },
  stepLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 1, lineHeight: 16, color: C.accent, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, lineHeight: 34, color: C.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, fontWeight: "500", lineHeight: 24, color: C.textSecondary },
  authContainer: { gap: 12 },
  appleButton: {
    backgroundColor: C.black,
    height: 52,
    borderRadius: DS_RADIUS.button,
    justifyContent: "center",
    alignItems: "center",
  },
  appleButtonText: { fontSize: 17, fontWeight: "600", color: C.WHITE },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: C.border },
  dividerText: { fontSize: 13, color: C.textTertiary },
  input: {
    height: 52,
    backgroundColor: C.WHITE,
    borderRadius: DS_RADIUS.input,
    paddingHorizontal: 16,
    fontSize: 15,
    color: C.textPrimary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
  },
  primaryButton: {
    backgroundColor: C.darkCta,
    height: DS_MEASURES.CTA_HEIGHT,
    borderRadius: DS_RADIUS.button,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: { fontSize: 17, fontWeight: "700", lineHeight: 22, color: C.textOnAccent },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginTop: 8 },
  loginMuted: { fontSize: 15, color: C.textSecondary },
  loginLink: { fontSize: 15, fontWeight: "700", color: C.coral },
  errorText: { fontSize: 13, color: C.accent, textAlign: "center", marginTop: 8 },
  footer: { paddingTop: 24 },
  termsText: { fontSize: 11, color: C.textTertiary, textAlign: "center", lineHeight: 16 },
});
