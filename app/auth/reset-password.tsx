import React, { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { mapAuthError } from "@/lib/auth-helpers";
import {
  RESET_LINK_EXPIRED,
  RESET_LINK_INVALID,
  establishResetSession,
  parseResetRedirectUrl,
} from "@/lib/auth-reset";
import { validatePassword } from "@/lib/validation";
import { DS_V3 } from "@/lib/design-system";
import { captureError } from "@/lib/sentry";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Button from "@/components/ds/Button";
import PushedHeader from "@/components/ds/PushedHeader";
import TextField from "@/components/ds/TextField";

function ResetPasswordScreenInner() {
  const router = useRouter();
  const incomingUrl = Linking.useURL();
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const initial = incomingUrl ?? (await Linking.getInitialURL());
      const payload = parseResetRedirectUrl(initial);
      const result = await establishResetSession(payload);
      if (cancelled) return;
      if (!result.ok) {
        setExpired(result.expired);
        setLinkError(result.message || (payload.kind === "missing" ? RESET_LINK_INVALID : RESET_LINK_EXPIRED));
        setReady(true);
        return;
      }
      setExpired(false);
      setLinkError("");
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [incomingUrl]);

  const goForgot = useCallback(() => {
    router.replace(ROUTES.AUTH_FORGOT_PASSWORD as never);
  }, [router]);

  const goLogin = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.AUTH_LOGIN as never);
  }, [router]);

  const handleSave = useCallback(async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        const expiredWrite = error.message.toLowerCase().includes("expir");
        if (expiredWrite) {
          setExpired(true);
          setLinkError(RESET_LINK_EXPIRED);
          return;
        }
        setFormError(mapAuthError(error));
        return;
      }
      router.replace(ROUTES.TABS as never);
    } catch (e) {
      captureError(e, "AuthResetPassword");
      setFormError(e instanceof Error ? mapAuthError(e) : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }, [password, confirm, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <PushedHeader title="New password" onBack={goLogin} />
      {!ready ? (
        <View style={styles.sent}>
          <Text style={styles.subtitle}>Opening your reset link…</Text>
        </View>
      ) : expired || linkError ? (
        <View style={styles.sent}>
          <Text style={styles.title}>{expired ? "Link expired" : "Can't use this link"}</Text>
          <Text style={styles.subtitle}>{linkError || RESET_LINK_EXPIRED}</Text>
          <Button
            label="Send a new link"
            onPress={goForgot}
            accessibilityLabel="Send a new reset link"
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.subtitle}>Choose a new password for this account.</Text>
            <TextField
              label="New password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setFormError("");
              }}
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
              editable={!saving}
              accessibilityLabel="New password"
            />
            <TextField
              label="Confirm password"
              value={confirm}
              onChangeText={(t) => {
                setConfirm(t);
                setFormError("");
              }}
              placeholder="Repeat password"
              secureTextEntry
              autoCapitalize="none"
              editable={!saving}
              accessibilityLabel="Confirm password"
            />
            <Button
              label="Save password"
              loading={saving}
              onPress={() => void handleSave()}
              accessibilityLabel="Save new password"
            />
            {formError ? (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {formError}
              </Text>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

export default function ResetPasswordScreen() {
  return (
    <ErrorBoundary>
      <ResetPasswordScreenInner />
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
  error: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.danger,
  },
});
