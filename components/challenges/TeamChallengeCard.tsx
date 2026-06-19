import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { Avatar } from "@/components/Avatar";
import {
  getCategoryStyle,
  difficultyDescriptive,
  dayUnit,
  type ChallengeCategory as TeamChallengeCategory,
  type ChallengeDifficulty as TeamChallengeDifficulty,
} from "./_card-helpers";

export type { TeamChallengeCategory, TeamChallengeDifficulty };

export interface TeamChallengeCardData {
  id: string;
  slug: string | null;
  name: string;
  duration_days: number;
  difficulty: TeamChallengeDifficulty;
  category: TeamChallengeCategory;
  /** Total team capacity (e.g. 6). null when unknown. */
  team_size: number | null;
  /** Current filled spots (participants_count). */
  filled_spots: number;
  /** Up to 3 preview members (already-joined teammates). */
  team_preview: { user_id: string; username: string | null; avatar_url: string | null }[];
}

export interface TeamChallengeCardProps {
  data: TeamChallengeCardData;
  onJoin?: (id: string) => void;
}

const PREVIEW_AVATAR_SIZE = 24;

export const TeamChallengeCard = React.memo(function TeamChallengeCard({
  data,
  onJoin,
}: TeamChallengeCardProps) {
  const router = useRouter();
  const cat = getCategoryStyle(data.category);
  const CatIcon = cat.Icon;
  const totalSpots = Math.max(1, Number(data.team_size ?? 4));
  const filled = Math.max(0, Math.min(totalSpots, Number(data.filled_spots ?? 0)));
  const remaining = Math.max(0, totalSpots - filled);
  const previews = (data.team_preview ?? []).slice(0, 3);

  const metaLine = `${filled} of ${totalSpots} spots · ${data.duration_days} ${dayUnit(
    data.duration_days
  )} · ${difficultyDescriptive(data.difficulty)}`;
  const a11yCard = `${data.name}, team challenge, ${filled} of ${totalSpots} spots filled, ${data.duration_days} ${dayUnit(
    data.duration_days
  )}, ${difficultyDescriptive(data.difficulty)}, tap to join`;
  const a11yJoin = `Join ${data.name}`;

  const target = (data.slug ?? data.id).trim() || data.id;
  const goToDetail = () => {
    if (!target) return;
    router.push(ROUTES.CHALLENGE_ID(target) as never);
  };
  const handleJoin = () => {
    if (onJoin) onJoin(data.id);
    else goToDetail();
  };

  return (
    <Pressable
      onPress={goToDetail}
      accessibilityRole="button"
      accessibilityLabel={a11yCard}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={[styles.iconTile, { backgroundColor: cat.tint }]}>
          <CatIcon size={18} color={cat.iconColor} strokeWidth={2} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {data.name}
            </Text>
            <View style={styles.teamBadge}>
              <Text style={styles.teamBadgeText}>TEAM</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.avatarStack}>
              {previews.map((p, i) => (
                <Avatar
                  key={p.user_id}
                  url={p.avatar_url}
                  name={p.username ?? "?"}
                  userId={p.user_id}
                  size={PREVIEW_AVATAR_SIZE}
                  style={[
                    styles.stackedAvatar,
                    i === 0 ? null : { marginLeft: -8 },
                  ]}
                />
              ))}
              {remaining > 0 ? (
                <View
                  style={[
                    styles.emptySlot,
                    previews.length > 0 ? { marginLeft: -8 } : null,
                  ]}
                >
                  <Plus size={12} color={DS_COLORS.ACCENT} strokeWidth={2} />
                </View>
              ) : null}
            </View>
            <Text style={styles.meta} numberOfLines={1}>
              {metaLine}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleJoin}
          accessibilityRole="button"
          accessibilityLabel={a11yJoin}
          style={styles.joinPill}
        >
          <Text style={styles.joinText}>Join</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    borderColor: DS_COLORS.ACCENT_TINT_BORDER,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.md,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: DS_RADIUS.MD,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    flexShrink: 1,
  },
  teamBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  teamBadgeText: {
    fontSize: 9,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    letterSpacing: 0.6,
    color: DS_COLORS.ACCENT,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  stackedAvatar: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: DS_COLORS.WHITE,
  },
  emptySlot: {
    width: PREVIEW_AVATAR_SIZE,
    height: PREVIEW_AVATAR_SIZE,
    borderRadius: PREVIEW_AVATAR_SIZE / 2,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: DS_COLORS.ACCENT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.WHITE,
  },
  meta: {
    flex: 1,
    fontSize: 11,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  joinPill: {
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: 8,
    borderRadius: DS_RADIUS.PILL,
    backgroundColor: DS_COLORS.ACCENT,
  },
  joinText: {
    fontSize: 12,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_ON_ACCENT,
  },
});
