import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Apple, Check, CircleAlert, CircleHelp, Info, Mail } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import {
  isAnonymousUser,
  upgradeAnonymousWithApple,
  upgradeAnonymousWithEmail,
} from "@/lib/anon-auth";
import { writeDeviceTimezone } from "@/lib/write-device-timezone";
import { track } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { useOnboardingStore } from "@/store/onboardingStore";
import { accountSavedLines } from "@/lib/onboarding-v2-account-saved";
import {
  CONFIRM_EMAIL_NOTICE,
  EMAIL_TAKEN_NOTICE,
  EMAIL_TAKEN_PRIMARY,
  GUEST_PROGRESS_STAYS,
  MALFORMED_EMAIL,
  isCompleteEmail,
  type AccountIdentityState,
} from "@/lib/onboarding-v2-account-email";
import {
  classifyAccountAuth,
  type AccountAuthKind,
} from "@/lib/onboarding-v2-account-name";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import { ChromePrimary, OnboardingScreen, TextLink } from "../OnboardingChrome";

const ICON = DS_V3.space.xs * 5;
const CHECK = DS_V3.space.lg;
const PT = DS_V3.space.xs / 4;
const PT_DANGER = PT * 1.5;

export default function AccountScreen({
  onAuthSuccess,
  onSkip,
  onContinue,
  onSignInWithAccount,
  onBack,
}: {
  onAuthSuccess: (kind: AccountAuthKind) => void;
  onSkip: () => void;
  onContinue: () => void;
  onSignInWithAccount: (email?: string) => void;
  onBack: () => void;
}) {
  const setProfileSetupHints = useOnboardingStore((s) => s.setProfileSetupHints);
  const challengeTitle = useOnboardingStore((s) => s.selectedChallengeTitle);
  const targetStreak = useOnboardingStore((s) => s.targetStreak);
  const remindersEnabled = useOnboardingStore((s) => s.remindersEnabled);
  const reminderPreset = useOnboardingStore((s) => s.reminderPreset);
  const reminderCustom = useOnboardingStore((s) => s.reminderCustom);
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [state, setState] = useState<AccountIdentityState>("default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios") {
      void AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  const saved = accountSavedLines({
    challengeTitle,
    targetStreak,
    remindersEnabled,
    reminderPreset: reminderPreset ?? "am6",
    reminderCustom: reminderCustom ?? null,
    goals: selectedGoals,
  });

  const handleApple = useCallback(async () => {
    if (Platform.OS !== "ios" || !appleAvailable) {
      setState("email_entry");
      return;
    }
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) return;

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
          setEmail(credential.email ?? "");
          setState("email_taken");
          return;
        }
        if (upgraded.kind !== "ok" || !upgraded.user?.id) return;
        track({ name: "signup_completed", method: "apple" });
        track({ name: "account_created", method: "apple" });
        onAuthSuccess(classifyAccountAuth({ path: "anon_upgrade_apple" }));
        return;
      }

      const { data, error: idError } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (idError || !data?.user?.id) return;
      await writeDeviceTimezone();
      track({ name: "signup_completed", method: "apple" });
      track({ name: "account_created", method: "apple" });
      onAuthSuccess(
        classifyAccountAuth({
          path: "apple_id_token",
          createdAt: data.user.created_at,
          lastSignInAt: data.user.last_sign_in_at,
        })
      );
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "ERR_REQUEST_CANCELED") {
        return;
      }
      captureError(e, "OnboardingV2Apple");
    } finally {
      setLoading(false);
    }
  }, [appleAvailable, onAuthSuccess, setProfileSetupHints]);

  const sendEmail = useCallback(async () => {
    const trimmed = email.trim();
    if (!isCompleteEmail(trimmed) || password.length < 6) return;
    setLoading(true);
    try {
      const { data: sessionSnap } = await supabase.auth.getSession();
      const sessionUser = sessionSnap.session?.user ?? null;

      if (isAnonymousUser(sessionUser)) {
        const upgraded = await upgradeAnonymousWithEmail({
          email: trimmed,
          password,
        });
        if (upgraded.kind === "identity_taken") {
          setState("email_taken");
          return;
        }
        if (upgraded.kind !== "ok" || !upgraded.user?.id) return;
        setProfileSetupHints({ email: trimmed });
        track({ name: "signup_completed", method: "email" });
        track({ name: "account_created", method: "email" });
        onAuthSuccess(classifyAccountAuth({ path: "anon_upgrade_email" }));
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: trimmed,
        password,
      });
      if (signUpError) {
        if (
          signUpError.message.includes("already registered") ||
          signUpError.message.includes("already been registered") ||
          signUpError.message.includes("User already registered")
        ) {
          setState("email_taken");
          return;
        }
        return;
      }
      const createdUser = signUpData.session?.user ?? signUpData.user;
      if (createdUser) {
        await writeDeviceTimezone();
        setProfileSetupHints({ email: trimmed });
        track({ name: "signup_completed", method: "email" });
        track({ name: "account_created", method: "email" });
        onAuthSuccess(classifyAccountAuth({ path: "signup_email" }));
      }
    } catch (e: unknown) {
      captureError(e, "OnboardingV2Email");
    } finally {
      setLoading(false);
    }
  }, [email, password, onAuthSuccess, setProfileSetupHints]);

  const onEmailBlur = () => {
    if (state === "email_entry" || state === "malformed") {
      setState(isCompleteEmail(email) ? "email_entry" : email.trim() ? "malformed" : "email_entry");
    }
  };

  const skip = <TextLink label="Skip — I'll risk losing my progress" onPress={onSkip} />;
  const footer =
    state === "default" ? (
      <>
        <ChromePrimary label="Continue" onPress={onContinue} />
        {skip}
      </>
    ) : (
      skip
    );

  return (
    <OnboardingScreen
      step={6}
      onBack={onBack}
      title="Save your streak."
      subtitle="You are in already. An account is what makes your proof, streak and challenges survive this phone."
      footer={footer}
    >
      <View style={styles.body}>
        {state === "default" ? (
          <View style={styles.auth}>
            {Platform.OS === "ios" && appleAvailable ? (
              <Button
                label="Continue with Apple"
                variant="secondary"
                icon={<Apple size={ICON} color={DS_V3.color.textPrimary} />}
                onPress={() => void handleApple()}
                disabled={loading}
              />
            ) : null}
            <Button
              label="Continue with email"
              variant="secondary"
              icon={<Mail size={ICON} color={DS_V3.color.textPrimary} />}
              onPress={() => setState("email_entry")}
              disabled={loading}
            />
            <TextLink
              label="Have an account? Log in"
              tone={DS_V3.color.brandText}
              onPress={() => onSignInWithAccount()}
            />
          </View>
        ) : null}

        {state === "email_entry" || state === "malformed" ? (
          <View style={styles.auth}>
            <Field
              label="Email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (state === "malformed" && isCompleteEmail(t)) setState("email_entry");
              }}
              onBlur={onEmailBlur}
              error={state === "malformed"}
              keyboardType="email-address"
            />
            {state === "malformed" ? (
              <View style={styles.malformed}>
                <CircleAlert size={DS_V3.space.lg} color={DS_V3.color.danger} />
                <Text style={styles.danger}>{MALFORMED_EMAIL}</Text>
              </View>
            ) : (
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                secure
                placeholder="Password"
              />
            )}
            <ChromePrimary
              label="Continue"
              disabled={state === "malformed" || !isCompleteEmail(email)}
              onPress={() => {
                if (!isCompleteEmail(email)) {
                  setState("malformed");
                  return;
                }
                setState("confirm_email");
              }}
            />
          </View>
        ) : null}

        {state === "confirm_email" ? (
          <View style={styles.auth}>
            <Field label="Email" value={email} editable={false} />
            <Notice icon={<CircleHelp size={ICON} color={DS_V3.color.textPrimary} />}>
              {CONFIRM_EMAIL_NOTICE(email.trim())}
            </Notice>
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secure
              placeholder="Password"
            />
            <View style={styles.halfRow}>
              <View style={styles.half}>
                <Button label="Edit" variant="secondary" onPress={() => setState("email_entry")} />
              </View>
              <View style={styles.half}>
                <Button
                  label={loading ? "" : "Send it"}
                  disabled={loading || password.length < 6}
                  icon={loading ? <ActivityIndicator color={DS_V3.color.onBrand} /> : undefined}
                  onPress={() => void sendEmail()}
                />
              </View>
            </View>
          </View>
        ) : null}

        {state === "email_taken" ? (
          <View style={styles.auth}>
            <Field label="Email" value={email} editable={false} />
            <Notice icon={<Info size={ICON} color={DS_V3.color.textPrimary} />}>{EMAIL_TAKEN_NOTICE}</Notice>
            <Text style={styles.guest}>{GUEST_PROGRESS_STAYS}</Text>
            <ChromePrimary
              label={EMAIL_TAKEN_PRIMARY}
              onPress={() => onSignInWithAccount(email.trim() || undefined)}
            />
          </View>
        ) : null}

        <View style={styles.saved}>
          <Text style={styles.savedHead}>Saved and waiting for you</Text>
          {saved.map((line) => (
            <View key={line} style={styles.savedRow}>
              <Check size={CHECK} color={DS_V3.color.brandText} />
              <Text style={styles.savedLine}>{line}</Text>
            </View>
          ))}
        </View>
      </View>
    </OnboardingScreen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  editable = true,
  secure,
  keyboardType,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  onBlur?: () => void;
  error?: boolean;
  editable?: boolean;
  secure?: boolean;
  keyboardType?: "email-address";
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        editable={editable}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={placeholder ?? label}
        placeholderTextColor={DS_V3.color.textSecondary}
        accessibilityLabel={label}
        style={[styles.input, error && styles.inputError]}
      />
    </View>
  );
}

function Notice({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.notice}>
      {icon}
      <Text style={styles.noticeTxt}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  auth: { gap: DS_V3.space.sm },
  field: { gap: DS_V3.space.xs + 2 },
  fieldLabel: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  input: {
    minHeight: DS_V3.size.button,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    paddingHorizontal: DS_V3.space.lg,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  inputError: {
    borderWidth: PT_DANGER,
    borderColor: DS_V3.color.danger,
  },
  malformed: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.sm,
    minHeight: 18,
  },
  danger: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.danger,
  },
  notice: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.md,
  },
  noticeTxt: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  guest: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  halfRow: { flexDirection: "row", gap: DS_V3.space.sm },
  half: { flex: 1 },
  saved: {
    paddingTop: DS_V3.space.lg,
    gap: DS_V3.space.sm,
  },
  savedHead: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 24,
  },
  savedLine: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
