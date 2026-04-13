import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { getCalendars } from "expo-localization";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
import { trackEvent } from "@/lib/analytics";
import FormInput from "@/components/shared/FormInput";
import { captureError } from "@/lib/sentry";
import { ROUTES } from "@/lib/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const PADDING_H = 20;

function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function validateUsername(normalized: string): boolean {
  return normalized.length >= 3 && normalized.length <= 20;
}

function CreateProfileScreenInner() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const displayNameRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);

  const normalizedUsername = normalizeUsername(username);
  const usernameValid = validateUsername(normalizedUsername);
  const displayNameValid = displayName.trim().length > 0;
  const canContinue = usernameValid && displayNameValid && !saving;

  const inputBorder = useCallback(
    (field: string) => {
      if (field === "username" && usernameError) return DS_COLORS.errorText;
      return focusedField === field ? DS_COLORS.borderFocus : DS_COLORS.border;
    },
    [focusedField, usernameError]
  );

  useEffect(() => {
    let cancelled = false;
    const checkProfile = async (): Promise<void> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled || !user) {
          if (!user) router.replace(ROUTES.AUTH_LOGIN as never);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, username, display_name")
          .eq("user_id", user.id)
          .single();

        if (cancelled) return;
        if (profile?.username && profile?.display_name) {
          router.replace(ROUTES.TABS as never);
          return;
        }

        setUserId(user.id);
        if (profile?.username) setUsername(profile.username);
        if (profile?.display_name) setDisplayName(profile.display_name);
      } catch (e) {
        if (!cancelled) {
          captureError(e, "CreateProfileCheckProfile");
          router.replace(ROUTES.AUTH_LOGIN as never);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    checkProfile();
    return () => { cancelled = true; };
  }, [router]);

  const handleUsernameBlur = useCallback(() => {
    if (username.trim().length === 0) {
      setUsernameError("");
      return;
    }
    if (!validateUsername(normalizedUsername)) {
      setUsernameError("Username must be 3-20 characters, lowercase, no spaces");
    } else {
      setUsernameError("");
    }
  }, [username, normalizedUsername]);

  const handleContinue = useCallback(async (): Promise<void> => {
    if (loading || saving || !userId) return;
    setSaving(true);
    setFormError("");

    try {
      const deviceTz = getCalendars()[0]?.timeZone ?? "UTC";
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: userId,
          username: normalizedUsername,
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          timezone: deviceTz,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }

      trackEvent("profile_created");
      router.replace(ROUTES.TABS as never);
    } catch (e) {
      captureError(e, "CreateProfileSave");
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }, [loading, saving, userId, normalizedUsername, displayName, bio, router]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top", "bottom"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={DS_COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>CLAIM YOUR IDENTITY</Text>
        <Text style={styles.title}>Let&apos;s set up your profile.</Text>
        <Text style={styles.subtitle}>This is how others will know you.</Text>

        <View style={styles.gap24} />

        <FormInput
          label="Username"
          value={username}
          onChangeText={(t) => {
            setUsername(t);
            setFormError("");
            setUsernameError("");
          }}
          placeholder="your_handle"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => displayNameRef.current?.focus()}
          editable={!saving}
          onFocus={() => setFocusedField("username")}
          onBlur={handleUsernameBlur}
          inputStyle={{ borderColor: inputBorder("username"), marginBottom: 12 }}
          containerStyle={{ marginBottom: 0 }}
          accessibilityLabel="Username"
        />
        <Text style={styles.hint}>Letters, numbers, and underscores only</Text>
        {usernameError ? (
          <Text style={styles.inlineError} accessibilityLiveRegion="polite">
            {usernameError}
          </Text>
        ) : null}

        <FormInput
          label="Display Name"
          value={displayName}
          onChangeText={(t) => {
            setDisplayName(t);
            setFormError("");
          }}
          placeholder="Your Name"
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => bioRef.current?.focus()}
          editable={!saving}
          onFocus={() => setFocusedField("displayName")}
          onBlur={() => setFocusedField(null)}
          inputStyle={{ borderColor: inputBorder("displayName"), marginBottom: 12 }}
          containerStyle={{ marginBottom: 0 }}
          accessibilityLabel="Display Name"
        />

        <FormInput
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!saving}
          onFocus={() => setFocusedField("bio")}
          onBlur={() => setFocusedField(null)}
          inputStyle={[styles.bioInput, { marginBottom: 12 }]}
          containerStyle={{ marginBottom: 0 }}
          accessibilityLabel="Bio"
        />

        <View style={styles.gap20} />

        {formError ? (
          <Text style={styles.inlineError} accessibilityLiveRegion="polite">
            {formError}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.cta, !canContinue && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Continue"
          accessibilityState={{ disabled: !canContinue }}
        >
          {saving ? (
            <ActivityIndicator color={DS_COLORS.textPrimary} size="small" />
          ) : (
            <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function CreateProfileScreen() {
  return (
    <ErrorBoundary>
      <CreateProfileScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: PADDING_H, paddingTop: 16, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    letterSpacing: 1.2,
    color: DS_COLORS.accent,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD,
    color: DS_COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS.textSecondary,
    marginBottom: 0,
  },
  gap24: { height: 24 },
  gap20: { height: 20 },
  input: {
    backgroundColor: DS_COLORS.card,
    borderWidth: 1,
    borderRadius: DS_RADIUS.MD,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: DS_COLORS.textPrimary,
    marginBottom: 12,
  },
  bioInput: {
    height: 100,
    paddingTop: 12,
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: DS_COLORS.textMuted,
    marginTop: -4,
    marginBottom: 8,
  },
  inlineError: {
    fontSize: 13,
    color: DS_COLORS.errorText,
    marginBottom: 12,
  },
  cta: {
    height: 56,
    borderRadius: DS_RADIUS.joinCta,
    backgroundColor: DS_COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: {
    backgroundColor: DS_COLORS.buttonDisabledBg,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
  },
  ctaTextDisabled: {
    color: DS_COLORS.buttonDisabledText,
  },
});
