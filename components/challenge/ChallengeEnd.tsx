/**
 * Frames 79–82. Port of design/handoff/src/components/ChallengeEnd.tsx on DS_V3.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import DisplayNumber from "@/components/ds/DisplayNumber";
import { DS_V3 } from "@/lib/design-system";
import {
  capCaption,
  combinedDateLine,
  combinedFooter,
  combinedTitle,
  factLine,
  securedCount,
  type DayState,
  type EndedChallenge,
} from "@/lib/challenge-end";

const TILE = 27;
const PLUG = 9;
const COLS = 12;
const COMBINED_COLS = 15;

const LEGEND: [DayState, string][] = [
  ["camera", "Camera proof"],
  ["self", "Self-reported"],
  ["missed", "Not secured"],
  ["frozen", "Frozen"],
  ["last_stand", "Last Stand"],
];

function Tile({ state, size = TILE }: { state: DayState; size?: number }) {
  const fill =
    state === "camera" ? DS_V3.color.brand : state === "self" ? DS_V3.color.border : "transparent";
  const stroke =
    state === "last_stand"
      ? DS_V3.color.brand
      : state === "camera" || state === "self"
        ? "transparent"
        : DS_V3.color.border;
  const plug = state === "frozen" ? DS_V3.color.border : state === "last_stand" ? DS_V3.color.brand : null;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        backgroundColor: fill,
        borderWidth: state === "last_stand" ? 1.5 : 1,
        borderColor: stroke,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {plug ? (
        <View style={{ width: PLUG, height: PLUG, borderRadius: 2, backgroundColor: plug }} />
      ) : null}
    </View>
  );
}

function Sheet({ days, cols = COLS }: { days: DayState[]; cols?: number }) {
  if (days.length === 1) {
    return (
      <View style={styles.oneDay}>
        <Tile state={days[0]!} />
      </View>
    );
  }
  return (
    <View style={styles.sheet}>
      {days.map((s, i) => (
        <View key={i} style={{ width: `${100 / cols}%`, padding: 1.5, alignItems: "center" }}>
          <Tile state={s} size={cols === COMBINED_COLS ? 18 : TILE} />
        </View>
      ))}
    </View>
  );
}

function Legend({ days }: { days: DayState[] }) {
  const present = LEGEND.filter(([s]) => days.includes(s));
  return (
    <View style={styles.legend}>
      {present.map(([s, label]) => (
        <View key={s} style={styles.legendItem}>
          <Tile state={s} size={11} />
          <Text style={styles.caption}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.bodyStrong}>{value}</Text>
    </View>
  );
}

export type ChallengeEndProps = {
  challenges: EndedChallenge[];
  activeCount: number;
  challengeLimit: number | null;
  formatDate: (iso: string) => string;
  onClose: () => void;
  onDone: () => void;
  onRestart?: (challengeId: string) => void;
};

export function ChallengeEnd(p: ChallengeEndProps) {
  return p.challenges.length > 1 ? <Combined {...p} /> : <Single {...p} />;
}

function Single(p: ChallengeEndProps) {
  const insets = useSafeAreaInsets();
  const c = p.challenges[0];
  if (!c) return null;
  const secured = securedCount(c.days);
  const atCap = p.challengeLimit != null && p.activeCount >= p.challengeLimit;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={p.onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.close}
        >
          <X size={22} color={DS_V3.color.textSecondary} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.label}>Days secured</Text>
          <View style={styles.heroRow}>
            <DisplayNumber value={secured} size="moment" />
            <Text style={styles.ofN}>of {c.days.length}</Text>
          </View>
        </View>
        <View style={styles.block}>
          <Text style={styles.bodyStrong}>
            {c.status === "failed"
              ? `${c.title} ended on day ${c.ended_on_day}.`
              : `${c.title} is over.`}
          </Text>
          <Text style={styles.fact}>{factLine(c)}</Text>
        </View>
        <View style={styles.gutter}>
          <Sheet days={c.days} />
        </View>
        <Legend days={c.days} />
        <View style={styles.gutter}>
          <Card>
            <View style={styles.cardInner}>
              <Stat
                label="Longest streak"
                value={`${c.longest_streak} ${c.longest_streak === 1 ? "day" : "days"}`}
              />
              <Stat label="Started" value={p.formatDate(c.started_at)} />
              <Stat label="Ended" value={p.formatDate(c.ended_at)} />
            </View>
          </Card>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: 26 + insets.bottom }]}>
        <Button label="Done" onPress={p.onDone} />
        <Button
          label="Start it again"
          variant="secondary"
          onPress={() => p.onRestart?.(c.challengeId)}
        />
        {atCap ? <Text style={styles.cap}>{capCaption(p.activeCount, p.challengeLimit!)}</Text> : null}
      </View>
    </View>
  );
}

function Combined(p: ChallengeEndProps) {
  const insets = useSafeAreaInsets();
  const all = p.challenges.flatMap((c) => c.days);
  const n = p.challenges.length;
  const date = p.challenges[0] ? p.formatDate(p.challenges[0].ended_at) : "";

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={p.onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.close}
        >
          <X size={22} color={DS_V3.color.textSecondary} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.combinedHead}>
          <Text style={styles.title}>{combinedTitle(n)}</Text>
          <Text style={styles.secondary}>{combinedDateLine(n, date)}</Text>
        </View>
        <View style={styles.combinedList}>
          {p.challenges.map((c, i) => (
            <View key={c.id}>
              {i > 0 ? <View style={styles.rule} /> : null}
              <View style={styles.combinedBlock}>
                <View style={styles.combinedRow}>
                  <Text style={[styles.bodyStrong, styles.flex]}>{c.title}</Text>
                  <View style={styles.heroRow}>
                    <Text style={styles.combinedNum}>{securedCount(c.days)}</Text>
                    <Text style={styles.secondary}>of {c.days.length}</Text>
                  </View>
                </View>
                <Sheet days={c.days} cols={COMBINED_COLS} />
                <Text style={styles.caption}>{factLine(c)}</Text>
              </View>
            </View>
          ))}
        </View>
        <Legend days={all} />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: 26 + insets.bottom }]}>
        <Button label="Done" onPress={p.onDone} />
        <Text style={styles.cap}>{combinedFooter(n)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DS_V3.color.canvas },
  topBar: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    alignItems: "flex-end",
  },
  close: { width: 44, height: 44, alignItems: "flex-end", justifyContent: "center" },
  hero: {
    paddingHorizontal: DS_V3.space.gutter,
    alignItems: "center",
  },
  heroRow: { flexDirection: "row", alignItems: "baseline", gap: DS_V3.space.sm },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  ofN: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  block: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    alignItems: "center",
    gap: DS_V3.space.xs,
  },
  bodyStrong: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  fact: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
    maxWidth: 300,
  },
  gutter: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.md },
  oneDay: { alignItems: "center" },
  sheet: { flexDirection: "row", flexWrap: "wrap" },
  legend: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  cardInner: { padding: 14, gap: 7 },
  stat: { flexDirection: "row", alignItems: "center" },
  statLabel: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: 10,
    backgroundColor: DS_V3.color.canvas,
    gap: 5,
  },
  cap: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  combinedHead: {
    paddingHorizontal: DS_V3.space.gutter,
    gap: 5,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  secondary: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  combinedList: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: 18,
  },
  combinedBlock: { gap: DS_V3.space.sm },
  combinedRow: { flexDirection: "row", alignItems: "baseline", gap: DS_V3.space.md },
  flex: { flex: 1, textAlign: "left" },
  combinedNum: {
    fontFamily: DS_V3.type.number.fontFamily,
    fontSize: 34,
    lineHeight: 32,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  rule: { height: 1, backgroundColor: DS_V3.color.border, marginBottom: 18 },
});
