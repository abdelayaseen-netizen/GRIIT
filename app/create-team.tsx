/**
 * Modal: create a new team. Pro-gated via Teams tab.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useCreateTeam } from "@/hooks/useTeams";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";

const MAX_NAME_LEN = 30;

export default function CreateTeamScreen() {
  const router = useRouter();
  const createTeam = useCreateTeam();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= MAX_NAME_LEN;

  const handleCreate = () => {
    setError(null);
    if (!valid) {
      setError(trimmed.length > MAX_NAME_LEN ? `Team name must be ${MAX_NAME_LEN} characters or less.` : "Enter a team name.");
      return;
    }
    createTeam.mutate(trimmed, {
      onSuccess: () => {
        router.back();
        router.replace("/(tabs)/teams" as never);
      },
      onError: (e: Error) => {
        setError(e.message ?? "Could not create team.");
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <Text style={styles.label}>Team name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning Crew"
          placeholderTextColor={DS_COLORS.inputPlaceholder}
          maxLength={MAX_NAME_LEN}
          autoCapitalize="words"
        />
        <Text style={styles.hint}>{name.length}/{MAX_NAME_LEN}</Text>
        {error ? <Text style={[styles.error, { color: DS_COLORS.errorText }]}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: DS_COLORS.ACCENT_PRIMARY }, (!valid || createTeam.isPending) && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={!valid || createTeam.isPending}
          accessibilityRole="button"
          accessibilityLabel="Create team"
        >
          {createTeam.isPending ? (
            <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
          ) : (
            <Text style={styles.btnText}>Create team</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1, padding: DS_SPACING.screenHorizontal ?? 20 },
  label: { fontSize: 15, fontWeight: "600", color: DS_COLORS.textPrimary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: DS_RADIUS.input,
    padding: DS_SPACING.lg,
    fontSize: 16,
    color: DS_COLORS.textPrimary,
    marginBottom: 4,
  },
  hint: { fontSize: 12, color: DS_COLORS.textMuted, marginBottom: 16 },
  error: { fontSize: 14, marginBottom: 12 },
  btn: {
    paddingVertical: 16,
    borderRadius: DS_RADIUS.button,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 17, fontWeight: "700", color: DS_COLORS.WHITE },
});
