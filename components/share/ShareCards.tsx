import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

const COLORS = {
  dark: "#111111",
  cream: "#F5F0E8",
  accent: "#E8593C",
  accentDim: "rgba(232, 89, 60, 0.15)",
  green: "#3D7A5A",
  greenDim: "rgba(61, 122, 90, 0.15)",
  white: "#FFFFFF",
  whiteMuted: "rgba(255, 255, 255, 0.5)",
  whiteDim: "rgba(255, 255, 255, 0.35)",
  whiteSubtle: "rgba(255, 255, 255, 0.08)",
  watermark: "rgba(255, 255, 255, 0.25)",
  watermarkDark: "rgba(0, 0, 0, 0.12)",
  darkText: "#1a1a1a",
  darkTextMuted: "#999999",
} as const;

export interface BaseCardProps {
  challengeName: string;
  dayNumber: number;
  totalDays: number;
  streak: number;
  taskName: string;
}

export interface StatementCardProps extends BaseCardProps {
  completionTime?: string;
  rank?: string;
}

export interface TransparentCardProps extends BaseCardProps {
  completionTime?: string;
}

export interface ProofPhotoCardProps extends BaseCardProps {
  proofPhotoUri: string;
  completionTime?: string;
  isHardMode?: boolean;
  isVerified?: boolean;
}

export interface DayRecapCardProps {
  challengeName: string;
  dayNumber: number;
  streak: number;
  rank?: string;
  tasks: Array<{
    name: string;
    details: string;
    timestamp: string;
  }>;
}

export interface ChallengeCompleteCardProps {
  challengeName: string;
  totalDays: number;
  totalTasks: number;
}

export interface MinimalStreakCardProps {
  streak: number;
  challengeName: string;
}

const textShadowReadable = {
  textShadowColor: "rgba(0, 0, 0, 0.3)",
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 8,
} as const;

