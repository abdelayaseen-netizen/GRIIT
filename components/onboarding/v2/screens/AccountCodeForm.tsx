/**
 * Build 92 09.4 (P3-08, P3-09): one screen — Continue with Apple first, then email by a 6-digit
 * one-time code (no password field), then Not now. The code field is `oneTimeCode`, so iOS offers
 * the code in the keyboard bar and never over a field.
 */
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Apple } from "lucide-react-native";
import Button from "@/components/ds/Button";
import { DS_V3 } from "@/lib/design-system";
import { ACCOUNT_COPY, OTP_LENGTH, RESEND_SECONDS, resendLabel } from "@/lib/email-otp";
import { isCompleteEmail } from "@/lib/onboarding-v2-account-email";
import { TextLink } from "../OnboardingChrome";

const ICON = DS_V3.space.xs * 5;
const PT = DS_V3.space.xs / 4;

export default function AccountCodeForm({
  appleAvailable,
  busy,
  error,
  onApple,
  onSendCode,
  onVerify,
  onNotNow,
}: {
  appleAvailable: boolean;
  busy: boolean;
  error: string;
  onApple: () => void;
  onSendCode: (email: string) => Promise<boolean>;
  onVerify: (email: string, code: string) => void;
  onNotNow: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const startCountdown = () => {
    setLeft(RESEND_SECONDS);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1 && timer.current) clearInterval(timer.current);
        return Math.max(0, s - 1);
      });
    }, 1000);
  };

  const send = async () => {
    const trimmed = email.trim();
    if (!isCompleteEmail(trimmed) || busy) return;
    if (await onSendCode(trimmed)) {
      setSentTo(trimmed);
      setCode("");
      startCountdown();
    }
  };

  const onCode = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setCode(digits);
    if (digits.length === OTP_LENGTH && sentTo) onVerify(sentTo, digits);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={24}>
      <View style={styles.body}>
        {appleAvailable ? (
          <>
            <Button
              label={ACCOUNT_COPY.apple}
              icon={<Apple size={ICON} color={DS_V3.color.onBrand} />}
              onPress={onApple}
              disabled={busy}
              testID="account-apple"
            />
            <Text style={styles.or}>{ACCOUNT_COPY.or}</Text>
          </>
        ) : null}

        {sentTo == null ? (
          <>
            <Text style={styles.label}>{ACCOUNT_COPY.email}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={ACCOUNT_COPY.email}
              placeholderTextColor={DS_V3.color.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              accessibilityLabel={ACCOUNT_COPY.email}
              testID="account-email"
              returnKeyType="send"
              onSubmitEditing={() => void send()}
              style={styles.input}
            />
            <Button
              label={busy ? "" : ACCOUNT_COPY.sendCode}
              variant={appleAvailable ? "secondary" : "primary"}
              icon={busy ? <ActivityIndicator color={DS_V3.color.textPrimary} /> : undefined}
              disabled={busy || !isCompleteEmail(email)}
              onPress={() => void send()}
              testID="account-send-code"
            />
          </>
        ) : (
          <>
            <Text style={styles.sent}>{ACCOUNT_COPY.sent(sentTo)}</Text>
            <TextInput
              value={code}
              onChangeText={onCode}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              accessibilityLabel="6-digit code"
              testID="account-code"
              style={[styles.input, styles.code]}
            />
            {busy ? <ActivityIndicator color={DS_V3.color.textSecondary} /> : null}
            <View style={styles.row}>
              <TextLink
                label={ACCOUNT_COPY.different}
                onPress={() => {
                  setSentTo(null);
                  setCode("");
                }}
              />
              {left > 0 ? (
                <Text style={styles.resend}>{resendLabel(left)}</Text>
              ) : (
                <TextLink label={ACCOUNT_COPY.sendCode} onPress={() => void send()} />
              )}
            </View>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextLink label={ACCOUNT_COPY.notNow} onPress={onNotNow} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: { gap: DS_V3.space.sm },
  or: {
    textAlign: "center",
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  input: {
    minHeight: 52,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    paddingHorizontal: DS_V3.space.lg,
    fontSize: DS_V3.type.secondary.fontSize,
    color: DS_V3.color.textPrimary,
  },
  code: {
    minHeight: 56,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: "center",
  },
  sent: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resend: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
    paddingHorizontal: DS_V3.space.md,
  },
  error: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.danger,
    textAlign: "center",
  },
});
