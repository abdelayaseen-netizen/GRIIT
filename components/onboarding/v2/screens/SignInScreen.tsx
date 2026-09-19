import React, { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Apple, ChevronLeft, Mail } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import TextField from "@/components/ds/TextField";
import TextLink from "@/components/ds/TextLink";

const ICON = DS_V3.space.xs * 6;
const APPLE = DS_V3.space.gutter;

/**
 * Returning-user overlay on welcome. Not a progress step.
 * Completed accounts land on Home via AuthRedirector / flow completed effect.
 * Incomplete accounts stay in the flow (resume).
 */
export default function SignInScreen({
  onBack,
  onSuccess,
  initialEmail,
  startOnEmailForm,
}: {
  onBack: () => void;
  onSuccess: () => void;
  /** Prefill from Account "Sign in with that account". */
  initialEmail?: string;
  /** Account "Log in" opens the email form, not the method picker. */
  startOnEmailForm?: boolean;
}) {
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [emailMode, setEmailMode] = useState(
    Boolean(initialEmail?.trim()) || Boolean(startOnEmailForm)
  );
  const [email, setEmail] = useState(initialEmail?.trim() ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetHint, setResetHint] = useState("");

  useEffect(() => {
    if (Platform.OS === "ios") {
      void AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  const handleApple = useCallback(async () => {
    if (Platform.OS !== "ios" || !appleAvailable) {
      setError("Apple Sign-In is available on iOS. Use email for now.");
      setEmailMode(true);
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
      if (!data.session?.user?.id) {
        setError("Sign in failed. Please try again.");
        return;
      }
      track({ name: "login_completed", method: "apple" });
      onSuccess();
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "ERR_REQUEST_CANCELED") {
        return;
      }
      captureError(e, "OnboardingV2SignInApple");
      setError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }, [appleAvailable, onSuccess]);

  const handleEmail = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      if (!data.session?.user) {
        setError("Sign in failed. Please try again.");
        return;
      }
      track({ name: "login_completed", method: "email" });
      onSuccess();
    } catch (e) {
      captureError(e, "OnboardingV2SignInEmail");
      setError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }, [email, password, onSuccess]);

  const handleForgotPassword = useCallback(async () => {
    if (resetSent) return;
    const trimmed = email.trim();
    if (!trimmed) {
      setResetHint("Enter your email first.");
      return;
    }
    setResetHint("");
    try {
      // TODO: recovery link opens Supabase default page; in-app reset screen not built.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed);
      if (resetError) {
        setResetHint(resetError.message);
        return;
      }
      setResetSent(true);
    } catch (e) {
      captureError(e, "OnboardingV2ForgotPassword");
      setResetHint(e instanceof Error ? e.message : "Could not send a reset link.");
    }
  }, [email, resetSent]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed ? styles.pressed : null]}
        >
          <ChevronLeft size={ICON} color={DS_V3.color.textPrimary} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Text style={styles.h1}>Welcome back.</Text>
          <Text style={styles.sub}>
            Your streak, your circle and your challenges are exactly where you left them.
          </Text>
        </View>

        <View style={styles.body}>
          {Platform.OS === "ios" && appleAvailable ? (
            <Button
              variant="secondary"
              label="Sign in with Apple"
              onPress={handleApple}
              disabled={loading}
              icon={<Apple size={APPLE} color={DS_V3.color.textPrimary} fill={DS_V3.color.textPrimary} />}
            />
          ) : null}

          {!emailMode ? (
            <Button
              variant="secondary"
              label="Continue with email"
              onPress={() => setEmailMode(true)}
              disabled={loading}
              icon={<Mail size={APPLE} color={DS_V3.color.textPrimary} strokeWidth={2} />}
            />
          ) : (
            <View style={styles.emailForm}>
              <TextField
                label="Email"
                placeholder="Email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError("");
                  setResetHint("");
                  setResetSent(false);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Email address"
              />
              <TextField
                label="Password"
                placeholder="Password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError("");
                }}
                secureTextEntry
                accessibilityLabel="Password"
              />
              {resetSent ? (
                <Text style={styles.resetNote}>Check your email for a reset link.</Text>
              ) : (
                <TextLink
                  tone="secondary"
                  label="Forgot password?"
                  onPress={() => void handleForgotPassword()}
                />
              )}
              {resetHint ? <Text style={styles.resetHint}>{resetHint}</Text> : null}
              <Button
                label="Sign in"
                onPress={handleEmail}
                disabled={loading}
                loading={loading}
              />
            </View>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <TextLink label="I'm new here — create an account" onPress={onBack} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: DS_V3.color.canvas },
  nav: {
    height: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.sm,
    justifyContent: "center",
  },
  back: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.8 },
  content: {
    flexGrow: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.section,
  },
  head: { marginTop: DS_V3.space.xs },
  h1: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  sub: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
    marginTop: DS_V3.space.md,
  },
  body: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: DS_V3.space.lg,
    gap: DS_V3.space.md,
  },
  emailForm: { gap: DS_V3.space.md },
  error: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.danger,
    textAlign: "center",
  },
  resetNote: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  resetHint: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.danger,
    textAlign: "center",
  },
});
