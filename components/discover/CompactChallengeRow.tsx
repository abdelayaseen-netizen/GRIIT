import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { Book, Layout, Wind, FileText, Droplet, Dumbbell, Moon, Heart, Users } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";

export interface CompactChallengeRowProps {
  id: string;
  title: string;
  duration: number;
  difficulty: "EASY" | "MED" | "HARD";
  participantCount: number;
  completionRate: number;
  badgeName?: string;
  category?: string;
  isTeam?: boolean;
  teamSize?: string;
  inviteText?: string;
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

export function CompactChallengeRow({
  id,
  title,
  duration,
  difficulty,
  participantCount,
  completionRate,
  badgeName,
  category,
  isTeam,
  teamSize,
  inviteText,
  onPressIn,
}: CompactChallengeRowProps) {
  const router = useRouter();
  const Icon = getIcon(category, isTeam);

  const borderColor = isTeam
    ? DS_COLORS.DISCOVER_V3_TEAM_ROW_ACCENT
    : difficulty === "HARD"
      ? DS_COLORS.DISCOVER_V3_ROW_HARD_BORDER
      : difficulty === "MED"
        ? DS_COLORS.PRIMARY
        : DS_COLORS.DISCOVER_GREEN;

  const iconColor = isTeam ? DS_COLORS.DISCOVER_V3_TEAM_ROW_ACCENT : DS_COLORS.DISCOVER_V3_ICON_MUTED;
  const circumference = 2 * Math.PI * 11;
  const strokeDashoffset = circumference * (1 - Math.min(100, Math.max(0, completionRate)) / 100);

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
      accessibilityLabel={`${title}, ${duration} days, ${difficulty}, ${isTeam ? "team challenge" : `${participantCount} participants`}, ${completionRate} percent completion${badgeName ? `, earns ${badgeName}` : ""}`}
      style={[styles.row, { borderLeftColor: borderColor }]}
    >
      <View style={styles.icon}>
        <Icon size={16} color={iconColor} strokeWidth={1.5} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta}>
          <Text style={styles.metaHighlight}>
            {isTeam && teamSize ? `${teamSize} · ` : ""}
            {durationLabel} · {difficulty}
          </Text>
          {showSoloActive ? ` · ${formatCount(participantCount)} active` : ""}
        </Text>
        {badgeName && !isTeam ? <Text style={styles.badge}>Earns: {badgeName}</Text> : null}
      </View>

      <View style={styles.right}>
        {isTeam ? (
          <View>
            <View style={styles.joinButton}>
              <Text style={styles.joinText}>Join</Text>
            </View>
            {inviteText ? <Text style={styles.inviteText}>{inviteText}</Text> : null}
          </View>
        ) : (
          <View style={styles.ring}>
            <Svg width={28} height={28} viewBox="0 0 28 28" style={{ transform: [{ rotate: "-90deg" }] }}>
              <Circle cx={14} cy={14} r={11} fill="none" stroke={DS_COLORS.BORDER} strokeWidth={2.5} />
              <Circle
                cx={14}
                cy={14}
                r={11}
                fill="none"
                stroke={DS_COLORS.DISCOVER_GREEN}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </Svg>
            <Text style={styles.ringValue}>{Math.round(completionRate)}%</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: DS_COLORS.SURFACE,
    borderRadius: DS_RADIUS.SM,
    padding: 8,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
    marginBottom: 5,
    minHeight: 56,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  meta: {
    fontSize: 10,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 1,
  },
  metaHighlight: {
    color: DS_COLORS.PRIMARY,
    fontWeight: "500",
  },
  badge: {
    fontSize: 9,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
  },
  ring: {
    width: 28,
    height: 28,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ringValue: {
    position: "absolute",
    fontSize: 7,
    fontWeight: "600",
    color: DS_COLORS.DISCOVER_GREEN,
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
  inviteText: {
    fontSize: 8,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
    textAlign: "right",
    maxWidth: 120,
  },
});
