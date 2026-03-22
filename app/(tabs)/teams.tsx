/**
 * Teams tab: accountability squads. Pro-gated (TEAMS_ACCESS).
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Users, Copy, LogOut, Check } from "lucide-react-native";
import { useMyTeam, useTeamFeed, useLeaveTeam } from "@/hooks/useTeams";
import { useProStatus } from "@/hooks/useProStatus";
import { checkGate, GATES } from "@/lib/feature-gates";
import { InitialCircle } from "@/src/components/ui";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";
import { DS_COLORS, DS_SPACING, DS_RADIUS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { EmptyState } from "@/components/EmptyState";
import { ErrorRetry } from "@/components/ErrorRetry";

export default function TeamsTabScreen() {
  const router = useRouter();
  const { isPro } = useProStatus();
  const teamsQuery = useMyTeam();
  const leaveMutation = useLeaveTeam();
  const [copied, setCopied] = useState(false);

  const myTeam = teamsQuery.data;
  const teamId = myTeam?.team?.id ?? null;
  const teamFeedQuery = useTeamFeed(teamId);

  const canAccessTeams = checkGate(GATES.TEAMS_ACCESS, isPro);

  const onRefresh = useCallback(() => {
    teamsQuery.refetch();
    if (teamId) teamFeedQuery.refetch();
  }, [teamsQuery, teamFeedQuery, teamId]);

  const handleCopyInvite = useCallback(async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleCreatePress = useCallback(() => {
    if (!canAccessTeams) {
      router.push(ROUTES.PAYWALL as never);
      return;
    }
    router.push("/create-team" as never);
  }, [canAccessTeams, router]);

  const handleJoinPress = useCallback(() => {
    if (!canAccessTeams) {
      router.push(ROUTES.PAYWALL as never);
      return;
    }
    router.push("/join-team" as never);
  }, [canAccessTeams, router]);

  const handleLeave = useCallback(() => {
    if (!myTeam?.team?.id) return;
    Alert.alert(
      "Leave team?",
      "You will need a new invite code to rejoin.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            leaveMutation.mutate(myTeam.team.id);
          },
        },
      ]
    );
  }, [myTeam?.team?.id, leaveMutation]);

  // State C — Loading
  if (teamsQuery.isLoading && !teamsQuery.data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={DS_COLORS.ACCENT_PRIMARY} accessibilityLabel="Loading teams" />
        </View>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
      </SafeAreaView>
    );
  }

  if (teamsQuery.isError && !myTeam?.team) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
          refreshControl={<RefreshControl refreshing={teamsQuery.isRefetching} onRefresh={onRefresh} tintColor={DS_COLORS.ACCENT_PRIMARY} />}
        >
          <ErrorRetry message="Couldn't load teams" onRetry={() => void teamsQuery.refetch()} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // State A — No team
  if (!myTeam?.team) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={teamsQuery.isRefetching} onRefresh={onRefresh} tintColor={DS_COLORS.ACCENT_PRIMARY} />}
        >
          <EmptyState
            icon={Users}
            title="No teams yet"
            subtitle="Create or join a team to challenge together"
            action={{
              label: "Create a team",
              onPress: handleCreatePress,
            }}
          />
          <Text style={styles.heading}>Find your squad</Text>
          <Text style={styles.subtext}>Accountability partners increase your success rate by 2×</Text>
          <View style={styles.cardsRow}>
            <TouchableOpacity
              style={[styles.card, styles.cardHalf]}
              onPress={handleCreatePress}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Create a team"
            >
              <Users size={28} color={DS_COLORS.ACCENT_PRIMARY} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Create a team</Text>
              <Text style={styles.cardSub}>You become owner, enter team name</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.card, styles.cardHalf]}
              onPress={handleJoinPress}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Join a team"
            >
              <Users size={28} color={DS_COLORS.ACCENT_PRIMARY} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Join a team</Text>
              <Text style={styles.cardSub}>Enter 8-character invite code</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // State B — Has team
  const { team, members } = myTeam;
  const feedItems = teamFeedQuery.data ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={teamsQuery.isRefetching || teamFeedQuery.isRefetching} onRefresh={onRefresh} tintColor={DS_COLORS.ACCENT_PRIMARY} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.teamName}>{team.name}</Text>
          <TouchableOpacity
            onPress={handleLeave}
            style={styles.leaveBtn}
            accessibilityLabel="Leave team"
            accessibilityRole="button"
          >
            <LogOut size={20} color={DS_COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.invitePill}
          onPress={() => handleCopyInvite(team.invite_code)}
          accessibilityLabel={`Invite code ${team.invite_code}. Double tap to copy.`}
          accessibilityRole="button"
        >
          <Text style={styles.inviteLabel}>Invite code: </Text>
          <Text style={styles.inviteCode}>{team.invite_code}</Text>
          {copied ? <Check size={16} color={DS_COLORS.success} /> : <Copy size={16} color={DS_COLORS.textMuted} />}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Members</Text>
        <View style={styles.memberList}>
          {members.map((m) => (
            <View key={m.user_id} style={styles.memberRow}>
              <InitialCircle username={m.username ?? m.display_name ?? "?"} size={40} />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{m.display_name ?? m.username ?? "Member"}</Text>
                <Text style={styles.memberMeta}>
                  {m.today_completion_count > 0 ? (
                    <Text style={styles.memberDone}>✓ Today</Text>
                  ) : (
                    <Text style={styles.memberDash}>—</Text>
                  )}
                  {" · "}Streak: {m.current_streak}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Team feed</Text>
        <View style={styles.feedList}>
          {feedItems.length === 0 ? (
            <Text style={styles.feedEmpty}>No completions yet. Complete a task to show up here.</Text>
          ) : (
            feedItems.map((item) => (
              <View key={item.id} style={styles.feedRow}>
                <Text style={styles.feedText}>
                  <Text style={styles.feedUser}>{item.display_name ?? item.username}</Text>
                  {" completed "}
                  <Text style={styles.feedTask}>{item.task_title}</Text>
                  {" · "}
                  <Text style={styles.feedTime}>{formatTimeAgoCompact(item.created_at)} ago</Text>
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: DS_SPACING.screenHorizontal ?? 20, paddingBottom: DS_SPACING.section },
  skeletonHeader: { height: 32, backgroundColor: DS_COLORS.surfaceMuted, borderRadius: 8, marginBottom: 16 },
  skeletonCard: { height: 100, backgroundColor: DS_COLORS.surfaceMuted, borderRadius: DS_RADIUS.card, marginBottom: 12 },
  heading: { fontSize: 22, fontWeight: "700", color: DS_COLORS.textPrimary, marginBottom: 8 },
  subtext: { fontSize: 15, color: DS_COLORS.textSecondary, marginBottom: 24 },
  cardsRow: { flexDirection: "row", gap: 12 },
  card: {
    flex: 1,
    backgroundColor: DS_COLORS.darkSurface ?? DS_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.lg,
    borderWidth: 1,
    borderColor: DS_COLORS.ACCENT_PRIMARY,
  },
  cardHalf: { minWidth: 0 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: DS_COLORS.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 13, color: DS_COLORS.textSecondary },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  teamName: { fontSize: 22, fontWeight: "700", color: DS_COLORS.textPrimary },
  leaveBtn: { padding: 8 },
  invitePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: DS_COLORS.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: DS_RADIUS.pill,
    marginBottom: 24,
    gap: 6,
  },
  inviteLabel: { fontSize: 13, color: DS_COLORS.textSecondary },
  inviteCode: { fontSize: 14, fontWeight: "700", color: DS_COLORS.textPrimary },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: DS_COLORS.textPrimary, marginBottom: 12 },
  memberList: { marginBottom: 24 },
  memberRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  memberInfo: { marginLeft: 12, flex: 1 },
  memberName: { fontSize: 16, fontWeight: "600", color: DS_COLORS.textPrimary },
  memberMeta: { fontSize: 13, color: DS_COLORS.textMuted },
  memberDone: { color: DS_COLORS.success },
  memberDash: { color: DS_COLORS.textMuted },
  feedList: { marginBottom: 24 },
  feedRow: { paddingVertical: 8 },
  feedText: { fontSize: 14, color: DS_COLORS.textSecondary },
  feedUser: { fontWeight: "600", color: DS_COLORS.textPrimary },
  feedTask: { color: DS_COLORS.textSecondary },
  feedTime: { color: DS_COLORS.textMuted },
  feedEmpty: { fontSize: 14, color: DS_COLORS.textMuted },
  loadingCenter: { paddingTop: 24, alignItems: "center" },
  cardIcon: { marginBottom: 8 },
});
