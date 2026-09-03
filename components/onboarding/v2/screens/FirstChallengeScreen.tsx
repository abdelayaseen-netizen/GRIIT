import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Hash, MapPin, Timer } from "lucide-react-native";
import { OBV2_COLOR, OBV2_RADIUS } from "../theme";
import { PrimaryButton, TextLink } from "../ui";

function TaskRow({
  icon,
  title,
  meta,
  divider,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  divider?: boolean;
}) {
  return (
    <View style={[styles.trow, divider && styles.trowDivider]}>
      <View style={styles.ticon}>{icon}</View>
      <View style={styles.tbody}>
        <Text style={styles.tt}>{title}</Text>
        <Text style={styles.ts}>{meta}</Text>
      </View>
    </View>
  );
}

export default function FirstChallengeScreen({
  onJoin,
  onSkip,
  onBrowse,
}: {
  onJoin: () => void;
  onSkip: () => void;
  onBrowse: () => void;
}) {
  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>Pick your first{"\n"}challenge</Text>
        <Text style={styles.sub}>Tuned to your goals. One tap and you&apos;re in.</Text>
      </View>

      <View style={styles.featured}>
        <View style={styles.featuredCopy}>
          <Text style={styles.featuredTitle}>30-day reset</Text>
          <Text style={styles.featuredMeta}>3 tasks · 1,240 people</Text>
        </View>
        <View style={styles.startPill}>
          <Text style={styles.startPillText}>Start</Text>
        </View>
      </View>

      <View style={styles.card}>
        <TaskRow
          icon={<MapPin size={17} color={OBV2_COLOR.orangeInk} strokeWidth={2.2} />}
          title="Morning run"
          meta="Distance · 4.1 mi · GPS"
        />
        <TaskRow
          icon={<Hash size={17} color={OBV2_COLOR.orangeInk} strokeWidth={2.2} />}
          title="Read 10 pages"
          meta="Count · 10 pages"
          divider
        />
        <TaskRow
          icon={<Timer size={17} color={OBV2_COLOR.orangeInk} strokeWidth={2.2} />}
          title="Cold shower"
          meta="Timer · 2 min"
          divider
        />
      </View>

      <View style={styles.grow} />
      <View style={styles.footer}>
        <PrimaryButton label="Join" onPress={onJoin} />
        <TextLink label="Skip for now" onPress={onSkip} />
        <TextLink label="Browse all" onPress={onBrowse} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24 },
  head: { marginTop: 32 },
  h1: { fontSize: 32, fontWeight: "800", lineHeight: 34, letterSpacing: -0.64, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 23, color: OBV2_COLOR.ink2, marginTop: 12 },
  featured: {
    marginTop: 22,
    minHeight: 140,
    borderRadius: OBV2_RADIUS.sel,
    backgroundColor: OBV2_COLOR.photoDark,
    padding: 18,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  featuredCopy: {},
  featuredTitle: { fontSize: 22, fontWeight: "800", color: OBV2_COLOR.onPhoto },
  featuredMeta: { fontSize: 13, color: OBV2_COLOR.onPhotoDim, marginTop: 3 },
  startPill: {
    position: "absolute",
    right: 16,
    bottom: 18,
    backgroundColor: OBV2_COLOR.orange,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: OBV2_RADIUS.chip,
  },
  startPillText: { color: OBV2_COLOR.onDark, fontSize: 14, fontWeight: "700" },
  card: {
    marginTop: 14,
    backgroundColor: OBV2_COLOR.card,
    borderRadius: OBV2_RADIUS.card,
    overflow: "hidden",
    shadowColor: OBV2_COLOR.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 1,
  },
  trow: { flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 14, paddingHorizontal: 16 },
  trowDivider: { borderTopWidth: 1, borderTopColor: OBV2_COLOR.hair },
  ticon: {
    width: 34,
    height: 34,
    borderRadius: OBV2_RADIUS.icon,
    backgroundColor: OBV2_COLOR.peach,
    alignItems: "center",
    justifyContent: "center",
  },
  tbody: { flex: 1 },
  tt: { fontSize: 15.5, fontWeight: "600", color: OBV2_COLOR.ink },
  ts: { fontSize: 12.5, color: OBV2_COLOR.ink2, marginTop: 1 },
  grow: { flex: 1 },
  footer: { paddingTop: 14, paddingBottom: 26, gap: 8 },
});
