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
import { mapAuthError } from "@/lib/auth-helpers";
import { AUTH_EMAIL_CONFIRM_REDIRECT } from "@/lib/auth-reset";
import {
  isRealNonAnonymousSession,
  surfaceAccountAuthKind,
  surfaceCaughtAuthError,
} from "@/lib/onboarding-v2-account-session";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { noteWrittenDeviceTimezone, writtenDeviceTimezone } from "@/lib/timezone-heal";
import { track } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { useOnboardingStore } from "@/store/onboardingStore";
import { accountSavedLines } from "@/lib/onboarding-v2-account-saved";
import { displayNameFromAccount } from "@/lib/account-display-name";
import { adoptExistingAccount } from "@/lib/adopt-existing-account";
import { CHECK_EMAIL_TO_SAVE } from "@/lib/email-save-pending";
import { useQuery } from "@tanstack/react-query";
import { trpcMutate } from "@/lib/trpc";
import { STARTER_TODAY_QUERY_KEY, loadStarterTodayRow } from "@/components/home/StarterTodayRow";
import { isMaestroTestEmail } from "@/lib/maestro-account";
import { TRPC } from "@/lib/trpc-paths";
import { ACCOUNT_PHONE_LINE, ACCOUNT_TITLE, accountInLine } from "@/lib/onboarding-v42-copy";
import { FLAGS } from "@/lib/feature-flags";
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
import AccountCodeForm from "./AccountCodeForm";
import { ACCOUNT_COPY, sendEmailCode, verifyEmailCode, type OtpAuth } from "@/lib/email-otp";

const otpAuth = supabase.auth as unknown as OtpAuth;

async function flagMaestroProfile(emailAddr?: string): Promise<void> {
  const email = (emailAddr ?? "").trim();
  if (!isMaestroTestEmail(email)) return;
  try {
    await trpcMutate(TRPC.profiles.claimMaestroTest, {});
    return;
  } catch {
    const { data } = await supabase.auth.getUser();
    const id = data.user?.id;
    if (!id) return;
    await supabase.from("profiles").update({ is_test: true }).eq("user_id", id);
  }
}

async function saveDerivedDisplayName(appleName?: string, emailAddr?: string): Promise<void> {
  const name = displayNameFromAccount({ appleName, email: emailAddr });
  const timezone = getDeviceIanaTimeZone();
  const tzAlready = writtenDeviceTimezone() === timezone;
  if (tzAlready && !name) return;
  try {
    await trpcMutate(TRPC.profiles.update, {
      ...(tzAlready ? {} : { timezone }),
      ...(name ? { display_name: name } : {}),
    });
    if (!tzAlready) noteWrittenDeviceTimezone(timezone);
  } catch (e) {
    captureError(e, "AccountDisplayName");
  }
}

const ICON = DS_V3.space.xs * 5;
const CHECK = DS_V3.space.lg;
const PT = DS_V3.space.xs / 4;
const PT_DANGER = PT * 1.5;