export function StatementCard({
  challengeName,
  dayNumber,
  streak,
  taskName,
  completionTime,
  rank,
}: StatementCardProps) {
  return (
    <View style={statementStyles.container}>
      <Text style={statementStyles.watermark}>GRIIT</Text>

      <View style={statementStyles.center}>
        <Text style={statementStyles.dayNumber} adjustsFontSizeToFit numberOfLines={1}>
          {dayNumber}
        </Text>
        <Text style={statementStyles.daysIn}>{dayNumber === 1 ? "DAY IN" : "DAYS IN"}</Text>
        <View style={statementStyles.accentBar} />
        <Text style={statementStyles.challengeName} numberOfLines={2}>
          {challengeName}
        </Text>
        <Text style={statementStyles.taskSubtitle}>{taskName} secured</Text>
      </View>

      <View style={statementStyles.bottomRow}>
        <View>
          <Text style={statementStyles.streakLabel}>STREAK</Text>
          <Text style={statementStyles.streakValue}>{streak}</Text>
        </View>
        <View style={statementStyles.bottomRight}>
          {completionTime ? <Text style={statementStyles.timeText}>{completionTime}</Text> : null}
          {rank ? (
            <View style={statementStyles.rankPill}>
              <Text style={statementStyles.rankText}>{rank}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const statementStyles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.dark,
  },
  watermark: {
    position: "absolute",
    top: 80,
    left: 80,
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
    color: COLORS.watermark,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  dayNumber: {
    fontSize: 320,
    fontWeight: "800",
    color: COLORS.white,
    lineHeight: 340,
  },
  daysIn: {
    fontSize: 56,
    fontWeight: "600",
    letterSpacing: 8,
    color: COLORS.whiteDim,
    marginTop: 8,
  },
  accentBar: {
    width: 160,
    height: 10,
    backgroundColor: COLORS.accent,
    borderRadius: 5,
    marginTop: 24,
    marginBottom: 24,
  },
  challengeName: {
    fontSize: 72,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
  },
  taskSubtitle: {
    fontSize: 48,
    color: COLORS.whiteDim,
    textAlign: "center",
    marginTop: 16,
  },
  bottomRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  streakLabel: {
    fontSize: 42,
    color: COLORS.whiteDim,
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 96,
    fontWeight: "700",
    color: COLORS.accent,
  },
  bottomRight: {
    alignItems: "flex-end",
    gap: 12,
  },
  timeText: {
    fontSize: 42,
    color: "rgba(255,255,255,0.3)",
  },
  rankPill: {
    backgroundColor: COLORS.whiteSubtle,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 32,
  },
  rankText: {
    fontSize: 36,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export function TransparentCard({
  challengeName,
  dayNumber,
  totalDays,
  streak,
  taskName,
  completionTime,
}: TransparentCardProps) {
  return (
    <View style={transparentStyles.container}>
      <View style={transparentStyles.dayPill}>
        <Text style={transparentStyles.dayPillText}>
          DAY {dayNumber} OF {totalDays}
        </Text>
      </View>

      <Text style={transparentStyles.challengeName}>{challengeName.toUpperCase()}</Text>
      <Text style={transparentStyles.taskName}>{taskName.toUpperCase()}</Text>

      <Text style={transparentStyles.streakLabel}>STREAK</Text>
      <Text style={transparentStyles.streakNumber}>{streak}</Text>

      <View style={transparentStyles.divider} />

      {completionTime ? (
        <>
          <Text style={transparentStyles.timeLabel}>TIME</Text>
          <Text style={transparentStyles.timeValue}>{completionTime}</Text>
        </>
      ) : null}

      <Text style={transparentStyles.brand}>GRIIT</Text>
    </View>
  );
}

const transparentStyles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  dayPill: {
    backgroundColor: "rgba(232, 89, 60, 0.3)",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 40,
    marginBottom: 32,
  },
  dayPillText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FF6B4A",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  challengeName: {
    fontSize: 96,
    fontWeight: "900",
    color: COLORS.white,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
  },
  taskName: {
    fontSize: 48,
    fontWeight: "600",
    color: COLORS.white,
    opacity: 0.65,
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 40,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  streakLabel: {
    fontSize: 42,
    fontWeight: "800",
    color: COLORS.accent,
    opacity: 0.7,
    letterSpacing: 6,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  streakNumber: {
    fontSize: 340,
    fontWeight: "900",
    color: COLORS.white,
    marginBottom: 24,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 24,
  },
  divider: {
    width: 120,
    height: 8,
    backgroundColor: COLORS.accent,
    opacity: 0.7,
    borderRadius: 4,
    marginBottom: 32,
  },
  timeLabel: {
    fontSize: 42,
    fontWeight: "800",
    color: COLORS.accent,
    opacity: 0.7,
    letterSpacing: 6,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  timeValue: {
    fontSize: 80,
    fontWeight: "800",
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 8,
    marginBottom: 40,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  brand: {
    fontSize: 72,
    fontWeight: "900",
    letterSpacing: 16,
    color: COLORS.white,
    opacity: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
});

export function ProofPhotoCard({
  challengeName,
  dayNumber,
  taskName,
  proofPhotoUri,
  completionTime,
  isHardMode,
  isVerified,
}: ProofPhotoCardProps) {
  return (
    <ImageBackground source={{ uri: proofPhotoUri }} style={proofStyles.container} resizeMode="cover">
      <Text style={proofStyles.watermark}>GRIIT</Text>

      {isVerified ? (
        <View style={proofStyles.verifiedPill}>
          <Text style={proofStyles.verifiedText}>Verified</Text>
        </View>
      ) : null}

      <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={proofStyles.gradient}>
        <Text style={proofStyles.taskSubtitle}>{taskName} completed</Text>
        <View style={proofStyles.bottomMainRow}>
          <Text style={proofStyles.dayChallenge}>
            Day {dayNumber} · {challengeName}
          </Text>
          {completionTime ? <Text style={proofStyles.time}>{completionTime}</Text> : null}
        </View>
        <View style={proofStyles.badgeRow}>
          {isHardMode ? (
            <View style={proofStyles.orangePill}>
              <Text style={proofStyles.orangePillText}>Hard mode</Text>
            </View>
          ) : null}
          <View style={proofStyles.greenPill}>
            <Text style={proofStyles.greenPillText}>Photo proof</Text>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const proofStyles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  watermark: {
    position: "absolute",
    top: 80,
    left: 80,
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
    color: COLORS.watermark,
    ...textShadowReadable,
    zIndex: 2,
  },
  verifiedPill: {
    position: "absolute",
    top: 80,
    right: 80,
    backgroundColor: COLORS.greenDim,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 28,
    zIndex: 2,
  },
  verifiedText: {
    fontSize: 36,
    fontWeight: "600",
    color: COLORS.green,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Math.round(CARD_HEIGHT * 0.42),
    justifyContent: "flex-end",
    padding: 80,
    paddingTop: 120,
  },
  taskSubtitle: {
    fontSize: 48,
    color: COLORS.whiteMuted,
    marginBottom: 12,
  },
  bottomMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    gap: 16,
  },
  dayChallenge: {
    flex: 1,
    fontSize: 72,
    fontWeight: "600",
    color: COLORS.white,
  },
  time: {
    fontSize: 48,
    color: COLORS.whiteDim,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  orangePill: {
    backgroundColor: COLORS.accentDim,
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  orangePillText: {
    fontSize: 36,
    fontWeight: "600",
    color: COLORS.accent,
  },
  greenPill: {
    backgroundColor: COLORS.greenDim,
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  greenPillText: {
    fontSize: 36,
    fontWeight: "600",
    color: COLORS.green,
  },
});

export function DayRecapCard({ challengeName, dayNumber, streak, rank, tasks }: DayRecapCardProps) {
  return (
    <View style={recapStyles.container}>
      <Text style={recapStyles.watermark}>GRIIT</Text>

      <Text style={recapStyles.daySecured}>DAY {dayNumber} SECURED</Text>
      <Text style={recapStyles.challengeName}>{challengeName}</Text>
      <Text style={recapStyles.allTasks}>
        All {tasks.length} task{tasks.length !== 1 ? "s" : ""} completed
      </Text>

      <View style={recapStyles.separator} />

      <View style={recapStyles.taskList}>
        {tasks.map((task, idx) => (
          <View key={idx} style={recapStyles.taskRow}>
            <View style={recapStyles.checkCircle}>
              <Text style={recapStyles.checkMark}>✓</Text>
            </View>
            <View style={recapStyles.taskInfo}>
              <Text style={recapStyles.taskName}>{task.name}</Text>
              <Text style={recapStyles.taskDetails}>
                {task.details}
                {task.details && task.timestamp ? " · " : ""}
                {task.timestamp}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={recapStyles.separator} />

      <View style={recapStyles.bottomRow}>
        <View>
          <Text style={recapStyles.streakNumber}>{streak}</Text>
          <Text style={recapStyles.streakLabel}>day streak</Text>
        </View>
        {rank ? (
          <View style={recapStyles.rankPill}>
            <Text style={recapStyles.rankText}>{rank}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const recapStyles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.cream,
    padding: 80,
    flexDirection: "column",
  },
  taskList: {
    flex: 1,
  },
  watermark: {
    position: "absolute",
    top: 80,
    right: 80,
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
    color: "rgba(232,89,60,0.3)",
  },
  daySecured: {
    fontSize: 48,
    fontWeight: "600",
    color: COLORS.accent,
    letterSpacing: 4,
    marginTop: 40,
    marginBottom: 12,
  },
  challengeName: {
    fontSize: 84,
    fontWeight: "700",
    color: COLORS.darkText,
    marginBottom: 12,
  },
  allTasks: {
    fontSize: 42,
    color: COLORS.darkTextMuted,
    marginBottom: 8,
  },
  separator: {
    height: 3,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 40,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 32,
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: "700",
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 48,
    fontWeight: "500",
    color: COLORS.darkText,
  },
  taskDetails: {
    fontSize: 42,
    color: COLORS.darkTextMuted,
    marginTop: 6,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
  },
  streakNumber: {
    fontSize: 108,
    fontWeight: "800",
    color: COLORS.accent,
  },
  streakLabel: {
    fontSize: 42,
    color: COLORS.darkTextMuted,
  },
  rankPill: {
    backgroundColor: COLORS.accentDim,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 32,
  },
  rankText: {
    fontSize: 36,
    fontWeight: "600",
    color: COLORS.accent,
  },
});

export function ChallengeCompleteCard({ challengeName, totalDays, totalTasks }: ChallengeCompleteCardProps) {
  return (
    <LinearGradient colors={["#1a0e08", COLORS.dark]} style={completeStyles.container}>
      <Text style={completeStyles.watermark}>GRIIT</Text>

      <View style={completeStyles.center}>
        <Text style={completeStyles.justFinished}>I JUST FINISHED</Text>
        <Text style={completeStyles.challengeName} adjustsFontSizeToFit numberOfLines={2}>
          {challengeName.toUpperCase()}
        </Text>
        <View style={completeStyles.accentBar} />
        <Text style={completeStyles.stats}>
          {totalDays} days. {totalTasks} tasks.{"\n"}Zero excuses.
        </Text>
        <Text style={completeStyles.cta}>THINK YOU CAN?</Text>
      </View>

      <LinearGradient
        colors={["transparent", COLORS.accent, "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={completeStyles.bottomLine}
      />
    </LinearGradient>
  );
}

const completeStyles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  watermark: {
    position: "absolute",
    top: 80,
    right: 80,
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
    color: COLORS.whiteDim,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  justFinished: {
    fontSize: 42,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 6,
    textTransform: "uppercase",
    marginBottom: 24,
  },
  challengeName: {
    fontSize: 160,
    fontWeight: "800",
    color: COLORS.white,
    textAlign: "center",
    textTransform: "uppercase",
    lineHeight: 168,
  },
  accentBar: {
    width: 200,
    height: 12,
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    marginVertical: 32,
  },
  stats: {
    fontSize: 48,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    lineHeight: 72,
    marginBottom: 40,
  },
  cta: {
    fontSize: 56,
    fontWeight: "600",
    color: COLORS.accent,
    letterSpacing: 4,
    textAlign: "center",
  },
  bottomLine: {
    position: "absolute",
    bottom: 60,
    left: 60,
    right: 60,
    height: 8,
  },
});

export function MinimalStreakCard({ streak, challengeName }: MinimalStreakCardProps) {
  return (
    <View style={minimalStyles.container}>
      <Text style={minimalStyles.watermark}>GRIIT</Text>

      <View style={minimalStyles.center}>
        <Text style={minimalStyles.currentStreak}>CURRENT STREAK</Text>
        <Text style={minimalStyles.streakNumber} adjustsFontSizeToFit numberOfLines={1}>
          {streak}
        </Text>
        <Text style={minimalStyles.daysLabel}>{streak === 1 ? "DAY" : "DAYS"}</Text>
        <View style={minimalStyles.accentBar} />
        <Text style={minimalStyles.challengeName}>{challengeName}</Text>
      </View>

      <Text style={minimalStyles.bottomWatermark}>GRIIT</Text>
    </View>
  );
}

const minimalStyles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.dark,
  },
  watermark: {
    position: "absolute",
    top: 80,
    left: 80,
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 2,
    color: COLORS.watermark,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  currentStreak: {
    fontSize: 42,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 6,
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 400,
    fontWeight: "800",
    color: COLORS.white,
    lineHeight: 420,
  },
  daysLabel: {
    fontSize: 48,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 4,
    marginTop: 8,
  },
  accentBar: {
    width: 160,
    height: 10,
    backgroundColor: COLORS.accent,
    borderRadius: 5,
    marginTop: 32,
    marginBottom: 32,
  },
  challengeName: {
    fontSize: 56,
    fontWeight: "500",
    color: COLORS.whiteMuted,
    textAlign: "center",
  },
  bottomWatermark: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 8,
    color: "rgba(255,255,255,0.15)",
  },
});

export const SHARE_CARD_DIMENSIONS = { width: CARD_WIDTH, height: CARD_HEIGHT };
