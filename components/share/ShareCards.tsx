import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;
export const PREVIEW_SCALE = 0.18;
export const SELECTED_PREVIEW_SCALE = 0.45;

const CARD_STYLES = {
  background: "#111111",
  wordmarkColor: "#FFFFFF",
  wordmarkSize: 42,
  wordmarkWeight: "700" as const,
  wordmarkTracking: 2,
  accentColor: "#E8593C",
  mutedWhite: "rgba(255,255,255,0.5)",
  dimWhite: "rgba(255,255,255,0.7)",
  greenAccent: "#4CAF50",
};

type TaskRow = { name: string; details: string; timestamp: string; verified?: boolean };

export function StatementCard({ dayNumber, challengeName, calloutText }: { dayNumber: number; challengeName: string; calloutText: string }) {
  return (
    <View style={[s.card, { backgroundColor: "#000000" }]}>
      <Text style={s.wordmarkTopLeft}>GRIIT</Text>
      <View style={s.statementCenter}>
        <Text style={s.statementBigDay}>{dayNumber}</Text>
        <Text style={s.statementDaysIn}>DAYS IN</Text>
        <Text style={s.statementChallengeName}>{challengeName}</Text>
      </View>
      <View style={s.statementBottomLeft}>
        <Text style={s.statementCallout}>{calloutText}</Text>
        <View style={s.statementAccentBar} />
      </View>
    </View>
  );
}

export function TransparentCard({
  dayNumber,
  challengeName,
  taskName,
  proofPhotoUri,
  tasksCompleted,
  totalTasks,
  rank,
}: {
  dayNumber: number;
  challengeName: string;
  taskName: string;
  proofPhotoUri?: string | null;
  tasksCompleted: number;
  totalTasks: number;
  rank: string;
}) {
  const content = (
    <>
      <Text style={s.wordmarkTopLeft}>GRIIT</Text>
      <View style={s.transparentBottomPanel}>
        <Text style={s.transparentTask}>{taskName}</Text>
        <Text style={s.transparentMeta}>Day {dayNumber} · {challengeName} · Verified</Text>
        <View style={s.transparentStatsRow}>
          <Text style={s.transparentDay}>{dayNumber}</Text>
          <Text style={s.transparentStatText}>🔥</Text>
          <Text style={s.transparentStatText}>{tasksCompleted}/{totalTasks} {rank}</Text>
        </View>
      </View>
    </>
  );
  if (proofPhotoUri) {
    return (
      <ImageBackground source={{ uri: proofPhotoUri }} style={s.card} resizeMode="cover">
        <View style={s.photoDim}>{content}</View>
      </ImageBackground>
    );
  }
  return (
    <LinearGradient colors={["#1A1A1A", "#111111"]} style={s.card}>
      {content}
    </LinearGradient>
  );
}

export function ProofReceiptCard({
  dayNumber,
  totalDays,
  challengeName,
  tasks,
  rank,
}: {
  dayNumber: number;
  totalDays: number;
  challengeName: string;
  tasks: TaskRow[];
  rank: string;
}) {
  return (
    <View style={s.card}>
      <View style={s.receiptHeader}>
        <Text style={s.wordmarkHeader}>GRIIT</Text>
        <Text style={s.receiptDay}>Day {dayNumber} of {totalDays}</Text>
      </View>
      <Text style={s.receiptSub}>All tasks secured · Proof receipt</Text>
      <View style={s.listWrap}>
        {tasks.map((t) => (
          <View key={`${t.name}-${t.timestamp}`} style={s.listItem}>
            <Text style={s.checkMark}>✓</Text>
            <View style={s.listItemMid}>
              <Text style={s.listName}>{t.name}</Text>
              <Text style={s.listDetails}>{t.details}</Text>
            </View>
            <Text style={s.listTime}>{t.timestamp}</Text>
          </View>
        ))}
      </View>
      <View style={s.bottomStat}>
        <Text style={s.bottomDay}>{dayNumber}</Text>
        <Text style={s.bottomFire}>🔥</Text>
        <Text style={s.bottomRank}>{tasks.length}/{tasks.length} {rank}</Text>
      </View>
      <Text style={s.bottomChallenge}>{challengeName}</Text>
    </View>
  );
}

export function BreakdownCard({
  dayNumber,
  challengeName,
  tasks,
  rank,
}: {
  dayNumber: number;
  challengeName: string;
  tasks: TaskRow[];
  rank: string;
}) {
  return (
    <View style={s.card}>
      <Text style={s.wordmarkTopLeft}>GRIIT</Text>
      <Text style={s.breakdownTitle}>Today&apos;s grind</Text>
      <Text style={s.breakdownSub}>All tasks secured</Text>
      <View style={s.listWrap}>
        {tasks.map((t) => (
          <View key={`${t.name}-${t.timestamp}`} style={s.listItem}>
            <Text style={s.checkMark}>✓</Text>
            <View style={s.listItemMid}>
              <Text style={s.listName}>{t.name}</Text>
              <Text style={s.listDetails}>{t.details}</Text>
            </View>
            <Text style={s.listTime}>{t.timestamp}</Text>
          </View>
        ))}
      </View>
      <View style={s.bottomStat}>
        <Text style={s.bottomDay}>{dayNumber}</Text>
        <Text style={s.bottomFire}>🔥</Text>
        <Text style={s.bottomRank}>{tasks.length}/{tasks.length} {rank}</Text>
      </View>
      <Text style={s.bottomChallenge}>{challengeName}</Text>
    </View>
  );
}

