import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { DS_COLORS, DS_RADIUS, DS_BORDERS, GRIIT_COLORS } from "@/lib/design-system";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;
/** Logical preview size (story ratio); scale from full export size. */
export const PREVIEW_CARD_W = 360;
export const PREVIEW_CARD_H = 640;
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
  totalDays,
  challengeName,
  calloutText,
  proofPhotoUri,
  streak = 0,
}: {
  dayNumber: number;
  /** For progress bar; defaults to dayNumber if omitted */
  totalDays?: number;
  challengeName: string;
  calloutText: string;
  proofPhotoUri?: string | null;
  streak?: number;
}) {
  const daysLabel = dayNumber === 1 ? "DAY" : "DAYS";
  const td = Math.max(1, totalDays ?? dayNumber);
  const progressPct = Math.min(100, Math.round((dayNumber / td) * 100));

  const centerContent = (
    <>
      <Text style={s.statementBigDay}>{dayNumber}</Text>
      <Text style={s.statementDaysIn}>
        {daysLabel} IN
      </Text>
      <Text style={s.statementChallengeName}>{challengeName}</Text>
      <View style={s.statementProgressTrack}>
        <View style={[s.statementProgressFill, { width: `${progressPct}%` }]} />
      </View>
      {streak > 0 ? (
        <Text style={s.statementStreak}>
          🔥 {streak} day streak
        </Text>
      ) : null}
    </>
  );

  if (proofPhotoUri) {
    return (
      <View style={[s.card, s.cardDark]}>
        <Text style={s.wordmarkTopLeft}>GRIIT</Text>
        <View style={s.statementBody}>
          <ImageBackground source={{ uri: proofPhotoUri }} style={s.statementHero} resizeMode="cover">
            <View style={s.statementHeroStack}>
              <View style={s.statementHeroDim} />
              <View style={s.statementCenterOnPhoto}>{centerContent}</View>
            </View>
          </ImageBackground>
        </View>
        <View style={s.statementBottomLeft}>
          <Text style={s.statementCallout}>{calloutText}</Text>
          <View style={s.statementAccentBar} />
        </View>
      </View>
    );
  }

  /** No photo: solid base + diagonal gradient (avoids pure-black capture failures). */
  return (
    <View style={s.statementRootNoPhoto} collapsable={false}>
      <LinearGradient
        colors={[DS_COLORS.HEADER_MIND_DEEP, DS_COLORS.DARK_BG_PAGE, DS_COLORS.DISCOVER_HERO_DARK_BG]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Text style={s.statementWordmarkTop}>G R I I T</Text>
      <View style={s.statementCenterColumn}>{centerContent}</View>
      <View style={s.statementBottomBlock}>
        <Text style={s.statementCalloutNoAbs}>{calloutText}</Text>
        <View style={s.statementAccentBar} />
      </View>
      <Text style={s.statementBrandBottom}>GRIIT.APP</Text>
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
    <View style={[s.card, s.cardOverflow, { backgroundColor: DS_COLORS.DARK_BG_PAGE }]}>
      <LinearGradient
        colors={[DS_COLORS.DISCOVER_HERO_DARK_BG, DS_COLORS.DARK_BG_PAGE]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {content}
    </View>
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
    <View style={[s.card, s.cardOverflow, { backgroundColor: DS_COLORS.DARK_BG_PAGE }]}>
      <LinearGradient
        colors={[DS_COLORS.DARK_BG_PAGE, DS_COLORS.DISCOVER_HERO_DARK_BG]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Text style={s.wordmarkTopRight}>GRIIT</Text>
      <View style={s.calloutBody}>
        <Text style={s.calloutPre}>I JUST FINISHED</Text>
        <Text style={s.calloutChallenge}>{challengeName.toUpperCase()}</Text>
        <Text style={s.calloutStats}>{totalDays} days, {totalTasks} tasks completed.{"\n"}Zero excuses. Zero days missed.</Text>
        <Text style={s.calloutCta}>THINK YOU CAN DO IT?</Text>
        <View style={s.statementAccentBar} />
      </View>
    </View>
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
  statementBody: { flex: 1, alignSelf: "stretch", width: "100%", minHeight: 0 },
  statementHero: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  statementHeroFill: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    position: "relative",
    overflow: "hidden",
  },
  statementCenterOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 56,
    width: "100%",
  },
  statementBigDay: { fontSize: 240, color: DS_COLORS.WHITE, fontWeight: "800", lineHeight: 250 },
  statementDaysIn: { fontSize: 36, color: CARD_STYLES.dimWhite, letterSpacing: 5, fontWeight: "500" },
  statementChallengeName: { marginTop: 20, fontSize: 54, color: DS_COLORS.WHITE, fontWeight: "600", textAlign: "center" },
  statementRootNoPhoto: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: DS_COLORS.DARK_BG_PAGE,
    borderRadius: DS_RADIUS.LG,
    overflow: "hidden",
  },
  statementWordmarkTop: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 30,
    letterSpacing: 8,
    color: "rgba(255,255,255,0.35)",
    fontWeight: "500",
    zIndex: 2,
  },
  statementCenterColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 56,
    paddingTop: 120,
    paddingBottom: 280,
  },
  statementBottomBlock: { position: "absolute", left: 56, right: 56, bottom: 100 },
  statementCalloutNoAbs: { fontSize: 30, color: CARD_STYLES.mutedWhite, marginBottom: 20 },
  statementBrandBottom: {
    position: "absolute",
    bottom: 44,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 22,
    color: "rgba(255,255,255,0.25)",
    zIndex: 2,
  },
  statementProgressTrack: {
    width: "80%",
    maxWidth: 720,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 4,
    marginTop: 32,
    overflow: "hidden",
  },
  statementProgressFill: {
    height: "100%",
    backgroundColor: CARD_STYLES.accentColor,
    borderRadius: 4,
  },
  statementStreak: { marginTop: 24, fontSize: 28, color: CARD_STYLES.mutedWhite },
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
