import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { uploadAvatarFromUri } from "@/lib/uploadAvatar";
import { pickProfilePhoto } from "@/lib/pick-profile-photo";
import { normalizeProfileUsername, usernameFieldState, usernameSaveBlocked } from "@/lib/profile-v2-username";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import { Avatar } from "@/components/shared/Avatar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { GriitFade } from "@/components/profile-v2/GriitFade";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const BIO_MAX = 150;
const NAME_MAX = 30;

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { profile, refetchAll } = useApp();

  const originalUsername = normalizeProfileUsername(profile?.username ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [username, setUsername] = useState(originalUsername);
  const [bio, setBio] = useState((profile?.bio ?? "").slice(0, BIO_MAX));
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [taken, setTaken] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setUsername(normalizeProfileUsername(profile.username ?? ""));
    setBio((profile.bio ?? "").slice(0, BIO_MAX));
    setAvatarUrl(profile.avatar_url ?? "");
  }, [profile]);

  const normalized = normalizeProfileUsername(username);
  const fieldState = usernameFieldState({
    normalized,
    original: originalUsername,
    inFlight: checking,
    taken,
  });

  useEffect(() => {
    if (normalized === originalUsername || normalized.length < 3) {
      setTaken(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    const t = setTimeout(() => {
      void (async () => {
        try {
          const result = (await trpcQuery(TRPC.profiles.getPublicByUsername, {
            username: normalized,
          })) as { user_id?: string } | null;
          setTaken(Boolean(result?.user_id && result.user_id !== user?.id));
        } catch (e) {
          captureError(e, "EditProfileUsernameCheck");
          setTaken(null);
        } finally {
          setChecking(false);
        }
      })();
    }, 400);
    return () => clearTimeout(t);
  }, [normalized, originalUsername, user?.id]);

  const blocked = usernameSaveBlocked(fieldState) || saving;

  const handlePhoto = useCallback(async () => {
    const pick = await pickProfilePhoto();
    if (pick.status === "denied") {
      setFormError("Allow photo access in Settings to change your photo.");
      return;
    }
    if (pick.status !== "ok") return;
    const up = await uploadAvatarFromUri(pick.uri, {
      mimeType: pick.mimeType,
      fileName: pick.fileName,
    });
    if ("error" in up) {
      setFormError(up.error);
      return;
    }
    setAvatarUrl(up.url);
  }, []);

  const originalName = profile?.display_name ?? "";
  const originalBio = (profile?.bio ?? "").slice(0, BIO_MAX);
  const originalAvatar = profile?.avatar_url ?? "";
  const dirty =
    displayName !== originalName ||
    normalized !== originalUsername ||
    bio !== originalBio ||
    avatarUrl !== originalAvatar;

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.TABS_PROFILE as never);
  };

  const requestClose = () => {
    if (dirty && !saving) {
      setDiscardOpen(true);
      return;
    }
    close();
  };

  const handleSave = async () => {
    if (!user?.id || blocked) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      await trpcMutate(TRPC.profiles.update, {
        display_name: displayName.trim().slice(0, NAME_MAX) || originalUsername,
        username: normalized,
        bio: bio.trim().slice(0, BIO_MAX),
        avatar_url: avatarUrl.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["profiles", "getRecord", user.id] });
      await refetchAll();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      close();
    } catch (err: unknown) {
      captureError(err, "EditProfileUpdate");
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.nav}>
          <Pressable onPress={requestClose} accessibilityRole="button" accessibilityLabel="Cancel" style={styles.navBtn}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.navTitle}>Edit profile</Text>
          <Pressable
            onPress={() => void handleSave()}
            disabled={blocked}
            accessibilityRole="button"
            accessibilityLabel="Save"
            accessibilityState={{ disabled: blocked }}
            style={styles.navBtn}
          >
            {saving ? (
              <ActivityIndicator size="small" color={PROFILE_V2_COLOR.orange} />
            ) : (
              <Text style={[styles.save, blocked && styles.saveOff]}>Save</Text>
            )}
          </Pressable>
        </View>

        <GriitFade fadeKey="edit-profile">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <View style={styles.avatarBlock}>
              <Avatar
                url={avatarUrl}
                name={displayName || originalUsername}
                size={96}
                userId={user?.id}
              />
              <Pressable onPress={() => void handlePhoto()} accessibilityRole="button" style={styles.photoBtn}>
                <Text style={styles.photoBtnTxt}>Change photo</Text>
              </Pressable>
              <Text style={styles.helper}>Square crop — crops to a circle everywhere.</Text>
            </View>

            <Field label="DISPLAY NAME">
              <TextInput
                value={displayName}
                onChangeText={(t) => setDisplayName(t.slice(0, NAME_MAX))}
                maxLength={NAME_MAX}
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={PROFILE_V2_COLOR.mutedLight}
              />
            </Field>

            <Field
              label="USERNAME"
              right={
                fieldState === "tooShort" ? (
                  <Text style={styles.warn}>3 characters min</Text>
                ) : fieldState === "taken" ? (
                  <Text style={styles.warn}>Taken</Text>
                ) : fieldState === "available" ? (
                  <Text style={styles.ok}>Available</Text>
                ) : fieldState === "checking" ? (
                  <Text style={styles.helper}> </Text>
                ) : null
              }
            >
              <View
                style={[
                  styles.userRow,
                  (fieldState === "taken" || fieldState === "tooShort") && styles.inputBad,
                ]}
              >
                <Text style={styles.at}>@</Text>
                <TextInput
                  value={username}
                  onChangeText={(t) => setUsername(normalizeProfileUsername(t))}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  style={styles.userInput}
                />
              </View>
              <Text style={styles.helper}>
                Lowercase letters, numbers and underscores. Changing it breaks old links to your
                profile.
              </Text>
            </Field>

            <Field label="BIO" right={<Text style={[styles.helper, bio.length > 140 && styles.warn]}>{bio.length}/{BIO_MAX}</Text>}>
              <TextInput
                value={bio}
                onChangeText={(t) => setBio(t.slice(0, BIO_MAX))}
                maxLength={BIO_MAX}
                multiline
                style={[styles.input, styles.bio]}
                placeholder="Shown on your profile to anyone who can see it."
                placeholderTextColor={PROFILE_V2_COLOR.mutedLight}
              />
              <Text style={styles.helper}>Shown on your profile to anyone who can see it.</Text>
            </Field>

            {formError ? <Text style={styles.warn}>{formError}</Text> : null}
          </ScrollView>
        </KeyboardAvoidingView>
        </GriitFade>
        <ConfirmDialog
          visible={discardOpen}
          title="Discard changes?"
          message="Your edits will not be saved."
          confirmLabel="Discard"
          destructive
          onConfirm={() => {
            setDiscardOpen(false);
            close();
          }}
          onCancel={() => setDiscardOpen(false)}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

