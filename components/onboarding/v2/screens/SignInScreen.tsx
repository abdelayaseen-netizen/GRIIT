import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Apple, Mail } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
import { BackButton, DarkButton, GhostButton, PrimaryButton, TextLink } from "../ui";

/**
 * Returning-user overlay on welcome. Not a progress step.
 * Completed accounts land on Home via AuthRedirector / flow completed effect.
 * Incomplete accounts stay in the flow (resume).
 */
export default function SignInScreen({
  onBack,
  onSuccess,
  initialEmail,
}: {
  onBack: () => void;
  onSuccess: () => void;
  /** Prefill from Account "Sign in with that account". */
  initialEmail?: string;
}) {
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [emailMode, setEmailMode] = useState(Boolean(initialEmail?.trim()));
  const [email, setEmail] = useState(initialEmail?.trim() ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.nav}>
        <BackButton onPress={onBack} />
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
            <DarkButton
              label="Sign in with Apple"
              onPress={handleApple}
              disabled={loading}
              icon={<Apple size={19} color={OBV2_COLOR.onDark} fill={OBV2_COLOR.onDark} />}
            />
          ) : null}

          {!emailMode ? (
            <GhostButton
              label="Continue with email"
              onPress={() => setEmailMode(true)}
              disabled={loading}
              icon={<Mail size={18} color={OBV2_COLOR.ink} strokeWidth={2} />}
            />
          ) : (
            <View style={styles.emailForm}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={OBV2_COLOR.ink3}
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
                placeholder="Password"
                placeholderTextColor={OBV2_COLOR.ink3}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError("");
                }}
                secureTextEntry
                accessibilityLabel="Password"
              />
              <PrimaryButton
                label={loading ? "" : "Sign in"}
                onPress={handleEmail}
                disabled={loading}
                icon={loading ? <ActivityIndicator color={OBV2_COLOR.onDark} /> : undefined}
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
  flex: { flex: 1 },
  nav: { height: 48, paddingHorizontal: 20, justifyContent: "center" },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 24 },
  head: { marginTop: 6 },
  h1: { fontSize: 38, fontWeight: "500", lineHeight: 38, letterSpacing: -1.4, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 12 },
  body: { flexGrow: 1, justifyContent: "center", paddingVertical: 16, gap: 10 },
  emailForm: { gap: 12 },
  input: {
    minHeight: 56,
    backgroundColor: OBV2_COLOR.card,
    borderRadius: OBV2_RADIUS.button,
    paddingHorizontal: 16,
    fontSize: 15,
    color: OBV2_COLOR.ink,
    borderWidth: 2,
    borderColor: OBV2_COLOR.borderStrong,
  },
  error: { fontSize: 13, color: OBV2_COLOR.orangeInk, textAlign: "center" },
});
