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
import { DS_COLORS } from "@/lib/design-system";

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

export default function CreateProfileScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [usernameError, setUsernameError] = useState("");
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
    const checkProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/auth/login" as never);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, username, display_name")
          .eq("user_id", user.id)
          .single();

        if (profile?.username && profile?.display_name) {
          router.replace("/(tabs)" as never);
          return;
        }

        setUserId(user.id);
        if (profile?.username) setUsername(profile.username);
        if (profile?.display_name) setDisplayName(profile.display_name);
      } catch (e) {
        console.warn("[AUTH] create-profile checkProfile:", e);
        router.replace("/auth/login" as never);
      } finally {
        setLoading(false);
      }
    };
    checkProfile();
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

  const handleContinue = useCallback(async () => {
    if (loading || saving || !userId) return;
    setSaving(true);
    setFormError("");

    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: userId,
          username: normalizedUsername,
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }

      router.replace("/(tabs)" as never);
    } catch (e) {
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

        <TextInput
          style={[styles.input, { borderColor: inputBorder("username") }]}
          placeholder="your_username"
          placeholderTextColor={DS_COLORS.textMuted}
          value={username}
          onChangeText={(t) => { setUsername(t); setFormError(""); setUsernameError(""); }}
          onFocus={() => setFocusedField("username")}
          onBlur={handleUsernameBlur}
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => displayNameRef.current?.focus()}
          editable={!saving}
          accessibilityLabel="Username"
        />
        <Text style={styles.hint}>Letters, numbers, and underscores only</Text>
        {usernameError ? (
          <Text style={styles.inlineError} accessibilityLiveRegion="polite">
            {usernameError}
          </Text>
        ) : null}

        <TextInput
          ref={displayNameRef}
          style={[styles.input, { borderColor: inputBorder("displayName") }]}
          placeholder="Your Name"
          placeholderTextColor={DS_COLORS.textMuted}
          value={displayName}
          onChangeText={(t) => { setDisplayName(t); setFormError(""); }}
          onFocus={() => setFocusedField("displayName")}
          onBlur={() => setFocusedField(null)}
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => bioRef.current?.focus()}
          editable={!saving}
          accessibilityLabel="Display Name"
        />

        <TextInput
          ref={bioRef}
          style={[styles.input, styles.bioInput]}
          placeholder="Tell us about yourself..."
          placeholderTextColor={DS_COLORS.textMuted}
          value={bio}
          onChangeText={setBio}
          onFocus={() => setFocusedField("bio")}
          onBlur={() => setFocusedField(null)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!saving}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: PADDING_H, paddingTop: 16, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: DS_COLORS.accent,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
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
    borderRadius: 12,
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
    borderRadius: 28,
    backgroundColor: DS_COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: {
    backgroundColor: DS_COLORS.buttonDisabledBg,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  ctaTextDisabled: {
    color: DS_COLORS.buttonDisabledText,
  },
});
