import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { DS_COLORS, DS_RADIUS, DS_BORDERS, GRIIT_COLORS } from "@/lib/design-system";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;
export const PREVIEW_SCALE = 0.18;
export const SELECTED_PREVIEW_SCALE = 0.45;

const CARD_STYLES = {
  background: DS_COLORS.SHARE_CARD_BG,
  wordmarkColor: DS_COLORS.WHITE,
  wordmarkSize: 42,
  wordmarkWeight: "700" as const,
  wordmarkTracking: 2,
  accentColor: DS_COLORS.DISCOVER_CORAL,
  mutedWhite: "rgba(255,255,255,0.5)",
  dimWhite: "rgba(255,255,255,0.7)",
  greenAccent: DS_COLORS.DISCOVER_GREEN,
};

type TaskRow = { name: string; details: string; timestamp: string; verified?: boolean };

export function StatementCard({
  dayNumber,
  challengeName,
  calloutText,
  proofPhotoUri,
}: {
  dayNumber: number;
  challengeName: string;
  calloutText: string;
  proofPhotoUri?: string | null;
}) {
  const daysLabel = dayNumber === 1 ? "DAY" : "DAYS";
  const centerContent = (
    <>
      <Text style={s.statementBigDay}>{dayNumber}</Text>
      <Text style={s.statementDaysIn}>
        {daysLabel} IN
      </Text>
      <Text style={s.statementChallengeName}>{challengeName}</Text>
    </>
  );

  return (
    <View style={[s.card, s.cardDark]}>
      <Text style={s.wordmarkTopLeft}>GRIIT</Text>
      <View style={s.statementBody}>
        {proofPhotoUri ? (
          <ImageBackground source={{ uri: proofPhotoUri }} style={s.statementHero} resizeMode="cover">
            <View style={s.statementHeroStack}>
              <View style={s.statementHeroDim} />
              <View style={s.statementCenterOnPhoto}>{centerContent}</View>
            </View>
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[DS_COLORS.DISCOVER_HERO_DARK_BG, DS_COLORS.BG_DARK]}
            style={s.statementHero}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            <Text style={s.statementWatermark}>GRIIT</Text>
            <View style={s.statementCenter}>{centerContent}</View>
          </LinearGradient>
        )}
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
      <ImageBackground source={{ uri: proofPhotoUri }} style={[s.card, s.cardOverflow]} resizeMode="cover">
        <View style={s.photoDim}>{content}</View>
      </ImageBackground>
    );
  }
  return (
    <LinearGradient colors={[DS_COLORS.DISCOVER_HERO_DARK_BG, DS_COLORS.SHARE_CARD_BG]} style={[s.card, s.cardOverflow]}>
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
    <View style={[s.card, s.cardLight]}>
      <View style={s.cardInner}>
        <View style={s.receiptHeader}>
          <Text style={s.wordmarkHeaderLight}>GRIIT</Text>
          <Text style={s.receiptDayLight}>Day {dayNumber} of {totalDays}</Text>
        </View>
        <Text style={s.receiptSub}>All tasks secured · Proof receipt</Text>
        <View style={s.listWrap}>
          {tasks.map((t) => (
            <View key={`${t.name}-${t.timestamp}`} style={s.listItemLight}>
              <Text style={s.checkMark}>✓</Text>
              <View style={s.listItemMid}>
                <Text style={s.listNameLight}>{t.name}</Text>
                <Text style={s.listDetailsLight}>{t.details}</Text>
              </View>
              <Text style={s.listTimeLight}>{t.timestamp}</Text>
            </View>
          ))}
        </View>
        <View style={s.bottomStat}>
          <Text style={s.bottomDayLight}>{dayNumber}</Text>
          <Text style={s.bottomFire}>🔥</Text>
          <Text style={s.bottomRankLight}>{tasks.length}/{tasks.length} {rank}</Text>
        </View>
        <Text style={s.bottomChallengeLight}>{challengeName}</Text>
      </View>
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
    <View style={[s.card, s.cardLight]}>
      <Text style={s.wordmarkTopLeftLight}>GRIIT</Text>
      <View style={s.cardInner}>
        <Text style={s.breakdownTitle}>Today&apos;s grind</Text>
        <Text style={s.breakdownSubLight}>All tasks secured</Text>
        <View style={s.listWrap}>
          {tasks.map((t) => (
            <View key={`${t.name}-${t.timestamp}`} style={s.listItemLight}>
              <Text style={s.checkMark}>✓</Text>
              <View style={s.listItemMid}>
                <Text style={s.listNameLight}>{t.name}</Text>
                <Text style={s.listDetailsLight}>{t.details}</Text>
              </View>
              <Text style={s.listTimeLight}>{t.timestamp}</Text>
            </View>
          ))}
        </View>
        <View style={s.bottomStat}>
          <Text style={s.bottomDayLight}>{dayNumber}</Text>
          <Text style={s.bottomFire}>🔥</Text>
          <Text style={s.bottomRankLight}>{tasks.length}/{tasks.length} {rank}</Text>
        </View>
        <Text style={s.bottomChallengeLight}>{challengeName}</Text>
      </View>
    </View>
  );
}

