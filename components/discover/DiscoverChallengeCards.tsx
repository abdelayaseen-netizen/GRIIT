import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Flame, Target, BookOpen } from "lucide-react-native";
import { DS_COLORS, getCategoryColors } from "@/lib/design-system";
import { Avatar } from "@/components/Avatar";

function difficultyBorder(d?: string | null): { border: string; badgeBg: string; badgeText: string; label: string } {
  const key = (d ?? "medium").toLowerCase();
  if (key === "easy")
    return {
      border: DS_COLORS.DIFFICULTY_EASY_TEXT,
      badgeBg: DS_COLORS.DIFFICULTY_EASY_BG,
      badgeText: DS_COLORS.DIFFICULTY_EASY_TEXT,
      label: "EASY",
    };
  if (key === "hard" || key === "extreme")
    return {
      border: DS_COLORS.SUGGESTED_CARD_ACCENT_MIND,
      badgeBg: DS_COLORS.DIFFICULTY_HARD_BG,
      badgeText: DS_COLORS.DIFFICULTY_HARD_TEXT,
      label: "HARD",
    };
  return {
    border: DS_COLORS.WARNING,
    badgeBg: DS_COLORS.DIFFICULTY_MEDIUM_BG,
    badgeText: DS_COLORS.DIFFICULTY_MEDIUM_TEXT,
    label: "MED",
  };
}

function CategoryIcon({ category }: { category?: string | null }) {
  const cat = String(category ?? "discipline").toLowerCase();
  const colors = getCategoryColors(cat);
  const Icon = cat.includes("mind") || cat.includes("faith") ? BookOpen : cat.includes("fitness") ? Flame : Target;
  return (
    <View style={[s.catIcon, { backgroundColor: colors.tagBorder }]}>
      <Icon size={18} color={colors.header} />
    </View>
  );
}

export type MiniCardChallenge = {
  id: string;
  title?: string;
  description?: string;
  short_hook?: string;
  difficulty?: string;
  category?: string;
  created_at?: string;
};

export function DiscoverMiniChallengeCard({
  challenge,
  onPress,
}: {
  challenge: MiniCardChallenge;
  onPress: (id: string) => void;
}) {
  const theme = difficultyBorder(challenge.difficulty);
  const desc = (challenge.short_hook ?? challenge.description ?? "").trim();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const isNew = challenge.created_at ? Date.now() - new Date(challenge.created_at).getTime() < weekMs : false;
  return (
    <Pressable
      onPress={() => onPress(challenge.id)}
      style={[s.miniRoot, { borderLeftColor: theme.border }]}
      accessibilityRole="button"
      accessibilityLabel={challenge.title ?? "Challenge"}
    >
      <View style={s.miniBadgeAbs}>
        <Text style={[s.miniBadgeTxt, { color: theme.badgeText, backgroundColor: theme.badgeBg }]}>{theme.label}</Text>
      </View>
      <View style={s.miniTop}>
        <CategoryIcon category={challenge.category} />
      </View>
      <Text style={s.miniTitle} numberOfLines={2}>
        {challenge.title ?? "Challenge"}
      </Text>
      <Text style={s.miniDesc} numberOfLines={2}>
        {desc || " "}
      </Text>
      <View style={s.miniFoot}>
        <Text style={s.miniNew}>{isNew ? "New" : " "}</Text>
        <Text style={s.miniGo}>Go ›</Text>
      </View>
    </Pressable>
  );
}

export type FullCardChallenge = {
  id: string;
  title?: string;
  description?: string;
  short_hook?: string;
  difficulty?: string;
  duration_days?: number;
  category?: string;
  participants_count?: number;
  created_at?: string;
  team_size?: number;
  participation_type?: string;
};

export function DiscoverChallengeSearchRow({
  challenge,
  onPress,
}: {
  challenge: MiniCardChallenge & { participants_count?: number; duration_days?: number };
  onPress: () => void;
}) {
  const colors = getCategoryColors(String(challenge.category ?? "discipline"));
  const Icon = String(challenge.category ?? "").toLowerCase().includes("mind") ? BookOpen : String(challenge.category ?? "").toLowerCase().includes("fitness") ? Flame : Target;
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
      }}
      accessibilityRole="button"
      accessibilityLabel={challenge.title ?? "Challenge"}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: colors.tagBorder,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={18} color={colors.header} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY }} numberOfLines={2}>
          {challenge.title ?? "Challenge"}
        </Text>
        <Text style={{ fontSize: 12, color: DS_COLORS.FEED_META_MUTED, marginTop: 1 }}>
          {challenge.duration_days ?? 7} days · {challenge.participants_count ?? 0} active
        </Text>
      </View>
    </Pressable>
  );
}

