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
import { useRouter } from "expo-router";
import { Apple, Mail } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import {
  isAnonymousUser,
  SIGN_IN_WITH_THAT_ACCOUNT,
  upgradeAnonymousWithApple,
  upgradeAnonymousWithEmail,
} from "@/lib/anon-auth";
import { writeDeviceTimezone } from "@/lib/write-device-timezone";
import { track } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { ROUTES } from "@/lib/routes";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  receiptChallengeLine,
  receiptGoalsLine,
  receiptReminderLine,
} from "@/lib/onboarding-v2-dayone";
import {
  classifyAccountAuth,
  type AccountAuthKind,
} from "@/lib/onboarding-v2-account-name";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
import { DarkButton, GhostButton, PrimaryButton, TextLink } from "../ui";

/**
 * Auth wiring:
 *   - Anonymous session already present → linkIdentity (Apple) / updateUser (email)
 *     so Day 1 uid is preserved. Never signInWithIdToken on that path.
 *   - No anon session → legacy signInWithIdToken / signUp (cold signup).
 * Apple + email only. Google is not offered.
 */
export default function AccountScreen({
  onAuthSuccess,
  onSkip,
  onSignInWithAccount,
}: {
  onAuthSuccess: (kind: AccountAuthKind) => void;
  onSkip: () => void;
  onSignInWithAccount: (email?: string) => void;
}) {
  const router = useRouter();
  const setProfileSetupHints = useOnboardingStore((s) => s.setProfileSetupHints);
  const challengeTitle = useOnboardingStore((s) => s.selectedChallengeTitle);
  const remindersEnabled = useOnboardingStore((s) => s.remindersEnabled);
  const reminderPreset = useOnboardingStore((s) => s.reminderPreset);
  const reminderCustom = useOnboardingStore((s) => s.reminderCustom);
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [identityTaken, setIdentityTaken] = useState(false);

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
    setIdentityTaken(false);
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

      const displayNameFromApple = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(" ").trim()
        : "";
      setProfileSetupHints({
        displayNameFromApple: displayNameFromApple || undefined,
        email: credential.email ?? undefined,
      });

      const { data: sessionSnap } = await supabase.auth.getSession();
      const sessionUser = sessionSnap.session?.user ?? null;

      if (isAnonymousUser(sessionUser)) {
        const upgraded = await upgradeAnonymousWithApple({
          identityToken: credential.identityToken,
        });
        if (upgraded.kind === "identity_taken") {
          setIdentityTaken(true);
          setError(upgraded.message ?? "Apple ID already linked to another account.");
          return;
        }
        if (upgraded.kind === "no_anon_session") {
          setError(upgraded.message ?? "Guest session was lost.");
          return;
        }
        if (upgraded.kind !== "ok" || !upgraded.user?.id) {
          setError(upgraded.message ?? "Could not link Apple ID.");
          return;
        }
        track({ name: "signup_completed", method: "apple" });
        track({ name: "account_created", method: "apple" });
        onAuthSuccess(classifyAccountAuth({ path: "anon_upgrade_apple" }));
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
      const next = data?.user;
      if (!next?.id) {
        setError("Sign in failed. Please try again.");
        return;
      }
      await writeDeviceTimezone();
      track({ name: "signup_completed", method: "apple" });
      track({ name: "account_created", method: "apple" });
      onAuthSuccess(
        classifyAccountAuth({
          path: "apple_id_token",
          createdAt: next.created_at,
          lastSignInAt: next.last_sign_in_at,
        })
      );
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "ERR_REQUEST_CANCELED") {
        return;
      }
      captureError(e, "OnboardingV2Apple");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [appleAvailable, onAuthSuccess, setProfileSetupHints]);

  const handleEmail = useCallback(async () => {
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
    setIdentityTaken(false);
    try {
      const { data: sessionSnap } = await supabase.auth.getSession();
      const sessionUser = sessionSnap.session?.user ?? null;

      if (isAnonymousUser(sessionUser)) {
        const upgraded = await upgradeAnonymousWithEmail({
          email: email.trim(),
          password,
        });
        if (upgraded.kind === "identity_taken") {
          setIdentityTaken(true);
          setError(upgraded.message ?? "Email already registered.");
          return;
        }
        if (upgraded.kind === "no_anon_session") {
          setError(upgraded.message ?? "Guest session was lost.");
          return;
        }
        if (upgraded.kind !== "ok" || !upgraded.user?.id) {
          setError(upgraded.message ?? "Could not attach email.");
          return;
        }
        setProfileSetupHints({ email: email.trim() });
        track({ name: "signup_completed", method: "email" });
        track({ name: "account_created", method: "email" });
        onAuthSuccess(classifyAccountAuth({ path: "anon_upgrade_email" }));
        return;
      }

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
            await writeDeviceTimezone();
            setProfileSetupHints({ email: email.trim() });
            track({ name: "signup_completed", method: "email" });
            track({ name: "account_created", method: "email" });
            onAuthSuccess(classifyAccountAuth({ path: "signin_email" }));
            return;
          }
        }
        setError(signUpError.message);
        return;
      }
      const createdUser = signUpData.session?.user ?? signUpData.user;
      if (createdUser) {
        await writeDeviceTimezone();
        setProfileSetupHints({ email: email.trim() });
        track({ name: "signup_completed", method: "email" });
        track({ name: "account_created", method: "email" });
        onAuthSuccess(classifyAccountAuth({ path: "signup_email" }));
        return;
      }
      setError("Sign up succeeded but could not create session. Try again.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [email, password, onAuthSuccess, setProfileSetupHints]);

  const receipt = [
    receiptChallengeLine(challengeTitle),
    receiptReminderLine(remindersEnabled, reminderPreset ?? "am6", reminderCustom ?? null),
    receiptGoalsLine(selectedGoals.length),
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.h1}>Save your progress</Text>
          <Text style={styles.sub}>So your streak and your circle follow you to any device.</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.buttons}>
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
                    setIdentityTaken(false);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Email address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min 6 characters)"
                  placeholderTextColor={OBV2_COLOR.ink3}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setError("");
                    setIdentityTaken(false);
                  }}
                  secureTextEntry
                  accessibilityLabel="Password"
                />
                <PrimaryButton
                  label={loading ? "" : "Create account"}
                  onPress={handleEmail}
                  disabled={loading}
                  icon={loading ? <ActivityIndicator color={OBV2_COLOR.onDark} /> : undefined}
                />
              </View>
            )}

            {error ? (
              identityTaken ? (
                <Text style={styles.error}>
                  {error.includes("email") ? "That email is already registered. " : "This Apple ID is already linked to another GRIIT account. "}
                  <Text
                    style={styles.errorLink}
                    onPress={() => onSignInWithAccount(email.trim() || undefined)}
                    accessibilityRole="link"
                    accessibilityLabel={SIGN_IN_WITH_THAT_ACCOUNT}
                  >
                    {SIGN_IN_WITH_THAT_ACCOUNT}
                  </Text>
                  {" — Day 1 on this guest session cannot be merged."}
                </Text>
              ) : (
                <Text style={styles.error}>{error}</Text>
              )
            ) : null}
          </View>

          <View style={styles.receipt}>
            <Text style={styles.receiptHead}>SAVED AND WAITING FOR YOU</Text>
            {receipt.map((line) => (
              <View key={line} style={styles.receiptRow}>
                <View style={styles.receiptDot} />
                <Text style={styles.receiptLine}>{line}</Text>
              </View>
            ))}
          </View>
        </View>

        <TextLink label="Skip — I'll risk losing my progress" onPress={onSkip} />
        <Text style={styles.terms}>
          By continuing you agree to GRIIT&apos;s{" "}
          <Text style={styles.termsLink} onPress={() => router.push(ROUTES.LEGAL_TERMS as never)}>
            Terms
          </Text>{" "}
          and{" "}
          <Text style={styles.termsLink} onPress={() => router.push(ROUTES.LEGAL_PRIVACY as never)}>
            Privacy Policy
          </Text>
          .
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 6, paddingBottom: 24 },
  head: { marginBottom: 16 },
  h1: { fontSize: 36, fontWeight: "500", lineHeight: 37, letterSpacing: -1.3, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 12 },
  body: { flexGrow: 1, justifyContent: "center", paddingVertical: 16, gap: 16 },
  buttons: { gap: 10 },
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
  error: { fontSize: 13, color: OBV2_COLOR.orangeInk, textAlign: "center", marginTop: 4 },
  errorLink: { fontSize: 13, color: OBV2_COLOR.orangeInk, textDecorationLine: "underline", fontWeight: "500" },
  receipt: {
    marginTop: 6,
    backgroundColor: OBV2_COLOR.sunken,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 7,
  },
  receiptHead: { fontSize: 12, fontWeight: "500", letterSpacing: 0.6, color: OBV2_COLOR.ink },
  receiptRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  receiptDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: OBV2_COLOR.orange },
  receiptLine: { fontSize: 13, fontWeight: "400", color: OBV2_COLOR.ink2, flex: 1 },
  terms: {
    fontSize: 13,
    color: OBV2_COLOR.ink3,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  termsLink: { color: OBV2_COLOR.ink2, textDecorationLine: "underline" },
});
