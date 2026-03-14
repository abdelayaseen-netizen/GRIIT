import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Users, Trophy, AlertTriangle, Play, Share2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS } from "@/lib/design-system";

export type RunStatus = "waiting" | "active" | "completed" | "failed";

interface TeamStatusHeaderProps {
  runStatus: RunStatus;
  teamSize: number;
  memberCount: number;
  currentDay?: number;
  durationDays?: number;
  isCreator: boolean;
  failedReason?: string;
  failedMemberName?: string;
  onStartChallenge?: () => void;
  onInvite?: () => void;
}

export default function TeamStatusHeader({
  runStatus,
  teamSize,
  memberCount,
  currentDay = 0,
  durationDays = 0,
  isCreator,
  failedReason,
  failedMemberName,
  onStartChallenge,
  onInvite,
}: TeamStatusHeaderProps) {
  const { colors } = useTheme();

  const handleStart = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartChallenge?.();
  };

  const handleInvite = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onInvite?.();
  };

  if (runStatus === "waiting") {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Users size={20} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Waiting for team — {memberCount} of {teamSize} members joined
          </Text>
        </View>
        <View style={styles.actions}>
          {isCreator && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
              onPress={handleStart}
              activeOpacity={0.85}
            >
              <Play size={16} color={DS_COLORS.white} />
              <Text style={styles.primaryBtnText}>Start Challenge</Text>
            </TouchableOpacity>
          )}
          {memberCount < teamSize && (
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={handleInvite}
              activeOpacity={0.7}
            >
              <Share2 size={16} color={colors.accent} />
              <Text style={[styles.secondaryBtnText, { color: colors.accent }]}>Invite</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (runStatus === "active") {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Users size={20} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Team Challenge — Day {currentDay} of {durationDays}
          </Text>
        </View>
      </View>
    );
  }

  if (runStatus === "completed") {
    return (
      <View style={[styles.card, styles.celebration, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
        <View style={styles.row}>
          <Trophy size={22} color={colors.success} />
          <Text style={[styles.title, { color: colors.success }]}>Challenge Complete! 🏆</Text>
        </View>
      </View>
    );
  }

  if (runStatus === "failed") {
    return (
      <View style={[styles.card, styles.failed, { backgroundColor: DS_COLORS.dangerSoft, borderColor: DS_COLORS.dangerDark }]}>
        <View style={styles.row}>
          <AlertTriangle size={20} color={DS_COLORS.dangerDark} />
          <Text style={[styles.title, { color: DS_COLORS.dangerDark }]}>Challenge Failed</Text>
        </View>
        {failedReason && <Text style={styles.failedReason}>{failedReason}</Text>}
        {failedMemberName && <Text style={styles.failedMember}>{failedMemberName} didn&apos;t complete their tasks.</Text>}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: DS_COLORS.white,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  celebration: {},
  failed: {},
  failedReason: {
    fontSize: 13,
color: DS_COLORS.dangerDark,
  marginTop: 8,
  },
  failedMember: {
    fontSize: 13,
    color: DS_COLORS.dangerDarkest,
    marginTop: 4,
  },
});
