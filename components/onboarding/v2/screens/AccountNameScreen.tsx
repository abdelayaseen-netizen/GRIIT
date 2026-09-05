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
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingStore } from "@/store/onboardingStore";
import { captureError } from "@/lib/sentry";
import {
  accountNameContinueDecision,
  accountNameSkipDecision,
  normalizeAccountUsername,
} from "@/lib/onboarding-v2-account-name";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
import { PrimaryButton, TextLink } from "../ui";

type UsernameStatus = "idle" | "checking" | "available" | "taken";

export default function AccountNameScreen({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  const { user } = useAuth();
  const hints = useOnboardingStore((s) => s.profileSetupHints);
  const setUsername = useOnboardingStore((s) => s.setUsername);
  const [displayName, setDisplayName] = useState(hints?.displayNameFromApple ?? "");
  const [username, setUsernameField] = useState("");
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const profile = (await trpcQuery(TRPC.profiles.get)) as {
          username?: string | null;
          display_name?: string | null;
        } | null;
        if (cancelled) return;
        if (profile?.username) {
          setUsernameField((prev) => prev || profile.username || "");
        }
        if (profile?.display_name) {
          setDisplayName((prev) => prev || profile.display_name || "");
        }
      } catch {
        /* prefills are best-effort */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const checkUsername = useCallback(
    async (raw: string) => {
      const norm = normalizeAccountUsername(raw);
      if (norm.length < 3) {
        setStatus("idle");
        return;
      }
      setStatus("checking");
      try {
        const result = (await trpcQuery(TRPC.profiles.getPublicByUsername, {
          username: norm,
        })) as { user_id?: string } | null;
        if (!result) {
          setStatus("available");
          return;
        }
        setStatus(result.user_id && result.user_id === user?.id ? "available" : "taken");
      } catch (e) {
        captureError(e, "OnboardingV2UsernameCheck");
        setStatus("idle");
      }
    },
    [user?.id]
  );

  const handleContinue = useCallback(async () => {
    const decision = accountNameContinueDecision({ displayName, username });
    if (!decision.persist) {
      setError("error" in decision ? decision.error : "Check your username.");
      return;
    }
    if (status === "taken") {
      setError("That username is taken.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await trpcMutate(TRPC.profiles.update, {
        display_name: decision.displayName || undefined,
        username: decision.username,
      });
      setUsername(decision.username);
      onContinue();
    } catch (e) {
      captureError(e, "OnboardingV2AccountName");
      setError(e instanceof Error ? e.message : "Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }, [displayName, username, status, setUsername, onContinue]);

  const handleSkip = useCallback(() => {
    accountNameSkipDecision();
    onSkip();
  }, [onSkip]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Text style={styles.h1}>What should we{"\n"}call you?</Text>
          <Text style={styles.sub}>A name for the feed. You can change this later.</Text>
        </View>

        {!loaded ? (
          <View style={styles.loading}>
            <ActivityIndicator color={OBV2_COLOR.orange} />
          </View>
        ) : (
          <View style={styles.body}>
            <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={OBV2_COLOR.ink3}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              accessibilityLabel="Display name"
            />
            <Text style={styles.fieldLabel}>USERNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor={OBV2_COLOR.ink3}
              value={username}
              onChangeText={(t) => {
                setUsernameField(t);
                setError("");
                setStatus("idle");
              }}
              onBlur={() => {
                void checkUsername(username);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Username"
            />
            {status === "taken" ? (
              <Text style={styles.error}>That username is taken.</Text>
            ) : status === "available" ? (
              <Text style={styles.ok}>Available</Text>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        )}

        <View style={styles.footer}>
          <PrimaryButton
            label={saving ? "Saving…" : "Continue"}
            onPress={() => {
              void handleContinue();
            }}
            disabled={saving || !loaded || status === "taken" || status === "checking"}
          />
          <TextLink label="Skip for now" onPress={handleSkip} />
        </View>
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
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  body: { flexGrow: 1, justifyContent: "center", gap: 10 },
  fieldLabel: { fontSize: 12, fontWeight: "500", letterSpacing: 0.8, color: OBV2_COLOR.ink },
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
  error: { fontSize: 13, color: OBV2_COLOR.orangeInk },
  ok: { fontSize: 13, color: OBV2_COLOR.ink2 },
  footer: { paddingTop: 14, gap: 2 },
});
