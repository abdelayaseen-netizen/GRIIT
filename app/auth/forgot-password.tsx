import React, { useState, useRef } from "react";
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
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
import { captureError } from "@/lib/sentry";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function ForgotPasswordScreenInner() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const isSubmittingRef = useRef<boolean>(false);

  const handleSubmit = async () => {
    if (loading || isSubmittingRef.current) return;
    setFormError("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setFormError("Please enter your email address.");
      return;
    }
    if (!trimmed.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: undefined,
      });
      if (error) {
        setFormError(error.message);
        return;
      }
      setSent(true);
    } catch (e: unknown) {
      captureError(e, "AuthForgotPassword");
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={["top", "bottom"]}>
        <View style={styles.sentBlock}>
          <Text style={[styles.sentTitle, { color: themeColors.text.primary }]}>Check your email</Text>
          <Text style={[styles.sentBody, { color: themeColors.text.secondary }]}>
            We sent a link to {email.trim()}. Use it to reset your password.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.accent }]}
            onPress={() => router.replace(ROUTES.AUTH_LOGIN as never)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>Reset password</Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              Enter your email and we{"'"}ll send you a link to reset your password.
            </Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text.primary }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text.primary }]}
                placeholder="your@email.com"
                placeholderTextColor={themeColors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
                accessibilityLabel="Email address"
              />
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.accent }, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Send password reset link"
              accessibilityState={{ disabled: loading }}
            >
              {loading ? <ActivityIndicator color={DS_COLORS.white} /> : <Text style={styles.buttonText}>Send reset link</Text>}
            </TouchableOpacity>
            {formError ? (
              <Text style={styles.formError} accessibilityLiveRegion="polite">
                {formError}
              </Text>
            ) : null}
            <TouchableOpacity
              style={[styles.backLink, { borderColor: themeColors.border }]}
              onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Back to sign in without resetting"
            >
              <Text style={[styles.backLinkText, { color: themeColors.text.primary }]}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: { flex: 1, backgroundColor: DS_COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 24, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: "center", paddingHorizontal: 8 },
  form: { width: "100%" },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: DS_RADIUS.MD,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  button: {
    borderRadius: DS_RADIUS.MD,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  formError: {
    color: DS_COLORS.errorText,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  buttonText: { fontSize: 15, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.white },
  backLink: {
    borderWidth: 1,
    borderRadius: DS_RADIUS.MD,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  backLinkText: { fontSize: 15, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD },
  sentBlock: { paddingHorizontal: 24, alignItems: "center" },
  sentTitle: { fontSize: 22, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, marginBottom: 12 },
  sentBody: { fontSize: 15, textAlign: "center", marginBottom: 24 },
});
