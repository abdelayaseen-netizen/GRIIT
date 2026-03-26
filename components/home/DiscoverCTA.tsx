import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Search, ChevronRight } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

type Props = {
  onPress: () => void;
  /** `feed` = bottom of home feed (tighter margins, larger icon per feed redesign). */
  variant?: "home" | "feed";
};

export default function DiscoverCTA({ onPress, variant = "home" }: Props) {
  const isFeed = variant === "feed";
  return (
    <TouchableOpacity
      style={[s.card, isFeed && s.cardFeed]}
      activeOpacity={0.86}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Discover your next challenge — open Discover"
    >
      <View style={[s.icon, isFeed && s.iconFeed]}>
        <Search size={isFeed ? 20 : 18} color={DS_COLORS.DISCOVER_CORAL} />
      </View>
      <View style={s.mid}>
        <Text style={[s.title, isFeed && s.titleFeed]}>Ready for more?</Text>
        <Text style={[s.sub, isFeed && s.subFeed]}>Discover your next challenge</Text>
      </View>
      <ChevronRight size={isFeed ? 16 : 14} color={DS_COLORS.FEED_SHARE_CHEVRON} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    marginTop: 12,
    marginHorizontal: 24,
    borderRadius: 16,
    backgroundColor: DS_COLORS.DISCOVER_HERO_DARK_BG,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardFeed: {
    marginTop: 4,
    marginHorizontal: 10,
    marginBottom: 0,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: DS_COLORS.FEED_CTA_ICON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  iconFeed: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  mid: { flex: 1 },
  title: { fontSize: 13, fontWeight: "700", color: DS_COLORS.WHITE },
  titleFeed: { fontSize: 14, fontWeight: "500", color: DS_COLORS.FEED_TAB_ACTIVE_TEXT },
  sub: { marginTop: 2, fontSize: 11, color: DS_COLORS.FEED_ENGAGEMENT_MUTED },
  subFeed: { fontSize: 12, color: DS_COLORS.FEED_ENGAGEMENT_MUTED },
});