export default function AccountScreen({
  onAuthSuccess,
  onSkip,
  onSignInWithAccount,
  onBack,
}: {
  onAuthSuccess: (kind: AccountAuthKind) => void;
  onSkip: () => void;
  onSignInWithAccount: (email?: string) => void;
  onBack: () => void;
  /** Build 92 09.5: Not now is always offered; kept so existing callers still type-check. */
  alwaysOfferSkip?: boolean;
}) {
  const setProfileSetupHints = useOnboardingStore((s) => s.setProfileSetupHints);
  const challengeTitle = useOnboardingStore((s) => s.selectedChallengeTitle);
  const durationDays = useOnboardingStore((s) => s.selectedChallengeDurationDays);
  const targetStreak = useOnboardingStore((s) => s.targetStreak);
  const remindersEnabled = useOnboardingStore((s) => s.remindersEnabled);
  const reminderPreset = useOnboardingStore((s) => s.reminderPreset);
  const reminderCustom = useOnboardingStore((s) => s.reminderCustom);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [state, setState] = useState<AccountIdentityState>("default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const starterQuery = useQuery({
    queryKey: [...STARTER_TODAY_QUERY_KEY],
    queryFn: loadStarterTodayRow,
    enabled: FLAGS.STARTER_TASK_ENABLED,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const starterDone = starterQuery.data?.status === "done_now";
  /** Build 92 09.4: the guest whose email belongs to another account; the code signs into it and moves the guest. */
  const [adoptGuestId, setAdoptGuestId] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "ios") {
      void AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  const saved = accountSavedLines({
    challengeTitle,
    durationDays,
    targetStreak,
    remindersEnabled,
    reminderPreset: reminderPreset ?? "am6",
    reminderCustom: reminderCustom ?? null,
  });

  const handleApple = useCallback(async () => {
    if (Platform.OS !== "ios" || !appleAvailable) {
      setState("email_entry");
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
          const moved = await adoptExistingAccount({
            guestUserId: sessionUser.id,
            signIn: async () => {
              const { data, error: signError } = await supabase.auth.signInWithIdToken({
                provider: "apple",
                token: credential.identityToken!,
              });
              if (signError || !data.user || !data.session) {
                return { ok: false, message: signError ? mapAuthError(signError) : "Sign in failed. Please try again." };
              }
              return { ok: true };
            },
          });
          if (!moved.ok) {
            setError(moved.message);
            return;
          }
          track({ name: "signup_completed", method: "apple" });
          onAuthSuccess(classifyAccountAuth({ path: "signin_email" }));
          return;
        }
        const surface = surfaceAccountAuthKind(upgraded.kind, upgraded.message);
        if (
          upgraded.kind !== "ok" ||
          !isRealNonAnonymousSession(upgraded.user, upgraded.session)
        ) {
          if (surface.kind === "message") setError(surface.message);
          else if (upgraded.kind === "ok") setError("Sign in failed. Please try again.");
          return;
        }
        track({ name: "signup_completed", method: "apple" });
        track({ name: "account_created", method: "apple" });
        await saveDerivedDisplayName(displayNameFromApple, credential.email ?? undefined);
        onAuthSuccess(classifyAccountAuth({ path: "anon_upgrade_apple" }));
        return;
      }

      const { data, error: idError } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (idError) {
        setError(mapAuthError(idError));
        return;
      }
      if (!isRealNonAnonymousSession(data?.user, data?.session)) {
        setError("Sign in failed. Please try again.");
        return;
      }
      track({ name: "signup_completed", method: "apple" });
      track({ name: "account_created", method: "apple" });
      const appleKind = classifyAccountAuth({
        path: "apple_id_token",
        createdAt: data.user.created_at,
        lastSignInAt: data.user.last_sign_in_at,
      });
      await saveDerivedDisplayName(
        appleKind === "new_account" ? displayNameFromApple : undefined,
        appleKind === "new_account" ? credential.email ?? undefined : undefined,
      );
      onAuthSuccess(appleKind);
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "ERR_REQUEST_CANCELED") {
        return;
      }
      captureError(e, "OnboardingV2Apple");
      setError(surfaceCaughtAuthError(e));
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
        if (upgraded.kind === "confirm_email") {
          setState("awaiting_confirm");
          setError("");
          return;
        }
        if (upgraded.kind === "identity_taken") {
          const moved = await adoptExistingAccount({
            guestUserId: sessionUser.id,
            signIn: async () => {
              const { error: signError } = await supabase.auth.signInWithPassword({
                email: trimmed,
                password,
              });
              if (signError) return { ok: false, message: mapAuthError(signError) };
              return { ok: true };
            },
          });
          if (!moved.ok) {
            setError(moved.message);
            return;
          }
          track({ name: "signup_completed", method: "email" });
          onAuthSuccess(classifyAccountAuth({ path: "signin_email" }));
          return;
        }
        const surface = surfaceAccountAuthKind(upgraded.kind, upgraded.message);
        if (
          upgraded.kind !== "ok" ||
          !isRealNonAnonymousSession(upgraded.user, upgraded.session)
        ) {
          if (surface.kind === "message") setError(surface.message);
          else if (upgraded.kind === "ok") setError("Please try again or check your email.");
          return;
        }
        setProfileSetupHints({ email: trimmed });
        track({ name: "signup_completed", method: "email" });
        track({ name: "account_created", method: "email" });
        await saveDerivedDisplayName(undefined, trimmed);
        await flagMaestroProfile(trimmed);
        onAuthSuccess(classifyAccountAuth({ path: "anon_upgrade_email" }));
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: trimmed,
        password,
        options: { emailRedirectTo: AUTH_EMAIL_CONFIRM_REDIRECT },
      });
      if (signUpError) {
        const mapped = mapAuthError(signUpError);
        if (
          signUpError.message.includes("already registered") ||
          signUpError.message.includes("already been registered") ||
          signUpError.message.includes("User already registered")
        ) {
          setState("email_taken");
          return;
        }
        setError(mapped);
        return;
      }
      if (!isRealNonAnonymousSession(signUpData.session?.user, signUpData.session)) {
        setError("Please try again or check your email.");
        return;
      }
      setProfileSetupHints({ email: trimmed });
      track({ name: "signup_completed", method: "email" });
      track({ name: "account_created", method: "email" });
      await saveDerivedDisplayName(undefined, trimmed);
      await flagMaestroProfile(trimmed);
      onAuthSuccess(classifyAccountAuth({ path: "signup_email" }));
    } catch (e: unknown) {
      captureError(e, "OnboardingV2Email");
      setError(surfaceCaughtAuthError(e));
    } finally {
      setLoading(false);
    }
  }, [email, password, onAuthSuccess, setProfileSetupHints]);

  const sendCode = useCallback(async (address: string): Promise<boolean> => {
    setError("");
    setLoading(true);
    try {
      const { data: sessionSnap } = await supabase.auth.getSession();
      const sessionUser = sessionSnap.session?.user ?? null;
      const guest = isAnonymousUser(sessionUser);
      const sent = await sendEmailCode(otpAuth, { email: address, guest });
      if (sent.ok) {
        setAdoptGuestId(null);
        return true;
      }
      if (guest && sessionUser && /already|registered|exists/i.test(sent.message)) {
        const signIn = await sendEmailCode(otpAuth, { email: address, guest: false });
        if (signIn.ok) {
          setAdoptGuestId(sessionUser.id);
          return true;
        }
        setError(signIn.message);
        return false;
      }
      setError(sent.message);
      return false;
    } catch (e: unknown) {
      captureError(e, "OnboardingV2EmailCode");
      setError(surfaceCaughtAuthError(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyCode = useCallback(
    async (address: string, code: string) => {
      setError("");
      setLoading(true);
      try {
        if (adoptGuestId) {
          const moved = await adoptExistingAccount({
            guestUserId: adoptGuestId,
            signIn: async () => {
              const out = await verifyEmailCode(otpAuth, { email: address, code, guest: false });
              return out.ok ? { ok: true } : { ok: false, message: out.message };
            },
          });
          if (!moved.ok) {
            setError(moved.message);
            return;
          }
          track({ name: "signup_completed", method: "email" });
          onAuthSuccess(classifyAccountAuth({ path: "signin_email" }));
          return;
        }
        const { data: sessionSnap } = await supabase.auth.getSession();
        const guest = isAnonymousUser(sessionSnap.session?.user ?? null);
        const out = await verifyEmailCode(otpAuth, { email: address, code, guest });
        if (!out.ok) {
          setError(out.message);
          return;
        }
        setProfileSetupHints({ email: address });
        track({ name: "signup_completed", method: "email" });
        track({ name: "account_created", method: "email" });
        await saveDerivedDisplayName(undefined, address);
        await flagMaestroProfile(address);
        onAuthSuccess(classifyAccountAuth({ path: guest ? "anon_upgrade_email" : "signup_email" }));
      } catch (e: unknown) {
        captureError(e, "OnboardingV2EmailCode");
        setError(surfaceCaughtAuthError(e));
      } finally {
        setLoading(false);
      }
    },
    [adoptGuestId, onAuthSuccess, setProfileSetupHints],
  );

  const onEmailBlur = () => {
    if (state === "email_entry" || state === "malformed") {
      setState(isCompleteEmail(email) ? "email_entry" : email.trim() ? "malformed" : "email_entry");
    }
  };

  const accountTitle = FLAGS.EMAIL_OTP
    ? ACCOUNT_COPY.title
    : FLAGS.STARTER_TASK_ENABLED
      ? starterDone
        ? "Save your streak and your freeze."
        : "Save your challenge."
      : ACCOUNT_TITLE;
  const accountSubtitle = FLAGS.EMAIL_OTP
    ? ACCOUNT_COPY.subtitle
    : FLAGS.STARTER_TASK_ENABLED
      ? starterDone
        ? "Your first day is secured. Sign in so it’s still here tomorrow."
        : "Sign in so your challenge and today’s starter are kept."
      : accountInLine(challengeTitle);
  // Build 92 09.5: "Not now" is always there and keeps the guest's progress.
  const skip = <TextLink label={ACCOUNT_COPY.notNow} onPress={onSkip} />;
  const applePrimary = Platform.OS === "ios" && appleAvailable;
  const footer = FLAGS.EMAIL_OTP ? null : state === "default" ? (
      <>
        {applePrimary ? (
          <Button
            label="Continue with Apple"
            icon={<Apple size={ICON} color={DS_V3.color.onBrand} />}
            onPress={() => void handleApple()}
            disabled={loading}
          />
        ) : (
          <ChromePrimary label="Continue with email" onPress={() => setState("email_entry")} />
        )}
        {applePrimary ? (
          <Button
            label="Continue with email"
            variant="secondary"
            icon={<Mail size={ICON} color={DS_V3.color.textPrimary} />}
            onPress={() => setState("email_entry")}
            disabled={loading}
          />
        ) : null}
        {skip}
      </>
    ) : (
      skip
    );

  return (
    <OnboardingScreen
      step={6}
      onBack={onBack}
      title={accountTitle}
      subtitle={accountSubtitle}
      footer={footer}
    >
      <View style={styles.body}>
        {FLAGS.EMAIL_OTP ? (
          <AccountCodeForm
            appleAvailable={applePrimary}
            busy={loading}
            error={error}
            onApple={() => void handleApple()}
            onSendCode={sendCode}
            onVerify={(address, code) => void verifyCode(address, code)}
            onNotNow={onSkip}
          />
        ) : null}
        {!FLAGS.EMAIL_OTP && state === "default" ? (
          <View style={styles.auth}>
            <Text style={styles.phone}>{ACCOUNT_PHONE_LINE}</Text>
            <TextLink
              label="Have an account? Log in"
              tone={DS_V3.color.textPrimary}
              onPress={() => onSignInWithAccount()}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        ) : null}

        {!FLAGS.EMAIL_OTP && error && state !== "default" ? <Text style={styles.error}>{error}</Text> : null}

        {!FLAGS.EMAIL_OTP && (state === "email_entry" || state === "malformed") ? (
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

        {!FLAGS.EMAIL_OTP && state === "confirm_email" ? (
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

        {state === "awaiting_confirm" ? (
          <View style={styles.auth}>
            <Notice icon={<Info size={ICON} color={DS_V3.color.textPrimary} />}>{CHECK_EMAIL_TO_SAVE}</Notice>
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
              <Check size={CHECK} color={DS_V3.color.textPrimary} />
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
        testID={label === "Email" ? "account-email" : label === "Password" ? "account-password" : undefined}
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
  phone: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
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
  error: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.danger,
    textAlign: "center",
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
