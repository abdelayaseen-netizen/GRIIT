import React, { useMemo, useState } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { User, Users, ChevronLeft } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, getCategoryColors } from "@/lib/design-system";

const MAX_NAME_LEN = 30;
const MIN_NAME_LEN = 3;
const TEAM_SIZES = [2, 3, 4, 5] as const;
const GOAL_MODES = [
  { id: "individual" as const, title: "Individual", subtitle: "Everyone completes the task on their own", Icon: User },
  { id: "shared" as const, title: "Shared goal", subtitle: "Team contributes to one collective target", Icon: Users },
];

export default function CreateTeamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ challenge_id?: string }>();
  const challengeId = typeof params.challenge_id === "string" ? params.challenge_id : "";
  const [name, setName] = useState("");
  const [maxMembers, setMaxMembers] = useState<2 | 3 | 4 | 5>(5);
  const [goalMode, setGoalMode] = useState<"individual" | "shared">("individual");
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [focused, setFocused] = useState(false);

  const trimmed = name.trim();
  const nameValid = trimmed.length >= MIN_NAME_LEN && trimmed.length <= MAX_NAME_LEN;
  const canSubmit = nameValid && !!challengeId && !pending;

  const challengeQuery = useQuery({
    queryKey: ["challenge", "preview", challengeId],
    queryFn: () =>
      trpcQuery(TRPC.challenges.getById, { id: challengeId }) as Promise<{
        title?: string;
        category?: string;
        duration_days?: number;
        difficulty?: string;
      }>,
    enabled: !!challengeId,
  });
  const categoryColor = useMemo(
    () => getCategoryColors(challengeQuery.data?.category ?? "discipline").header,
    [challengeQuery.data?.category]
  );

  const validate = () => {
    setNameError(null);
    setFormError(null);
    let ok = true;
    if (trimmed.length < MIN_NAME_LEN) {
      setNameError("Team name must be at least 3 characters.");
      ok = false;
    } else if (trimmed.length > MAX_NAME_LEN) {
      setNameError("Team name must be 30 characters or less.");
      ok = false;
    }
    if (!challengeId) {
      setFormError("Missing challenge ID. Go back and try again.");
      ok = false;
    }
    return ok;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setPending(true);
    try {
      const team = await trpcMutate(TRPC.team.create, {
        name: trimmed,
        challenge_id: challengeId,
        max_members: maxMembers,
        goal_mode: goalMode,
      }) as { id: string; team_code: string; challenge_id: string };
      router.push({
        pathname: "/team-invite",
        params: {
          team_id: team.id,
          team_code: team.team_code,
          challenge_id: team.challenge_id ?? challengeId,
          max_members: String(maxMembers),
        },
      } as never);
    } catch (error) {
      console.error("[CreateTeam] create failed:", error);
      setFormError(error instanceof Error ? error.message : "Could not create team.");
    } finally {
      setPending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home" as never))} style={styles.backRow} accessibilityRole="button" accessibilityLabel="Go back">
          <ChevronLeft size={18} color={DS_COLORS.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create team</Text>

        <View style={styles.previewCard}>
          <View style={[styles.previewStripe, { backgroundColor: categoryColor }]} />
          <View style={styles.previewBody}>
            <Text style={styles.previewTitle} numberOfLines={1}>{challengeQuery.data?.title ?? "Challenge"}</Text>
            <Text style={styles.previewSubtitle} numberOfLines={1}>
              {challengeQuery.data?.difficulty ?? "Challenge"} • {challengeQuery.data?.duration_days ?? 0} days
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Team name</Text>
        <TextInput
          style={[styles.input, focused && styles.inputFocus, !!nameError && styles.inputError]}
          value={name}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={(next) => setName(next.slice(0, MAX_NAME_LEN))}
          placeholder="e.g., Morning Warriors"
          placeholderTextColor={DS_COLORS.textMuted}
          maxLength={MAX_NAME_LEN}
          autoCapitalize="words"
          accessibilityLabel="Team name"
          accessibilityRole="text"
        />
        <Text style={styles.counter}>{name.length}/{MAX_NAME_LEN}</Text>
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

        <Text style={styles.label}>Max members</Text>
        <View style={styles.sizeRow}>
          {TEAM_SIZES.map((size) => {
            const active = size === maxMembers;
            return (
              <TouchableOpacity
                key={size}
                style={[styles.sizePill, active && styles.sizePillActive]}
                onPress={() => setMaxMembers(size)}
                accessibilityRole="button"
                accessibilityLabel={`Set max members to ${size}`}
              >
                <Text style={[styles.sizeText, active && styles.sizeTextActive]}>{size}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>How will your team work?</Text>
        <View style={styles.modeList}>
          {GOAL_MODES.map((mode) => {
            const selected = mode.id === goalMode;
            return (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeCard, selected && styles.modeCardSelected]}
                onPress={() => setGoalMode(mode.id)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${mode.title} goal mode`}
              >
                <mode.Icon size={24} color={selected ? DS_COLORS.DISCOVER_CORAL : DS_COLORS.textSecondary} />
                <View style={styles.modeTextWrap}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        <TouchableOpacity
          style={[styles.btn, !canSubmit && styles.btnDisabled]}
          onPress={() => void handleCreate()}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Create Team"
        >
          {pending ? <ActivityIndicator color={DS_COLORS.white} size="small" /> : <Text style={styles.btnText}>Create Team</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.TROPHY_ICON_WRAP_BG },
  keyboard: { flex: 1, paddingHorizontal: DS_SPACING.screenHorizontal, paddingBottom: DS_SPACING.lg },
  backRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: DS_SPACING.sm, marginBottom: DS_SPACING.sm },
  backText: { ...DS_TYPOGRAPHY.metadata, color: DS_COLORS.textPrimary },
  title: { fontSize: 24, fontWeight: "700", color: DS_COLORS.challengeHeaderDark, marginBottom: DS_SPACING.lg },
  previewCard: {
    backgroundColor: DS_COLORS.white,
    borderRadius: DS_RADIUS.card,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    marginBottom: DS_SPACING.lg,
    flexDirection: "row",
    overflow: "hidden",
  },
  previewStripe: { width: 3 },
  previewBody: { padding: DS_SPACING.md, flex: 1 },
  previewTitle: { fontSize: 15, fontWeight: "700", color: DS_COLORS.textPrimary },
  previewSubtitle: { fontSize: 12, color: DS_COLORS.textSecondary, marginTop: 2 },
  label: { fontSize: 13, color: DS_COLORS.textSecondary, marginBottom: 8, marginTop: DS_SPACING.sm },
  input: {
    backgroundColor: DS_COLORS.white,
    padding: DS_SPACING.BASE,
    borderRadius: DS_RADIUS.input,
    borderWidth: 1.5,
    borderColor: DS_COLORS.BORDER_DEFAULT,
    color: DS_COLORS.textPrimary,
  },
  inputFocus: { borderColor: DS_COLORS.DISCOVER_CORAL },
  inputError: { borderColor: DS_COLORS.ERROR_RED },
  counter: { alignSelf: "flex-end", fontSize: 11, color: DS_COLORS.grayMedium, marginTop: 4 },
  sizeRow: { flexDirection: "row", gap: 8, marginBottom: DS_SPACING.sm },
  sizePill: {
    height: 40,
    minWidth: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DS_COLORS.DISABLED_BG,
    backgroundColor: DS_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  sizePillActive: { backgroundColor: DS_COLORS.DISCOVER_CORAL, borderColor: DS_COLORS.DISCOVER_CORAL },
  sizeText: { fontSize: 14, fontWeight: "600", color: DS_COLORS.textSecondary },
  sizeTextActive: { color: DS_COLORS.white },
  modeList: { gap: 12, marginBottom: DS_SPACING.sm },
  modeCard: {
    backgroundColor: DS_COLORS.white,
    borderRadius: DS_RADIUS.card,
    borderWidth: 1.5,
    borderColor: DS_COLORS.DISABLED_BG,
    padding: DS_SPACING.BASE,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  modeCardSelected: { borderColor: DS_COLORS.DISCOVER_CORAL, backgroundColor: DS_COLORS.ACCENT_TINT },
  modeTextWrap: { flex: 1 },
  modeTitle: { fontSize: 14, fontWeight: "700", color: DS_COLORS.textPrimary },
  modeSubtitle: { fontSize: 12, color: DS_COLORS.textSecondary, marginTop: 2 },
  errorText: { fontSize: 13, color: DS_COLORS.ERROR_RED, marginTop: 6 },
  btn: {
    marginTop: DS_SPACING.lg,
    paddingVertical: 17,
    borderRadius: 28,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 17, fontWeight: "700", color: DS_COLORS.white },
});