function Field({
  label,
  right,
  children,
}: {
  label: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHead}>
        <Text style={styles.micro}>{label}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PROFILE_V2_COLOR.canvas },
  nav: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: PROFILE_V2_COLOR.border,
  },
  navBtn: { minWidth: 64, height: 44, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 15, fontWeight: "400", color: PROFILE_V2_COLOR.ink },
  cancel: { fontSize: 15, color: PROFILE_V2_COLOR.muted },
  save: { fontSize: 15, color: PROFILE_V2_COLOR.orange },
  saveOff: { color: PROFILE_V2_COLOR.chevron },
  body: { paddingHorizontal: 28, paddingBottom: 40, gap: 20 },
  avatarBlock: { alignItems: "center", marginTop: 20, gap: 10 },
  photoBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  photoBtnTxt: { fontSize: 14, color: PROFILE_V2_COLOR.ink },
  helper: { fontSize: 12, color: PROFILE_V2_COLOR.mutedLight },
  field: { gap: 8 },
  fieldHead: { flexDirection: "row", justifyContent: "space-between" },
  micro: { fontSize: 11, letterSpacing: 0.8, color: PROFILE_V2_COLOR.mutedLight },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.border,
    paddingHorizontal: 14,
    fontSize: 16,
    color: PROFILE_V2_COLOR.ink,
    backgroundColor: PROFILE_V2_COLOR.surface,
  },
  bio: { height: 120, paddingTop: 14, textAlignVertical: "top", fontSize: 15, lineHeight: 22 },
  userRow: {
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PROFILE_V2_COLOR.surface,
  },
  inputBad: { borderColor: PROFILE_V2_COLOR.danger },
  at: { fontSize: 16, color: PROFILE_V2_COLOR.mutedLight, marginRight: 4 },
  userInput: { flex: 1, fontSize: 16, color: PROFILE_V2_COLOR.ink },
  warn: { fontSize: 12, color: PROFILE_V2_COLOR.danger },
  ok: { fontSize: 12, color: PROFILE_V2_COLOR.success },
});
