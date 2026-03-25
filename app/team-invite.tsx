import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clipboard as ClipboardIcon, Share2, X } from "lucide-react-native";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";
import { relativeTime } from "@/lib/utils/relativeTime";

type Member = {
  id: string;
  user_id: string;
  role: "creator" | "member";
  joined_at: string;
  profiles?: { display_name?: string | null; username?: string | null } | null;
};

export default function TeamInviteScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    team_id?: string;
    challenge_id?: string;
    team_code?: string;
    max_members?: string;
  }>();

  const teamId = typeof params.team_id === "string" ? params.team_id : "";
  const challengeId = typeof params.challenge_id === "string" ? params.challenge_id : "";
  const maxMembers = Number(params.max_members ?? "5");
  const [copied, setCopied] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinPending, setJoinPending] = useState(false);
  const [sharePending, setSharePending] = useState(false);

  const membersQuery = useQuery({
    queryKey: ["team", "members", teamId],
    queryFn: () => trpcQuery(TRPC.team.getMembers, { team_id: teamId }) as Promise<Member[]>,
    enabled: !!teamId,
  });

  const teamCode = useMemo(() => {
    if (typeof params.team_code === "string" && params.team_code.length === 6) return params.team_code.toUpperCase();
    const creatorTeam = membersQuery.data?.[0] as unknown;
    return (creatorTeam as { team_code?: string })?.team_code?.toUpperCase?.() ?? "";
  }, [params.team_code, membersQuery.data]);

  useEffect(() => {
    if (joinCodeInput.length !== 6 || joinPending) return;
    const run = async () => {
      setJoinPending(true);
      setJoinError(null);
      try {
        const team = await trpcMutate(TRPC.team.joinByCode, { team_code: joinCodeInput.toUpperCase() }) as { id: string };
        setJoinCodeInput("");
        await queryClient.invalidateQueries({ queryKey: ["team", "members", team.id] });
      } catch (error) {
        console.error("[TeamInvite] joinByCode failed:", error);
        setJoinError(error instanceof Error ? error.message : "Could not join with code.");
      } finally {
        setJoinPending(false);
      }
    };
    void run();
  }, [joinCodeInput, joinPending, queryClient]);

  const onCopy = async () => {
    if (!teamCode) return;
    await Clipboard.setStringAsync(teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onShare = async () => {
    if (!teamId) return;
    setSharePending(true);
    try {
      const payload = await trpcMutate(TRPC.team.generateInviteLink, { team_id: teamId }) as {
        webLink: string;
        deepLink: string;
        teamCode: string;
      };
      await Share.share({
        message: `Join my team on GRIIT! Use code ${payload.teamCode} or tap: ${payload.webLink}`,
      });
    } catch (error) {
      console.error("[TeamInvite] Share failed:", error);
    } finally {
      setSharePending(false);
    }
  };

  const members = membersQuery.data ?? [];
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Invite teammates</Text>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home" as never))} accessibilityLabel="Close invite screen" accessibilityRole="button">
          <X size={18} color={DS_COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.codeCard} accessibilityLabel={`Team code: ${teamCode || "Loading"}`} accessibilityRole="text">
        <Text style={styles.codeLabel}>Share this code</Text>
        <Text style={styles.code}>{teamCode || "------"}</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={onCopy} accessibilityRole="button" accessibilityLabel="Copy team code to clipboard">
          {copied ? <Check size={14} color={DS_COLORS.success} /> : <ClipboardIcon size={14} color={DS_COLORS.textSecondary} />}
          <Text style={styles.copyText}>{copied ? "Copied!" : "Copy"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.orText}>or</Text><View style={styles.divider} /></View>

      <TouchableOpacity
        style={styles.shareBtn}
        onPress={() => void onShare()}
        disabled={sharePending}
        accessibilityRole="button"
        accessibilityLabel="Share invite link"
      >
        {sharePending ? <ActivityIndicator color={DS_COLORS.textPrimary} /> : <Share2 size={16} color={DS_COLORS.textPrimary} />}
        <Text style={styles.shareText}>Share invite link</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.orText}>or</Text><View style={styles.divider} /></View>

      <Text style={styles.sectionLabel}>Have a team code?</Text>
      <TextInput
        style={styles.codeInput}
        value={joinCodeInput}
        onChangeText={(txt) => setJoinCodeInput(txt.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
        maxLength={6}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder="A7KX3M"
        placeholderTextColor={DS_COLORS.textMuted}
        accessibilityRole="text"
        accessibilityLabel="Enter team code"
      />
      {joinError ? <Text style={styles.errorText}>{joinError}</Text> : null}

      <Text style={styles.membersLabel}>Team members ({members.length}/{Number.isFinite(maxMembers) ? maxMembers : 5})</Text>
      <View style={styles.memberList}>
        {membersQuery.isPending ? (
          <ActivityIndicator color={DS_COLORS.DISCOVER_CORAL} />
        ) : members.length <= 1 ? (
          <Text style={styles.waiting}>Waiting for teammates to join...</Text>
        ) : (
          members.map((member) => {
            const name = member.profiles?.display_name ?? member.profiles?.username ?? "Member";
            return (
              <View key={member.id} style={styles.memberRow} accessibilityRole="text" accessibilityLabel={`${name}, ${member.role}`}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
                <View style={styles.memberInfo}>
                  <View style={styles.memberTopRow}>
                    <Text style={styles.memberName}>{name}</Text>
                    {member.role === "creator" ? (
                      <View style={styles.creatorPill}><Text style={styles.creatorPillText}>Creator</Text></View>
                    ) : null}
                  </View>
                  <Text style={styles.memberMeta}>Joined {relativeTime(member.joined_at)}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() => router.replace(challengeId ? `/challenge/${challengeId}` as never : "/(tabs)/teams" as never)}
        accessibilityRole="button"
        accessibilityLabel="Done, go to team challenge"
      >
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.TROPHY_ICON_WRAP_BG, paddingHorizontal: DS_SPACING.screenHorizontal, paddingBottom: DS_SPACING.lg },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: DS_SPACING.sm, marginBottom: DS_SPACING.md },
  title: { fontSize: 24, fontWeight: "700", color: DS_COLORS.challengeHeaderDark },
  codeCard: {
    backgroundColor: DS_COLORS.white,
    borderRadius: DS_RADIUS.card,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  codeLabel: { fontSize: 13, color: DS_COLORS.textSecondary },
  code: { fontSize: 36, fontWeight: "700", color: DS_COLORS.challengeHeaderDark, letterSpacing: 6, marginTop: 8, marginBottom: 12 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: DS_COLORS.DISABLED_BG,
    borderRadius: DS_RADIUS.buttonPill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  copyText: { fontSize: 13, color: DS_COLORS.textSecondary, fontWeight: "600" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 16 },
  divider: { flex: 1, height: 1, backgroundColor: DS_COLORS.DISCOVER_DIVIDER },
  orText: { fontSize: 12, color: DS_COLORS.textMuted },
  shareBtn: {
    backgroundColor: DS_COLORS.white,
    borderWidth: 1.5,
    borderColor: DS_COLORS.DISABLED_BG,
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
  },
  shareText: { fontSize: 14, fontWeight: "600", color: DS_COLORS.textPrimary },
  sectionLabel: { fontSize: 13, color: DS_COLORS.textSecondary, marginBottom: 8 },
  codeInput: {
    backgroundColor: DS_COLORS.white,
    borderRadius: DS_RADIUS.input,
    borderWidth: 1.5,
    borderColor: DS_COLORS.BORDER_DEFAULT,
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
    color: DS_COLORS.challengeHeaderDark,
    paddingVertical: 12,
    marginBottom: 8,
  },
  errorText: { fontSize: 13, color: DS_COLORS.ERROR_RED, marginBottom: 8 },
  membersLabel: { fontSize: 15, fontWeight: "700", color: DS_COLORS.challengeHeaderDark, marginTop: 4, marginBottom: 8 },
  memberList: { backgroundColor: DS_COLORS.white, borderRadius: DS_RADIUS.card, borderWidth: 1, borderColor: DS_COLORS.border, paddingHorizontal: 12, paddingVertical: 8 },
  waiting: { color: DS_COLORS.textSecondary, fontSize: 13, paddingVertical: 12 },
  memberRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: DS_COLORS.DISCOVER_DIVIDER },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: DS_COLORS.ACCENT_TINT, alignItems: "center", justifyContent: "center" },
  avatarText: { color: DS_COLORS.DISCOVER_CORAL, fontWeight: "700" },
  memberInfo: { marginLeft: 10, flex: 1 },
  memberTopRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  memberName: { fontSize: 14, color: DS_COLORS.challengeHeaderDark, fontWeight: "600" },
  creatorPill: { borderRadius: 10, backgroundColor: DS_COLORS.surfaceMuted, paddingHorizontal: 8, paddingVertical: 2 },
  creatorPillText: { fontSize: 11, color: DS_COLORS.textSecondary, fontWeight: "600" },
  memberMeta: { fontSize: 11, color: DS_COLORS.grayMedium, marginTop: 2 },
  doneBtn: {
    marginTop: DS_SPACING.lg,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: "center",
  },
  doneText: { fontSize: 17, color: DS_COLORS.white, fontWeight: "700" },
});
