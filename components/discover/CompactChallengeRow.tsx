import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  Book,
  Layout,
  Wind,
  FileText,
  Droplet,
  Dumbbell,
  Moon,
  Heart,
  Users,
  ChevronRight,
} from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";

export interface CompactChallengeRowProps {
  id: string;
  title: string;
  duration: number;
  difficulty: "EASY" | "MED" | "HARD";
  participantCount: number;
  category?: string;
  isTeam?: boolean;
  teamSize?: string;
  onPressIn?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  prayer: Book,
  bed: Layout,
  breath: Wind,
  journal: FileText,
  hydration: Droplet,
  fitness: Dumbbell,
  sleep: Moon,
  default: Heart,
};

function categoryIconKey(category?: string): string {
  const c = String(category ?? "").toLowerCase();
  if (c.includes("fitness")) return "fitness";
  if (c.includes("faith") || c.includes("prayer")) return "prayer";
  if (c.includes("mind") || c.includes("journal")) return "journal";
  if (c.includes("sleep")) return "sleep";
  if (c.includes("hydrat") || c.includes("water")) return "hydration";
  if (c.includes("breath")) return "breath";
  if (c.includes("bed")) return "bed";
  return "default";
}

function getIcon(category?: string, isTeam?: boolean): React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> {
  if (isTeam) return Users;
  const k = categoryIconKey(category);
  const Icon = (CATEGORY_ICONS as Record<string, typeof Heart>)[k] ?? Heart;
  return Icon;
}

function CompactChallengeRowInner({
  id,
  title,
  duration,
  difficulty,
  participantCount,
  category,
  isTeam,
  teamSize,
  onPressIn,
}: CompactChallengeRowProps) {
  const router = useRouter();
  const Icon = getIcon(category, isTeam);

  const iconColor = isTeam ? DS_COLORS.DISCOVER_V3_TEAM_ROW_ACCENT : DS_COLORS.DISCOVER_V3_ICON_MUTED;

  const durationLabel = duration >= 7 ? `${Math.round(duration / 7)}w` : `${duration}d`;

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    return String(n);
  };

  const handlePress = () => {
    router.push(ROUTES.CHALLENGE_ID(id) as never);
  };

  const showSoloActive = !isTeam && participantCount >= 10;

  return (
    <Pressable
      onPressIn={onPressIn}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${duration} days, ${difficulty}, ${isTeam ? "team challenge" : `${participantCount} participants`}`}
      style={styles.row}
    >
      <View style={styles.icon}>
        <Icon size={16} color={iconColor} strokeWidth={1.5} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta}>
          {isTeam && teamSize ? `${teamSize} · ` : ""}
          {durationLabel} · {difficulty}
          {showSoloActive ? ` · ${formatCount(participantCount)} active` : ""}
        </Text>
      </View>

      <View style={styles.right}>
        {isTeam ? (
          <View>
            <View style={styles.joinButton}>
              <Text style={styles.joinText}>Invite</Text>
            </View>
          </View>
        ) : (
          <ChevronRight size={16} color={DS_COLORS.PROFILE_TEXT_MUTED} strokeWidth={1.5} />
        )}
      </View>
    </Pressable>
  );
}

export const CompactChallengeRow = React.memo(CompactChallengeRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: DS_COLORS.SURFACE,
    padding: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  meta: {
    fontSize: 11,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
  },
  joinButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  joinText: {
    fontSize: 10,
    fontWeight: "600",
    color: DS_COLORS.PRIMARY,
  },
});
