import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DS_COLORS, getCategoryColors } from "@/lib/design-system";
import { Avatar } from "@/components/Avatar";

const HERO_COPY: Record<string, string> = {
  "Daily Gratitude": "The challenge that rewires your brain. 3 things. Every morning. No excuses.",
  "7-Day Gratitude Journal": "The challenge that rewires your brain. 3 things. Every morning. No excuses.",
  "21-Day Cold Shower": "Build mental armor one shower at a time. Cold water. Every morning. No flinching.",
  "No Phone Before 9 AM": "Take back your mornings. No scrolling, no notifications, no excuses.",
  "10-Minute Daily Focus Block": "One focused block. No phone. No distractions. Just you and the work.",
};

type HeroChallenge = {
  id: string;
  title: string;
  description?: string;
  duration_days?: number;
  participants_count?: number;
  category?: string;
  /** Real join count for today (from active_challenges); overrides heuristic when set. */
  joins_today?: number;
  /** Joins in the last 7 days — preferred for social proof copy. */
  recent_joins_7d?: number;
  /** Up to 3 avatars beside social proof (e.g. recent joiners). */
  joinPreview?: { user_id: string; username: string | null; avatar_url: string | null }[];
};

export const HeroFeaturedCard = React.memo(function HeroFeaturedCard({
  challenge,
  onPress,
  onPressIn,
  ctaLabel,
}: {
  challenge: HeroChallenge | null;
  onPress: (id: string) => void;
  onPressIn?: () => void;
  /** Default: "Start this challenge" */
  ctaLabel?: string;
}) {
  if (!challenge) return null;
  const duration = challenge.duration_days ?? 7;
  const weekJoins =
    typeof challenge.recent_joins_7d === "number"
      ? Math.max(0, challenge.recent_joins_7d)
      : typeof challenge.joins_today === "number"
        ? Math.max(0, challenge.joins_today)
        : Math.max(0, Math.floor((challenge.participants_count ?? 0) * 0.05));
  const showWeekCount = weekJoins >= 5;
  const socialLine = showWeekCount ? `${weekJoins} joined this week` : "Trending now";
  const previews = (challenge.joinPreview ?? []).slice(0, 3);
  const categoryColors = getCategoryColors(challenge.category ?? "discipline");
  const copy = HERO_COPY[challenge.title] ?? challenge.description ?? "Lock in. Show up daily. Build unbreakable discipline.";
  return (
    <View style={[s.card, { backgroundColor: categoryColors.header }]}>
      <View style={s.glowBottom} />
      <View style={s.glowTop} />
      <View style={s.content}>
        <View style={s.row1}>
          <View style={s.trendingWrap}>
            <View style={s.dot} />
            <Text style={s.trendingText}>TRENDING NOW</Text>
          </View>
          <View style={s.durationPill}>
            <Text style={s.durationText}>{duration} days</Text>
          </View>
        </View>
        <Text style={s.title}>{challenge.title}</Text>
        <Text style={[s.desc, { color: categoryColors.subtitleText }]}>{copy}</Text>
        <View style={s.socialBar} accessibilityRole="none" accessibilityLabel={socialLine}>
          {previews.length > 0 ? (
            <View style={s.avatarCluster}>
              {previews.map((p, i) => (
                <Avatar
                  key={p.user_id}
                  url={p.avatar_url}
                  name={p.username ?? "?"}
                  userId={p.user_id}
                  size={22}
                  style={{ marginLeft: i > 0 ? -7 : 0, borderWidth: 2, borderColor: DS_COLORS.DISCOVER_HERO_AVATAR_RING }}
                />
              ))}
            </View>
          ) : null}
          <Text style={s.socialText}>{socialLine}</Text>
        </View>
        <TouchableOpacity
          style={s.cta}
          onPressIn={onPressIn}
          onPress={() => onPress(challenge.id)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`${ctaLabel ?? "Start"} ${challenge.title} — ${duration} day challenge`}
        >
          <Text style={s.ctaText}>{ctaLabel ?? "Start this challenge"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  card: { borderRadius: 20, backgroundColor: DS_COLORS.DISCOVER_HERO_DARK_BG, overflow: "hidden", marginTop: 18 },
  glowBottom: { position: "absolute", bottom: -20, right: -20, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(232,89,60,0.25)" },
  glowTop: { position: "absolute", top: -10, left: -10, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(232,137,58,0.1)" },
  content: { paddingHorizontal: 22, paddingVertical: 22 },
  row1: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  trendingWrap: { flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DS_COLORS.DISCOVER_GREEN },
  trendingText: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.5)", letterSpacing: 0.5 },
  durationPill: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: "rgba(255,255,255,0.08)" },
  durationText: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.4)" },
  title: { fontSize: 21, fontWeight: "800", color: DS_COLORS.WHITE, lineHeight: 24, letterSpacing: -0.4 },
  desc: { marginTop: 8, fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.45)" },
  socialBar: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarCluster: { flexDirection: "row", alignItems: "center" },
  socialText: { fontSize: 11, color: DS_COLORS.WHITE, flex: 1 },
  cta: {
    marginTop: 16,
    alignSelf: "flex-start",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
  },
  ctaText: { fontSize: 14, fontWeight: "700", color: DS_COLORS.WHITE },
});