export function CalloutCard({ challengeName, totalDays, totalTasks }: { challengeName: string; totalDays: number; totalTasks: number }) {
  return (
    <LinearGradient colors={["#111111", "#1A1410"]} style={s.card}>
      <Text style={s.wordmarkTopRight}>GRIIT</Text>
      <View style={s.calloutBody}>
        <Text style={s.calloutPre}>I JUST FINISHED</Text>
        <Text style={s.calloutChallenge}>{challengeName.toUpperCase()}</Text>
        <Text style={s.calloutStats}>{totalDays} days, {totalTasks} tasks completed.{"\n"}Zero excuses. Zero days missed.</Text>
        <Text style={s.calloutCta}>THINK YOU CAN DO IT?</Text>
        <View style={s.statementAccentBar} />
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: CARD_STYLES.background },
  wordmarkTopLeft: {
    position: "absolute",
    top: 72,
    left: 56,
    color: CARD_STYLES.wordmarkColor,
    fontSize: CARD_STYLES.wordmarkSize,
    fontWeight: CARD_STYLES.wordmarkWeight,
    letterSpacing: CARD_STYLES.wordmarkTracking,
  },
  wordmarkTopRight: {
    position: "absolute",
    top: 72,
    right: 56,
    color: CARD_STYLES.wordmarkColor,
    fontSize: CARD_STYLES.wordmarkSize,
    fontWeight: CARD_STYLES.wordmarkWeight,
    letterSpacing: CARD_STYLES.wordmarkTracking,
  },
  statementCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  statementBigDay: { fontSize: 240, color: "#FFFFFF", fontWeight: "800", lineHeight: 250 },
  statementDaysIn: { fontSize: 36, color: CARD_STYLES.dimWhite, letterSpacing: 5, fontWeight: "500" },
  statementChallengeName: { marginTop: 20, fontSize: 54, color: "#FFFFFF", fontWeight: "600" },
  statementBottomLeft: { position: "absolute", left: 56, bottom: 90 },
  statementCallout: { fontSize: 30, color: CARD_STYLES.mutedWhite, marginBottom: 20 },
  statementAccentBar: { width: 520, height: 6, backgroundColor: CARD_STYLES.accentColor, borderRadius: 3 },
  photoDim: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  transparentBottomPanel: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 40,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 28,
  },
  transparentTask: { color: "#FFFFFF", fontSize: 38, fontWeight: "700" },
  transparentMeta: { color: CARD_STYLES.dimWhite, fontSize: 26, marginTop: 8 },
  transparentStatsRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 },
  transparentDay: { color: "#FFFFFF", fontSize: 78, fontWeight: "800" },
  transparentStatText: { color: "#FFFFFF", fontSize: 32, fontWeight: "700" },
  receiptHeader: { marginTop: 72, paddingHorizontal: 56, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  wordmarkHeader: { color: "#FFFFFF", fontSize: 40, fontWeight: "700", letterSpacing: 2 },
  receiptDay: { color: CARD_STYLES.dimWhite, fontSize: 30, fontWeight: "600" },
  receiptSub: { color: CARD_STYLES.greenAccent, fontSize: 26, marginTop: 20, marginHorizontal: 56, fontWeight: "600" },
  listWrap: { marginTop: 36, marginHorizontal: 56, gap: 18 },
  listItem: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 16 },
  checkMark: { color: CARD_STYLES.greenAccent, fontSize: 32, marginRight: 14 },
  listItemMid: { flex: 1 },
  listName: { color: "#FFFFFF", fontSize: 31, fontWeight: "700" },
  listDetails: { color: CARD_STYLES.dimWhite, fontSize: 22, marginTop: 4 },
  listTime: { color: CARD_STYLES.mutedWhite, fontSize: 20, marginLeft: 12 },
  bottomStat: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 12, marginTop: 44 },
  bottomDay: { color: "#FFFFFF", fontSize: 96, fontWeight: "800", lineHeight: 100 },
  bottomFire: { color: "#FFFFFF", fontSize: 54, marginBottom: 10 },
  bottomRank: { color: CARD_STYLES.dimWhite, fontSize: 30, fontWeight: "600", marginBottom: 12 },
  bottomChallenge: { color: CARD_STYLES.mutedWhite, fontSize: 24, textAlign: "center", marginTop: 12 },
  breakdownTitle: { color: "#FFFFFF", fontSize: 78, fontWeight: "800", marginTop: 220, marginHorizontal: 56 },
  breakdownSub: { color: CARD_STYLES.dimWhite, fontSize: 28, marginTop: 8, marginHorizontal: 56 },
  calloutBody: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 80 },
  calloutPre: { color: CARD_STYLES.dimWhite, fontSize: 34, fontWeight: "600", letterSpacing: 2 },
  calloutChallenge: { color: "#FFFFFF", fontSize: 98, fontWeight: "800", textAlign: "center", marginTop: 20 },
  calloutStats: { color: CARD_STYLES.dimWhite, fontSize: 36, textAlign: "center", lineHeight: 52, marginTop: 24 },
  calloutCta: { color: CARD_STYLES.accentColor, fontSize: 44, fontWeight: "800", marginTop: 44, marginBottom: 22 },
});
