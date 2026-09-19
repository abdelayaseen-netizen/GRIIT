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
  StatusBar,
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
import { pickAvatar } from "@/lib/pick-avatar";
import { normalizeProfileUsername, usernameFieldState, usernameSaveBlocked } from "@/lib/profile-v2-username";
import { PROFILE_USERNAME_MAX } from "@/lib/profile-update-schema";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import ControlPill from "@/components/ds/ControlPill";
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
    const pick = await pickAvatar();
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
      <StatusBar barStyle="light-content" />
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
              <ActivityIndicator size="small" color={DS_V3.color.brandText} />
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
                uri={avatarUrl}
                displayName={displayName || originalUsername}
                size={DS_V3.size.avatar.lg}
              />
              <ControlPill label="Change photo" icon="image" onPress={() => void handlePhoto()} />
            </View>

            <Field label="Display name">
              <TextInput
                value={displayName}
                onChangeText={(t) => setDisplayName(t.slice(0, NAME_MAX))}
                maxLength={NAME_MAX}
                autoCapitalize="words"
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={DS_V3.color.textSecondary}
              />
            </Field>

            <Field
              label="Username"
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
                  maxLength={PROFILE_USERNAME_MAX}
                  style={styles.userInput}
                />
              </View>
              <Text style={styles.helper}>
                Lowercase letters, numbers and underscores. Changing it breaks old links.
              </Text>
            </Field>

            <Field label="Bio" right={<Text style={[styles.helper, bio.length > 140 && styles.warn]}>{bio.length}/{BIO_MAX}</Text>}>
              <TextInput
                value={bio}
                onChangeText={(t) => setBio(t.slice(0, BIO_MAX))}
                maxLength={BIO_MAX}
                autoCapitalize="sentences"
                multiline
                style={[styles.input, styles.bio]}
                placeholder="Shown to anyone who can see your profile."
                placeholderTextColor={DS_V3.color.textSecondary}
              />
              <Text style={styles.helper}>Shown to anyone who can see your profile.</Text>
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

const PT = DS_V3.space.xs / 4;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  nav: {
    height: DS_V3.size.button,
    paddingHorizontal: DS_V3.space.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: PT,
    borderBottomColor: DS_V3.color.border,
  },
  navBtn: { minWidth: 64, height: DS_V3.size.tap, alignItems: "center", justifyContent: "center" },
  navTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  cancel: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  save: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.brandText,
  },
  saveOff: { color: DS_V3.color.textSecondary },
  body: { paddingHorizontal: DS_V3.space.section, paddingBottom: 40, gap: DS_V3.space.gutter },
  avatarBlock: { alignItems: "center", marginTop: DS_V3.space.gutter, gap: DS_V3.space.sm },
  helper: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  field: { gap: DS_V3.space.sm },
  fieldHead: { flexDirection: "row", justifyContent: "space-between" },
  micro: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  input: {
    height: DS_V3.size.button,
    borderRadius: DS_V3.radius.input,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    paddingHorizontal: 14,
    fontSize: DS_V3.type.body.fontSize,
    color: DS_V3.color.textPrimary,
    backgroundColor: DS_V3.color.surface,
  },
  bio: {
    height: 120,
    paddingTop: 14,
    textAlignVertical: "top",
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
  },
  userRow: {
    height: DS_V3.size.button,
    borderRadius: DS_V3.radius.input,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_V3.color.surface,
  },
  inputBad: { borderColor: DS_V3.color.danger },
  at: { fontSize: DS_V3.type.body.fontSize, color: DS_V3.color.textSecondary, marginRight: 4 },
  userInput: { flex: 1, fontSize: DS_V3.type.body.fontSize, color: DS_V3.color.textPrimary },
  warn: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.danger,
  },
  ok: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.brandText,
  },
});
