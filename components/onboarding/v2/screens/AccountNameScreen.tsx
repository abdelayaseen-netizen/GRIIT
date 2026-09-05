import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingStore } from "@/store/onboardingStore";
import { captureError } from "@/lib/sentry";
import { uploadAvatarFromUri } from "@/lib/uploadAvatar";
import {
  accountNameContinueDecision,
  accountNameSkipDecision,
  normalizeAccountUsername,
  prefillAccountUsername,
} from "@/lib/onboarding-v2-account-name";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
import { PrimaryButton, TextLink } from "../ui";

type UsernameStatus = "idle" | "checking" | "available" | "taken";

/**
 * Photo picker matches old ProfileSetup (`requestMediaLibraryPermissionsAsync`
 * + `launchImageLibraryAsync` 1:1 / quality 0.85) and uploads via
 * `uploadAvatarFromUri` → Supabase Storage `avatars` bucket.
 */
async function pickProfilePhoto(): Promise<
  | { status: "ok"; uri: string; mimeType?: string | null; fileName?: string | null }
  | { status: "cancelled" }
  | { status: "denied" }
> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { status: "denied" };
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]?.uri) return { status: "cancelled" };
  const asset = result.assets[0];
  return {
    status: "ok",
    uri: asset.uri,
    mimeType: asset.mimeType,
    fileName: asset.fileName,
  };
}

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
  const [username, setUsernameField] = useState(() =>
    prefillAccountUsername({ email: hints?.email ?? null })
  );
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const profile = (await trpcQuery(TRPC.profiles.get)) as {
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
        } | null;
        if (cancelled) return;
        if (profile?.username) {
          setUsernameField((prev) =>
            prev ||
            prefillAccountUsername({
              email: hints?.email ?? null,
              profileUsername: profile.username,
            })
          );
        }
        if (profile?.display_name) {
          setDisplayName((prev) => prev || profile.display_name || "");
        }
        if (profile?.avatar_url?.trim()) {
          setAvatarUrl((prev) => prev || profile.avatar_url || null);
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
  }, [hints?.email]);

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

  const persistAvatarIfNeeded = useCallback(async (): Promise<string | null> => {
    if (avatarUrl) return avatarUrl;
    if (!avatarUri) return null;
    const up = await uploadAvatarFromUri(avatarUri);
    if ("error" in up) {
      throw new Error(up.error);
    }
    setAvatarUrl(up.url);
    return up.url;
  }, [avatarUri, avatarUrl]);

  const handlePickAvatar = useCallback(async () => {
    setError("");
    const picked = await pickProfilePhoto();
    if (picked.status === "denied") {
      setError("Photo library permission is required to set an avatar.");
      return;
    }
    if (picked.status !== "ok") return;
    setAvatarUri(picked.uri);
    setAvatarUrl(null);
    setAvatarUploading(true);
    try {
      const up = await uploadAvatarFromUri(picked.uri, {
        mimeType: picked.mimeType,
        fileName: picked.fileName,
      });
      if ("error" in up) {
        setError(up.error);
        return;
      }
      setAvatarUrl(up.url);
      await trpcMutate(TRPC.profiles.update, { avatar_url: up.url });
    } catch (e) {
      captureError(e, "OnboardingV2AccountNameAvatar");
      setError(e instanceof Error ? e.message : "Could not upload photo.");
    } finally {
      setAvatarUploading(false);
    }
  }, []);

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
      const photoUrl = await persistAvatarIfNeeded();
      await trpcMutate(TRPC.profiles.update, {
        display_name: decision.displayName || undefined,
        username: decision.username,
        ...(photoUrl ? { avatar_url: photoUrl } : {}),
      });
      setUsername(decision.username);
      onContinue();
    } catch (e) {
      captureError(e, "OnboardingV2AccountName");
      setError(e instanceof Error ? e.message : "Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  }, [displayName, username, status, persistAvatarIfNeeded, setUsername, onContinue]);

  const handleSkip = useCallback(() => {
    accountNameSkipDecision();
    onSkip();
  }, [onSkip]);

  const previewUri = avatarUri ?? avatarUrl;

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
            <Pressable
              style={styles.avatarWrap}
              onPress={() => {
                void handlePickAvatar();
              }}
              disabled={avatarUploading || saving}
              accessibilityRole="button"
              accessibilityLabel="Add a profile photo"
            >
              {previewUri ? (
                <Image
                  source={{ uri: previewUri }}
                  style={styles.avatarImg}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  {avatarUploading ? (
                    <ActivityIndicator color={OBV2_COLOR.ink3} />
                  ) : (
                    <Camera size={28} color={OBV2_COLOR.ink3} />
                  )}
                </View>
              )}
            </Pressable>
            <Text style={styles.photoHint}>Photo optional</Text>

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

const AVATAR = 88;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 6, paddingBottom: 24 },
  head: { marginBottom: 16 },
  h1: { fontSize: 36, fontWeight: "500", lineHeight: 37, letterSpacing: -1.3, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 12 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  body: { flexGrow: 1, justifyContent: "center", gap: 10 },
  avatarWrap: { alignSelf: "center", marginTop: 4 },
  avatarImg: { width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2 },
  avatarPlaceholder: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: OBV2_COLOR.avatar,
    borderWidth: 2,
    borderColor: OBV2_COLOR.borderStrong,
    justifyContent: "center",
    alignItems: "center",
  },
  photoHint: {
    fontSize: 13,
    fontWeight: "400",
    color: OBV2_COLOR.ink3,
    textAlign: "center",
    marginBottom: 6,
  },
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
