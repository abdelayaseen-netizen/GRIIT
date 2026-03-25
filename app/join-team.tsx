import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useAuth } from "@/contexts/AuthContext";
import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";

export default function JoinTeamScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ team_id?: string; invite_id?: string }>();
  const teamId = typeof params.team_id === "string" ? params.team_id : "";
  const inviteId = typeof params.invite_id === "string" ? params.invite_id : undefined;
  const [status, setStatus] = useState<"idle" | "joining" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setStatus("error");
      setErrorMessage("Invalid invite link.");
      return;
    }
    if (!user?.id) {
      router.replace(ROUTES.AUTH_LOGIN as never);
      return;
    }
    let active = true;
    const run = async () => {
      setStatus("joining");
      try {
        const team = await trpcMutate(TRPC.team.joinByLink, { team_id: teamId, invite_id: inviteId }) as { challenge_id: string };
        if (!active) return;
        router.replace(`/challenge/${team.challenge_id}` as never);
      } catch (error) {
        if (!active) return;
        captureError(error, "JoinTeamByLink");
        console.error("[JoinTeam] joinByLink failed:", error);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Could not join this team.");
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [teamId, inviteId, user?.id, router]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {status === "joining" ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={DS_COLORS.DISCOVER_CORAL} />
          <Text style={styles.text}>Joining team...</Text>
        </View>
      ) : status === "error" ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Could not join team</Text>
          <Text style={styles.errorBody}>{errorMessage ?? "Please try again."}</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace("/team-invite" as never)}
            accessibilityRole="button"
            accessibilityLabel="Enter team code manually"
          >
            <Text style={styles.primaryBtnText}>Enter code manually</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace(ROUTES.TABS as never)}
            accessibilityRole="button"
            accessibilityLabel="Go to home"
          >
            <Text style={styles.secondaryBtnText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.TROPHY_ICON_WRAP_BG },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: DS_SPACING.screenHorizontal },
  text: { marginTop: 12, fontSize: 14, color: DS_COLORS.textSecondary },
  errorTitle: { fontSize: 20, fontWeight: "700", color: DS_COLORS.challengeHeaderDark, marginBottom: 8 },
  errorBody: { fontSize: 14, color: DS_COLORS.textSecondary, textAlign: "center", marginBottom: 16 },
  primaryBtn: {
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
    minWidth: 220,
    alignItems: "center",
  },
  primaryBtnText: { color: DS_COLORS.white, fontWeight: "700", fontSize: 15 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: DS_COLORS.DISABLED_BG,
    borderRadius: DS_RADIUS.buttonPill,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minWidth: 220,
    alignItems: "center",
    backgroundColor: DS_COLORS.white,
  },
  secondaryBtnText: { color: DS_COLORS.textSecondary, fontWeight: "600", fontSize: 14 },
});
