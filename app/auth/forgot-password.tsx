import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { DS_V3 } from "@/lib/design-system";
import { captureError } from "@/lib/sentry";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Button from "@/components/ds/Button";
import PushedHeader from "@/components/ds/PushedHeader";
import TextField from "@/components/ds/TextField";
import { useResendCountdown } from "@/lib/use-resend-countdown";

function ForgotPasswordScreenInner() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const isSubmittingRef = useRef<boolean>(false);
  const { secondsLeft, locked, start } = useResendCountdown();

  useEffect(() => {
    if (sent) start();
  }, [sent, start]);

  const sendReset = async (): Promise<boolean> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setFormError("Please enter your email address.");
      return false;
    }
    if (!trimmed.includes("@")) {
      setFormError("Please enter a valid email address.");
      return false;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: undefined,
    });
    if (error) {
      setFormError(error.message);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (loading || isSubmittingRef.current) return;
    setFormError("");
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      const ok = await sendReset();
      if (ok) setSent(true);
    } catch (e: unknown) {
      captureError(e, "AuthForgotPassword");
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResend = async () => {
    if (locked || loading || isSubmittingRef.current) return;
    setFormError("");
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      const ok = await sendReset();
      if (ok) start();
    } catch (e: unknown) {
      captureError(e, "AuthForgotPasswordResend");
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const goLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(ROUTES.AUTH_LOGIN as never);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <PushedHeader title="Reset password" onBack={goLogin} />
      {sent ? (
        <View style={styles.sent}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.body}>
            We sent a link to {email.trim()}. Use it to reset your password.
          </Text>
          <Button
            label="Back to Sign In"
            onPress={() => router.replace(ROUTES.AUTH_LOGIN as never)}
            accessibilityLabel="Back to sign in"
          />
          <Button
            label={locked ? `Resend in ${secondsLeft}s` : "Resend"}
            variant="secondary"
            disabled={locked}
            loading={loading}
            onPress={handleResend}
          />
          {formError ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {formError}
            </Text>
          ) : null}
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.subtitle}>
              Enter your email and we{"'"}ll send you a link to reset your password.
            </Text>
            <TextField
              label="Email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setFormError("");
              }}
              placeholder="your@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
              accessibilityLabel="Email address"
            />
            <Button
              label="Send reset link"
              loading={loading}
              onPress={handleSubmit}
              accessibilityLabel="Send password reset link"
            />
            {formError ? (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {formError}
              </Text>
            ) : null}
            <Button
              label="Back to Sign In"
              variant="tertiary"
              ink
              disabled={loading}
              onPress={goLogin}
              accessibilityLabel="Back to sign in without resetting"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

export default function ForgotPasswordScreen() {
  return (
    <ErrorBoundary>
      <ForgotPasswordScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    paddingBottom: DS_V3.space.section,
    gap: DS_V3.space.lg,
  },
  sent: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    gap: DS_V3.space.lg,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  subtitle: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  body: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  error: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.danger,
  },
});
