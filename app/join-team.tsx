/**
 * Modal: join a team with 8-character invite code. Pro-gated via Teams tab.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useJoinTeam } from "@/hooks/useTeams";
import { DS_COLORS, DS_SPACING, DS_RADIUS } from "@/lib/design-system";

const CODE_LEN = 8;

export default function JoinTeamScreen() {
  const router = useRouter();
  const joinTeam = useJoinTeam();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalized = code.trim().toUpperCase().slice(0, CODE_LEN);
  const valid = normalized.length === CODE_LEN;

  const handleJoin = () => {
    setError(null);
    if (!valid) {
      setError("Enter the 8-character invite code.");
      return;
    }
    joinTeam.mutate(normalized, {
      onSuccess: () => {
        router.back();
        router.replace("/(tabs)/teams" as never);
      },
      onError: (e: Error) => {
        const msg = e.message ?? "";
        if (msg.includes("not found") || msg.includes("NOT_FOUND")) setError("Team not found.");
        else if (msg.includes("full") || msg.includes("5/5")) setError("Team is full (5/5 members).");
        else setError(msg || "Could not join team.");
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <Text style={styles.label}>Invite code</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LEN))}
          placeholder="XXXXXXXX"
          placeholderTextColor={DS_COLORS.inputPlaceholder}
          maxLength={CODE_LEN}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        {error ? <Text style={[styles.error, { color: DS_COLORS.errorText }]}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: DS_COLORS.ACCENT_PRIMARY }, (!valid || joinTeam.isPending) && styles.btnDisabled]}
          onPress={handleJoin}
          disabled={!valid || joinTeam.isPending}
          accessibilityRole="button"
          accessibilityLabel="Join team"
        >
          {joinTeam.isPending ? (
            <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
          ) : (
            <Text style={styles.btnText}>Join team</Text>
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
    fontSize: 18,
    color: DS_COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: 16,
  },
  error: { fontSize: 14, marginBottom: 12 },
  btn: {
    paddingVertical: 16,
    borderRadius: DS_RADIUS.button,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 17, fontWeight: "700", color: DS_COLORS.WHITE },
});