function categoryAccent(category?: string | null): string {
  return getCategoryColors(String(category ?? "discipline").toLowerCase()).header;
}

export function DiscoverFullChallengeCard({
  challenge,
  variant,
  teamPreview,
  onPress,
}: {
  challenge: FullCardChallenge;
  variant: "solo" | "team";
  teamPreview?: { user_id: string; username: string | null; avatar_url: string | null }[];
  onPress: (id: string) => void;
}) {
  const left = categoryAccent(challenge.category);
  const theme = difficultyBorder(challenge.difficulty);
  const days = challenge.duration_days ?? 14;
  const active = challenge.participants_count ?? 0;
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const isNew = challenge.created_at ? Date.now() - new Date(challenge.created_at).getTime() < weekMs : false;
  const popular = active >= 20;
  const badgeLabel = popular ? "Popular" : isNew ? "New this week" : null;
  const badgeStyle = popular ? s.badgePopular : s.badgeNew;
  const size = challenge.team_size ?? 4;
  const sizeLabel = size <= 2 ? "2 people" : size <= 4 ? "3-4 people" : `${size} people`;
  const metaLine =
    variant === "team"
      ? `${sizeLabel} · ${days} days · ${theme.label}`
      : `${days} days · ${theme.label}`;

  return (
    <Pressable
      onPress={() => onPress(challenge.id)}
      style={[s.fullRoot, { borderLeftColor: left }]}
      accessibilityRole="button"
      accessibilityLabel={challenge.title ?? "Challenge"}
    >
      {badgeLabel ? (
        <View style={[s.badgeWrap, badgeStyle]}>
          <Text style={popular ? s.badgePopularText : s.badgeNewText}>{badgeLabel}</Text>
        </View>
      ) : null}
      <View style={s.fullTop}>
        <CategoryIcon category={challenge.category} />
        <View style={s.fullMid}>
          <Text style={s.fullTitle} numberOfLines={2}>
            {challenge.title ?? "Challenge"}
          </Text>
          <Text style={[s.fullMeta, { color: theme.badgeText }]}>{metaLine}</Text>
        </View>
      </View>
      <Text style={s.fullDesc} numberOfLines={3}>
        {(challenge.short_hook ?? challenge.description ?? "").trim() || " "}
      </Text>
      {variant === "team" && teamPreview && teamPreview.length > 0 ? (
        <View style={s.avatarRow}>
          {teamPreview.slice(0, 3).map((p, i) => (
            <Avatar
              key={p.user_id}
              url={p.avatar_url}
              name={p.username ?? "?"}
              userId={p.user_id}
              size={24}
              style={{ marginLeft: i > 0 ? -6 : 0, borderWidth: 2, borderColor: DS_COLORS.WHITE }}
            />
          ))}
          {active > 3 ? (
            <Text style={s.moreAv}>+{Math.max(0, active - 3)} more</Text>
          ) : null}
        </View>
      ) : (
        <Text style={s.statsMuted}>
          {active} active
        </Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  miniRoot: {
    width: 160,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    position: "relative",
  },
  miniBadgeAbs: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  miniBadgeTxt: {
    fontSize: 11,
    fontWeight: "700",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: "hidden",
  },
  miniTop: { flexDirection: "row", marginBottom: 8 },
  miniTitle: { fontSize: 14, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY },
  miniDesc: { fontSize: 12, color: DS_COLORS.TEXT_SECONDARY, marginTop: 6, minHeight: 32 },
  miniFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  miniNew: { fontSize: 11, color: DS_COLORS.TEXT_MUTED },
  miniGo: { fontSize: 12, fontWeight: "700", color: DS_COLORS.ACCENT },
  fullRoot: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderLeftWidth: 3,
  },
  badgeWrap: {
    alignSelf: "flex-start",
    marginBottom: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeNew: { backgroundColor: DS_COLORS.CELEB_BONUS_GREEN_BG },
  badgePopular: { backgroundColor: DS_COLORS.FEED_DAY_PILL_BG },
  badgeNewText: { fontSize: 10, fontWeight: "500", color: DS_COLORS.CELEB_BONUS_GREEN },
  badgePopularText: { fontSize: 10, fontWeight: "500", color: DS_COLORS.FEED_DAY_PILL_TEXT },
  fullTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  fullMid: { flex: 1 },
  fullTitle: { fontSize: 15, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY },
  fullMeta: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  fullDesc: { fontSize: 13, color: DS_COLORS.TEXT_SECONDARY, lineHeight: 20, marginTop: 10 },
  statsMuted: { fontSize: 11, color: DS_COLORS.FEED_META_MUTED, marginTop: 10 },
  avatarRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  moreAv: { fontSize: 11, color: DS_COLORS.FEED_META_MUTED, marginLeft: 8 },
});
