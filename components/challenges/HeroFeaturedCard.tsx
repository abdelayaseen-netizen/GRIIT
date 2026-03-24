import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DS_COLORS } from "@/lib/design-system";

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
};

export const HeroFeaturedCard = React.memo(function HeroFeaturedCard({
  challenge,
  onPress,
  onPressIn,
}: {
  challenge: HeroChallenge | null;
  onPress: (id: string) => void;
  onPressIn?: () => void;
}) {
  if (!challenge) return null;
  const duration = challenge.duration_days ?? 7;
  const joinedToday = Math.max(3, Math.floor((challenge.participants_count ?? 0) * 0.02));
  const copy = HERO_COPY[challenge.title] ?? challenge.description ?? "Lock in. Show up daily. Build unbreakable discipline.";
  return (
    <View style={s.card}>
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
        <Text style={s.desc}>{copy}</Text>
        <View style={s.socialBar}>
          <View style={s.avatars}>
            <View style={[s.avatar, { backgroundColor: DS_COLORS.DISCOVER_CORAL }]}><Text style={s.avatarText}>Y</Text></View>
            <View style={[s.avatar, s.avatarOverlap, { backgroundColor: DS_COLORS.DISCOVER_BLUE }]}><Text style={s.avatarText}>M</Text></View>
            <View style={[s.avatar, s.avatarOverlap, { backgroundColor: DS_COLORS.DISCOVER_GREEN }]}><Text style={s.avatarText}>A</Text></View>
          </View>
          <Text style={s.socialText}>{joinedToday} people joined today</Text>
        </View>
        <TouchableOpacity
          style={s.cta}
          onPressIn={onPressIn}
          onPress={() => onPress(challenge.id)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Start ${challenge.title}, ${duration} day challenge`}
        >
          <Text style={s.ctaText}>Start this challenge</Text>
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
  socialBar: { marginTop: 14, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "rgba(255,255,255,0.06)", flexDirection: "row", alignItems: "center", gap: 8 },
  avatars: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: DS_COLORS.DISCOVER_HERO_DARK_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOverlap: { marginLeft: -6 },
  avatarText: { fontSize: 8, fontWeight: "700", color: DS_COLORS.WHITE },
  socialText: { fontSize: 11, color: "rgba(255,255,255,0.4)" },
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
