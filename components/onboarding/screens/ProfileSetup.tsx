import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { ONBOARDING_COLORS as C, ONBOARDING_SPACING as S } from "@/constants/onboarding-theme";
import { DS_MEASURES, DS_RADIUS } from "@/lib/design-system";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/analytics";
import { uploadAvatarFromUri } from "@/lib/uploadAvatar";
import { useOnboardingStore, type IntensityLevel } from "@/store/onboardingStore";

function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}

function suggestFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local.replace(/[^a-z0-9]/gi, "_").toLowerCase().replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 20);
}

function mapIntensity(level: IntensityLevel | null): string | null {
  if (!level) return null;
  if (level === "beginner") return "foundation";
  if (level === "intermediate") return "push";
  return "maximum";
}

interface ProfileSetupProps {
  userId: string;
  onComplete: () => void;
}

export default function ProfileSetup({ userId, onComplete }: ProfileSetupProps) {
  const { selectedGoals, intensityLevel } = useOnboardingStore();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hints = useOnboardingStore.getState().profileSetupHints;
    if (hints?.email) {
      const s = suggestFromEmail(hints.email);
      if (s.length >= 3) setUsername(s);
    }
    if (hints?.displayNameFromApple?.trim()) {
      setDisplayName(hints.displayNameFromApple.trim());
    }
  }, []);

  const cleanUsername = useMemo(() => normalizeUsername(username), [username]);
  const usernameOk = cleanUsername.length >= 3 && cleanUsername.length <= 20;
  const displayOk = displayName.trim().length >= 1 && displayName.trim().length <= 50;
  const canContinue = usernameOk && displayOk && !saving && userId.length > 0;

  const pickAvatar = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Photo library permission is required to set an avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    setAvatarUri(result.assets[0].uri);
    setAvatarUrl(null);
    setError("");
  }, []);

  const saveProfile = useCallback(
    async (opts: { skipMinimal: boolean }) => {
      if (!userId) return;
      setSaving(true);
      setError("");
      try {
        let finalAvatar = avatarUrl;
        if (avatarUri && !finalAvatar) {
          const up = await uploadAvatarFromUri(avatarUri);
          if ("error" in up) {
            setError(up.error);
            setSaving(false);
            return;
          }
          finalAvatar = up.url;
          setAvatarUrl(up.url);
        }

        let u = cleanUsername;
        let d = displayName.trim();
        if (opts.skipMinimal) {
          u = `user_${userId.replace(/-/g, "").slice(0, 12)}`;
          d = "User";
        }

        const { error: upErr } = await supabase.from("profiles").upsert(
          {
            user_id: userId,
            username: u,
            display_name: d,
            bio: opts.skipMinimal ? null : bio.trim() || null,
            avatar_url: opts.skipMinimal ? null : finalAvatar ?? null,
            onboarding_answers: { selected_goals: selectedGoals },
            onboarding_intensity: mapIntensity(intensityLevel),
            onboarding_completed: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        if (upErr) {
          if (upErr.message?.includes("unique") || upErr.message?.includes("username")) {
            setError("Username taken. Try another.");
            setSaving(false);
            return;
          }
          setError(upErr.message ?? "Could not save profile.");
          setSaving(false);
          return;
        }
        track({ name: "onboarding_profile_created" });
        onComplete();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [
      userId,
      avatarUri,
      avatarUrl,
      cleanUsername,
      displayName,
      bio,
      selectedGoals,
      intensityLevel,
      onComplete,
    ]
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepLabel}>STEP 3 OF 4</Text>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>This is how others see you on GRIIT.</Text>
        </View>

        <Pressable style={styles.avatarWrap} onPress={pickAvatar} accessibilityRole="button" accessibilityLabel="Choose profile photo">
          {avatarUri || avatarUrl ? (
            <Image
              source={{ uri: avatarUri ?? avatarUrl ?? "" }}
              style={styles.avatarImg}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Camera size={28} color={C.textTertiary} />
            </View>
          )}
        </Pressable>

        <Text style={styles.fieldLabel}>Username</Text>
        <View style={styles.inputRow}>
          <Text style={styles.at}>@</Text>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))}
            placeholder="handle"
            placeholderTextColor={C.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Username"
          />
          {usernameOk ? <Text style={styles.ok}>✓</Text> : null}
        </View>
        {!usernameOk && username.length > 0 ? (
          <Text style={styles.hintErr}>3–20 characters, letters, numbers, underscores.</Text>
        ) : null}

        <Text style={styles.fieldLabel}>Display name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
          placeholderTextColor={C.textTertiary}
          maxLength={50}
          accessibilityLabel="Display name"
        />

        <Text style={styles.fieldLabel}>Bio (optional)</Text>
        <TextInput
          style={[styles.input, styles.bio]}
          value={bio}
          onChangeText={(t) => setBio(t.slice(0, 150))}
          placeholder="What drives you?"
          placeholderTextColor={C.textTertiary}
          multiline
          textAlignVertical="top"
          maxLength={150}
          accessibilityLabel="Bio"
        />
        <Text style={styles.count}>{bio.length}/150</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
          onPress={() => saveProfile({ skipMinimal: false })}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          {saving ? <ActivityIndicator color={C.WHITE} /> : <Text style={styles.primaryButtonText}>Continue</Text>}
        </Pressable>

        <Pressable
          style={styles.skip}
          onPress={() => saveProfile({ skipMinimal: true })}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Skip for now"
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  scroll: { paddingHorizontal: S.screenPadding, paddingBottom: 40, paddingTop: 8 },
  header: { marginBottom: 20 },
  stepLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 1, lineHeight: 16, color: C.accent, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, lineHeight: 34, color: C.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, fontWeight: "500", lineHeight: 24, color: C.textSecondary },
  avatarWrap: { alignSelf: "center", marginBottom: 24 },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.border,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: C.textSecondary, marginBottom: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  at: { fontSize: 15, color: C.textSecondary, marginRight: 6 },
  inputFlex: { flex: 1 },
  input: {
    height: 52,
    backgroundColor: C.WHITE,
    borderRadius: DS_RADIUS.input,
    paddingHorizontal: 16,
    fontSize: 15,
    color: C.textPrimary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    marginBottom: 8,
  },
  bio: { height: 100, paddingTop: 12 },
  ok: { fontSize: 16, color: C.success, marginLeft: 8, marginBottom: 8 },
  hintErr: { fontSize: 12, color: C.accent, marginBottom: 8 },
  count: { fontSize: 12, color: C.textTertiary, alignSelf: "flex-end", marginBottom: 16 },
  primaryButton: {
    backgroundColor: C.darkCta,
    height: DS_MEASURES.CTA_HEIGHT,
    borderRadius: DS_RADIUS.button,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { fontSize: 17, fontWeight: "700", color: C.textOnAccent },
  skip: { paddingVertical: 16, alignItems: "center" },
  skipText: { fontSize: 15, color: C.textSecondary },
  errorText: { fontSize: 13, color: C.accent, marginBottom: 8, textAlign: "center" },
});