export function CalloutCard({ challengeName, totalDays, totalTasks }: { challengeName: string; totalDays: number; totalTasks: number }) {
  return (
    <LinearGradient colors={[DS_COLORS.SHARE_CARD_BG, DS_COLORS.DISCOVER_HERO_DARK_BG]} style={[s.card, s.cardOverflow]}>
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
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: CARD_STYLES.background,
  },
  cardOverflow: {
    borderRadius: DS_RADIUS.LG,
    overflow: "hidden",
  },
  cardDark: {
    backgroundColor: DS_COLORS.BG_DARK,
    borderRadius: DS_RADIUS.LG,
    overflow: "hidden",
  },
  cardLight: {
    backgroundColor: GRIIT_COLORS.background,
    borderRadius: DS_RADIUS.LG,
    overflow: "hidden",
  },
  cardInner: {
    flex: 1,
    paddingHorizontal: 56,
  },
  wordmarkTopLeft: {
    position: "absolute",
    top: 72,
    left: 56,
    zIndex: 2,
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
  wordmarkTopLeftLight: {
    position: "absolute",
    top: 72,
    left: 56,
    zIndex: 2,
    color: DS_COLORS.TEXT_PRIMARY,
    fontSize: CARD_STYLES.wordmarkSize,
    fontWeight: CARD_STYLES.wordmarkWeight,
    letterSpacing: CARD_STYLES.wordmarkTracking,
  },
  statementBody: { flex: 1, alignSelf: "stretch", width: "100%" },
  statementHero: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  statementHeroStack: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  statementHeroDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_COLORS.MODAL_BACKDROP,
  },
  statementCenterOnPhoto: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 56,
    zIndex: 1,
  },
  statementWatermark: {
    position: "absolute",
    alignSelf: "center",
    top: "38%",
    fontSize: 180,
    fontWeight: "900",
    color: DS_COLORS.WHITE,
    opacity: 0.06,
    letterSpacing: 4,
  },
  statementCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 56,
    width: "100%",
  },
  statementBigDay: { fontSize: 240, color: DS_COLORS.WHITE, fontWeight: "800", lineHeight: 250 },
  statementDaysIn: { fontSize: 36, color: CARD_STYLES.dimWhite, letterSpacing: 5, fontWeight: "500" },
  statementChallengeName: { marginTop: 20, fontSize: 54, color: DS_COLORS.WHITE, fontWeight: "600", textAlign: "center" },
  statementBottomLeft: { position: "absolute", left: 56, bottom: 90, right: 56 },
  statementCallout: { fontSize: 30, color: CARD_STYLES.mutedWhite, marginBottom: 20 },
  statementAccentBar: { width: 520, height: 6, backgroundColor: CARD_STYLES.accentColor, borderRadius: 3 },
  photoDim: { flex: 1, backgroundColor: DS_COLORS.MODAL_BACKDROP },
  transparentBottomPanel: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 40,
    borderRadius: DS_RADIUS.LG,
    backgroundColor: DS_COLORS.MODAL_BACKDROP,
    padding: 28,
  },
  transparentTask: { color: DS_COLORS.WHITE, fontSize: 38, fontWeight: "700" },
  transparentMeta: { color: CARD_STYLES.dimWhite, fontSize: 26, marginTop: 8 },
  transparentStatsRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 },
  transparentDay: { color: DS_COLORS.WHITE, fontSize: 78, fontWeight: "800" },
  transparentStatText: { color: DS_COLORS.WHITE, fontSize: 32, fontWeight: "700" },
  receiptHeader: { marginTop: 72, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  wordmarkHeaderLight: { color: DS_COLORS.TEXT_PRIMARY, fontSize: 40, fontWeight: "700", letterSpacing: 2 },
  receiptDayLight: { color: DS_COLORS.TEXT_SECONDARY, fontSize: 30, fontWeight: "600" },
  receiptSub: { color: DS_COLORS.GREEN, fontSize: 26, marginTop: 20, fontWeight: "600" },
  listWrap: { marginTop: 36, gap: 18 },
  listItemLight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.BORDER,
    padding: 20,
    borderRadius: DS_RADIUS.LG,
  },
  checkMark: { color: DS_COLORS.GREEN, fontSize: 32, marginRight: 14 },
  listItemMid: { flex: 1 },
  listNameLight: { color: DS_COLORS.TEXT_PRIMARY, fontSize: 31, fontWeight: "700" },
  listDetailsLight: { color: DS_COLORS.TEXT_SECONDARY, fontSize: 22, marginTop: 4 },
  listTimeLight: { color: DS_COLORS.TEXT_MUTED, fontSize: 20, marginLeft: 12 },
  bottomStat: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 12, marginTop: 44 },
  bottomDayLight: { color: DS_COLORS.TEXT_PRIMARY, fontSize: 96, fontWeight: "800", lineHeight: 100 },
  bottomFire: { color: DS_COLORS.TEXT_PRIMARY, fontSize: 54, marginBottom: 10 },
  bottomRankLight: { color: DS_COLORS.TEXT_SECONDARY, fontSize: 30, fontWeight: "600", marginBottom: 12 },
  bottomChallengeLight: { color: DS_COLORS.TEXT_SECONDARY, fontSize: 24, textAlign: "center", marginTop: 12 },
  breakdownTitle: { color: DS_COLORS.TEXT_PRIMARY, fontSize: 78, fontWeight: "800", marginTop: 220, marginHorizontal: 0 },
  breakdownSubLight: { color: DS_COLORS.TEXT_SECONDARY, fontSize: 28, marginTop: 8, marginHorizontal: 0 },
  calloutBody: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 80 },
  calloutPre: { color: CARD_STYLES.dimWhite, fontSize: 34, fontWeight: "600", letterSpacing: 2 },
  calloutChallenge: { color: DS_COLORS.WHITE, fontSize: 98, fontWeight: "800", textAlign: "center", marginTop: 20 },
  calloutStats: { color: CARD_STYLES.dimWhite, fontSize: 36, textAlign: "center", lineHeight: 52, marginTop: 24 },
  calloutCta: { color: CARD_STYLES.accentColor, fontSize: 44, fontWeight: "800", marginTop: 44, marginBottom: 22 },
});
