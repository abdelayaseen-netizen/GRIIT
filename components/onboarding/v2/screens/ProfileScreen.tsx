import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { Camera } from "lucide-react-native";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useOnboardingStore } from "@/store/onboardingStore";
import { captureError } from "@/lib/sentry";
import { uploadAvatarFromUri } from "@/lib/uploadAvatar";
import { pickAvatar } from "@/lib/pick-avatar";
import { isValidAccountUsername } from "@/lib/onboarding-v2-account-name";
import { normalizeOnboardingUsername, persistThenAdvance } from "@/lib/onboarding-v2-profile";
import { DS_COLORS_V2, DS_V3 } from "@/lib/design-system";
import { ChromePrimary, OnboardingScreen, TextLink } from "../OnboardingChrome";

const PHOTO = DS_V3.space.gutter * 4 + DS_V3.space.sm;
const CAM = DS_V3.space.lg + DS_V3.space.md;
const PT = DS_V3.space.xs / 4;

export default function ProfileScreen({
  onContinue,
  onSkip,
  onBack,
}: {
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const hints = useOnboardingStore((s) => s.profileSetupHints);
  const setUsername = useOnboardingStore((s) => s.setUsername);
  const [displayName, setDisplayName] = useState(hints?.displayNameFromApple ?? "");
  const [username, setUsernameField] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [availability, setAvailability] = useState<"idle" | "checking" | "available" | "taken">(
    "idle"
  );

  const checkUsername = useCallback(async (value: string) => {
    if (value.length < 3) {
      setAvailability("idle");
      return;
    }
    setAvailability("checking");
    try {
      const result = await trpcQuery<{ available: boolean }>(TRPC.profiles.checkUsername, {
        username: value,
      });
      setAvailability(result.available ? "available" : "taken");
    } catch (e) {
      captureError(e, "OnboardingV2CheckUsername");
      setAvailability("idle");
    }
  }, []);

  useEffect(() => {
    if (username.length < 3) {
      setAvailability("idle");
      return;
    }
    setAvailability("checking");
    const t = setTimeout(() => {
      void checkUsername(username);
    }, 400);
    return () => clearTimeout(t);
  }, [username, checkUsername]);

  const handlePick = useCallback(async () => {
    try {
      const picked = await pickAvatar();
      if (picked.status !== "ok") return;
      setAvatarUri(picked.uri);
      setAvatarUrl(null);
      const up = await uploadAvatarFromUri(picked.uri, {
        mimeType: picked.mimeType,
        fileName: picked.fileName,
      });
      if ("error" in up) return;
      setAvatarUrl(up.url);
    } catch (e) {
      captureError(e, "OnboardingV2ProfileAvatar");
    }
  }, []);

  const persistThen = useCallback(
    async (done: () => void) => {
      setSaving(true);
      setSaveError("");
      const result = await persistThenAdvance(async () => {
        const payload: {
          display_name?: string;
          username?: string;
          bio?: string;
          avatar_url?: string;
        } = {};
        const name = displayName.trim();
        if (name) payload.display_name = name;
        const user = normalizeOnboardingUsername(username);
        if (isValidAccountUsername(user)) {
          payload.username = user;
        }
        const line = bio.trim();
        if (line) payload.bio = line;
        if (avatarUrl) payload.avatar_url = avatarUrl;
        if (Object.keys(payload).length > 0) {
          await trpcMutate(TRPC.profiles.update, payload);
        }
        if (isValidAccountUsername(normalizeOnboardingUsername(username))) {
          setUsername(normalizeOnboardingUsername(username));
        }
      }, done);
      if (result.status === "stayed") {
        captureError(result.error, "OnboardingV2Profile");
        setSaveError(
          result.error instanceof Error ? result.error.message : "Could not save. Your fields are still here."
        );
      }
      setSaving(false);
    },
    [displayName, username, bio, avatarUrl, setUsername]
  );

  const preview = avatarUri ?? avatarUrl;

  return (
    <OnboardingScreen
      step={7}
      onBack={onBack}
      skipLabel="Skip"
      onSkip={onSkip}
      title="What should we call you?"
      subtitle="All of this is optional. The feed shows your display name, or your username if you leave it blank."
      footer={
        <>
          <ChromePrimary
            label="Continue"
            disabled={saving || availability === "taken" || availability === "checking"}
            onPress={() => void persistThen(onContinue)}
          />
          <TextLink label="Skip for now" onPress={onSkip} />
        </>
      }
    >
      <View style={styles.photoBlock}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Photo optional"
          onPress={() => void handlePick()}
          style={styles.photo}
        >
          {preview ? (
            <Image source={{ uri: preview }} style={styles.photoImg} />
          ) : (
            <Camera size={CAM} color={DS_V3.color.textPrimary} />
          )}
        </Pressable>
        <Text style={styles.photoCap}>Photo optional</Text>
      </View>
      <View style={styles.fields}>
        <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" autoCap="words" />
        <Field
          label="Username"
          value={username}
          onChangeText={(t) => setUsernameField(normalizeOnboardingUsername(t))}
          onBlur={() => void checkUsername(username)}
          placeholder="username"
          autoCap="none"
          hint={
            availability === "available"
              ? "Available"
              : availability === "taken"
                ? "Taken"
                : null
          }
          hintTone={availability === "taken" ? "error" : "success"}
        />
        <Field label="Bio" value={bio} onChangeText={setBio} placeholder="One line, optional" autoCap="sentences" />
        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
      </View>
    </OnboardingScreen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  autoCap = "words",
  hint,
  hintTone = "success",
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  placeholder: string;
  autoCap?: "none" | "words" | "sentences";
  hint?: string | null;
  hintTone?: "success" | "error";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={DS_V3.color.textSecondary}
        autoCapitalize={autoCap}
        autoCorrect={false}
        accessibilityLabel={label}
        style={styles.input}
      />
      {hint ? (
        <Text
          style={[
            styles.hint,
            { color: hintTone === "error" ? DS_V3.color.danger : DS_COLORS_V2.semantic.success },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  photoBlock: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    alignItems: "center",
    gap: DS_V3.space.sm,
  },
  photo: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImg: { width: "100%", height: "100%" },
  photoCap: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  fields: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
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
  hint: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: "400",
  },
  saveError: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: "400",
    color: DS_V3.color.danger,
  },
});
