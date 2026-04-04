import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Check, Clock, XCircle } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

export interface TeamMemberForList {
  id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  profiles?: { display_name?: string | null; username?: string | null; avatar_url?: string | null } | null;
  secured_today?: boolean;
  tasks_completed?: number;
  tasks_total?: number;
}

interface TeamMemberListProps {
  members: TeamMemberForList[];
  currentUserId: string | undefined;
  runStatus: string;
}

function getDisplayName(m: TeamMemberForList): string {
  const p = m.profiles;
  return (p?.display_name ?? p?.username ?? "Someone").trim() || "Someone";
}

function MemberRow({ member, isCurrentUser, runStatus }: { member: TeamMemberForList; isCurrentUser: boolean; runStatus: string }) {
  const { colors } = useTheme();
  const name = getDisplayName(member);
  const isCreator = member.role === "creator";

  let statusLabel = "—";
  let StatusIcon = null;
  if (runStatus === "active") {
    if (member.secured_today === true) {
      statusLabel = "Secured";
      StatusIcon = <Check size={14} color={colors.success} />;
    } else if (member.tasks_total != null && member.tasks_total > 0) {
      const done = member.tasks_completed ?? 0;
      statusLabel = `${done} of ${member.tasks_total} tasks`;
      StatusIcon = <Clock size={14} color={colors.text.tertiary} />;
    } else {
      statusLabel = "In progress";
      StatusIcon = <Clock size={14} color={colors.text.tertiary} />;
    }
  } else if (runStatus === "failed") {
    if (!member.secured_today && member.tasks_total != null && member.tasks_total > 0) {
      statusLabel = "Missed";
      StatusIcon = <XCircle size={14} color={DS_COLORS.dangerDark} />;
    }
  }

  const avatarUrl = member.profiles?.avatar_url;
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.pill }]}>
            <Text style={[styles.avatarLetter, { color: colors.text.secondary }]}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
            {name}
            {isCurrentUser ? " (you)" : ""}
          </Text>
          {isCreator && (
            <View style={[styles.creatorBadge, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.creatorText, { color: colors.accent }]}>Creator</Text>
            </View>
          )}
        </View>
        <View style={styles.statusRow}>
          {StatusIcon}
          <Text style={[styles.statusText, { color: colors.text.secondary }]}>{statusLabel}</Text>
        </View>
      </View>
    </View>
  );
}

export default function TeamMemberList({ members, currentUserId, runStatus }: TeamMemberListProps) {
  const { colors } = useTheme();

  const sorted = useMemo(() => {
    const list = [...members];
    list.sort((a, b) => {
      if (a.role === "creator" && b.role !== "creator") return -1;
      if (b.role === "creator" && a.role !== "creator") return 1;
      const aSecured = a.secured_today === true ? 1 : 0;
      const bSecured = b.secured_today === true ? 1 : 0;
      if (aSecured !== bSecured) return bSecured - aSecured;
      return 0;
    });
    return list;
  }, [members]);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Team members</Text>
      {sorted.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>Waiting for teammates...</Text>
        </View>
      ) : null}
      {sorted.map((member, index) => (
        <View
          key={member.id}
          style={[styles.rowWrap, index < sorted.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
        >
          <MemberRow member={member} isCurrentUser={member.user_id === currentUserId} runStatus={runStatus} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DS_RADIUS.button,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    marginBottom: 12,
  },
  emptyWrap: {
    paddingVertical: 16,
    minHeight: 60,
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  rowWrap: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: DS_RADIUS.XL,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: DS_RADIUS.XL,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    flex: 1,
  },
  creatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: DS_RADIUS.featuredBadge,
  },
  creatorText: {
    fontSize: 11,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
