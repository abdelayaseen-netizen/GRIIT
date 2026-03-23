import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

// ============================================================
// CARD 1: STATEMENT — huge day number, minimal, pure identity
// ============================================================
export function StatementCard({
  dayNumber,
  challengeName,
}: {
  dayNumber: number;
  challengeName: string;
}) {
  return (
    <View style={s.root}>
      <Text style={s.wordmark}>GRIIT</Text>
      <View style={s.center}>
        <Text style={s.bigNumber}>{dayNumber}</Text>
        <Text style={s.daysIn}>DAYS IN</Text>
        <View style={s.divider} />
        <Text style={s.challengeLabel}>{challengeName}</Text>
      </View>
      <View style={s.bottom}>
        <Text style={s.ghostText}>Most quit by Day 3.</Text>
        <Text style={s.url}>griit.app</Text>
      </View>
    </View>
  );
}

// ============================================================
// CARD 2: TRANSPARENT — stats overlay for user's own photo
// ============================================================
export function TransparentCard({
  dayNumber,
  challengeName,
  streakCount,
  completionTime,
  isHardMode,
}: {
  dayNumber: number;
  challengeName: string;
  streakCount: number;
  completionTime: string;
  isHardMode?: boolean;
}) {
  return (
    <View style={[s.root, { backgroundColor: "transparent" }]}>
      <View style={s.transparentBottom}>
        <View>
          <Text style={s.tWordmark}>GRIIT</Text>
          <Text style={s.tDay}>Day {dayNumber}</Text>
          <Text style={s.tChallenge}>{challengeName} · Verified</Text>
          <View style={s.tBadgeRow}>
            {isHardMode ? (
              <View style={s.tBadgeHard}>
                <Text style={s.tBadgeHardText}>HARD MODE</Text>
              </View>
            ) : null}
            {completionTime ? (
              <View style={s.tBadgeTime}>
                <Text style={s.tBadgeTimeText}>{completionTime}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={s.tStreakWrap}>
          <Text style={s.tStreakNum}>{streakCount}🔥</Text>
          <Text style={s.tStreakLabel}>streak</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================
// CARD 3: PROOF RECEIPT — photo + verified badge + stats
// ============================================================
export function ProofReceiptCard({
  taskName,
  dayNumber,
  challengeName,
  streakCount,
  completionTime,
  proofPhotoUri,
  isHardMode,
  hasHeartRate,
}: {
  taskName: string;
  dayNumber: number;
  challengeName: string;
  streakCount: number;
  completionTime: string;
  proofPhotoUri?: string | null;
  isHardMode?: boolean;
  hasHeartRate?: boolean;
}) {
  return (
    <View style={s.root}>
      <View style={s.proofPhotoArea}>
        {proofPhotoUri ? (
          <Image source={{ uri: proofPhotoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={s.proofPhotoPlaceholder}>
            <Text style={s.proofPhotoPlaceholderText}>GRIIT</Text>
          </View>
        )}
      </View>
      <View style={s.proofStats}>
        <View style={s.verifiedRow}>
          <View style={s.verifiedDot} />
          <Text style={s.verifiedText}>VERIFIED COMPLETION</Text>
        </View>
        <Text style={s.proofTaskName}>{taskName}</Text>
        <Text style={s.proofMeta}>
          Day {dayNumber} · {challengeName} · {completionTime}
        </Text>
        <View style={s.proofStatsRow}>
          <View>
            <Text style={s.proofStatLabel}>STREAK</Text>
            <Text style={s.proofStatValue}>{streakCount}</Text>
          </View>
          <View>
            <Text style={s.proofStatLabel}>STATUS</Text>
            <Text style={[s.proofStatValue, { color: "#E8593C" }]}>{isHardMode ? "Hard" : "Done"}</Text>
          </View>
          <View>
            <Text style={s.proofStatLabel}>VERIFIED</Text>
            <Text style={[s.proofStatValue, { color: "#97C459" }]}>
              {hasHeartRate ? "HR" : isHardMode ? "Timer" : "Yes"}
            </Text>
          </View>
        </View>
        <View style={s.proofDivider} />
        <View style={s.proofBrandRow}>
          <Text style={s.proofBrand}>GRIIT</Text>
          <Text style={s.proofUrl}>griit.app</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================
// CARD 4: TODAY'S GRIND — task breakdown with timestamps
// ============================================================
export function GrindCard({
  taskName,
  dayNumber,
  challengeName,
  streakCount,
  completionTime,
  isHardMode,
  hasHeartRate,
  hasPhoto,
}: {
  taskName: string;
  dayNumber: number;
  challengeName: string;
  streakCount: number;
  completionTime: string;
  isHardMode?: boolean;
  hasHeartRate?: boolean;
  hasPhoto?: boolean;
}) {
  const verificationDetail =
    [isHardMode && "Hard mode", hasHeartRate && "HR verified", hasPhoto && "Photo proof"].filter(Boolean).join(" · ") ||
    "Completed";

  return (
    <View style={s.root}>
      <View style={s.grindHeader}>
        <Text style={s.grindWordmark}>GRIIT</Text>
        <Text style={s.grindDayLabel}>
          Day {dayNumber} of {challengeName}
        </Text>
      </View>
      <Text style={s.grindTitle}>{"Today's grind"}</Text>
      <Text style={s.grindSubtitle}>Task secured · {completionTime}</Text>

      <View style={s.grindTasksWrap}>
        <View style={s.grindTaskRow}>
          <Text style={s.grindCheck}>✓</Text>
          <View style={s.grindTaskInfo}>
            <Text style={s.grindTaskName}>{taskName}</Text>
            <Text style={s.grindTaskDetail}>{verificationDetail}</Text>
          </View>
          <Text style={s.grindTaskTime}>{completionTime}</Text>
        </View>
      </View>

      <View style={s.grindBottom}>
        <View>
          <Text style={s.grindStreakNum}>{streakCount} 🔥</Text>
          <Text style={s.grindStreakLabel}>DAY STREAK</Text>
        </View>
        <Text style={s.grindUrl}>griit.app</Text>
      </View>
    </View>
  );
}

// ============================================================
// CARD 5: THE CALLOUT — challenge completion, CTA to join
// ============================================================
export function CalloutCard({
  challengeName,
  totalDays,
  totalTasks,
}: {
  challengeName: string;
  totalDays: number;
  totalTasks: number;
}) {
  return (
    <View style={s.root}>
      <View style={s.center}>
        <Text style={[s.wordmark, { textAlign: "center" }]}>GRIIT</Text>
        <Text style={s.calloutPre}>I JUST FINISHED</Text>
        <Text style={s.calloutChallenge}>{challengeName.toUpperCase()}</Text>
        <View style={s.divider} />
        <Text style={s.calloutStats}>
          {totalDays} days. {totalTasks} tasks completed.{"\n"}Zero excuses. Zero days missed.
        </Text>
        <View style={s.calloutPill}>
          <Text style={s.calloutPillText}>THINK YOU CAN DO IT?</Text>
        </View>
      </View>
      <View style={s.bottom}>
        <Text style={s.url}>griit.app</Text>
      </View>
    </View>
  );
}

// ============================================================
// STYLES — all cards render at 1080×1920 for ViewShot capture
// ============================================================
const s = StyleSheet.create({
  root: { width: 1080, height: 1920, backgroundColor: "#050505", justifyContent: "center" },
  wordmark: { position: "absolute", top: 80, left: 60, fontSize: 48, fontWeight: "800", color: "#E8593C", letterSpacing: 1 },
  center: { alignItems: "center", justifyContent: "center", flex: 1, paddingHorizontal: 80 },
  bottom: { position: "absolute", bottom: 60, left: 0, right: 0, alignItems: "center" },
  divider: { width: 100, height: 4, backgroundColor: "#E8593C", marginVertical: 30, borderRadius: 2 },
  url: { fontSize: 28, color: "rgba(255,255,255,0.12)", letterSpacing: 1 },
  ghostText: { fontSize: 32, color: "rgba(255,255,255,0.15)", marginBottom: 20 },

  bigNumber: { fontSize: 200, fontWeight: "800", color: "#fff", letterSpacing: -4 },
  daysIn: { fontSize: 36, letterSpacing: 8, color: "rgba(255,255,255,0.3)", marginTop: 10 },
  challengeLabel: { fontSize: 44, fontWeight: "600", color: "rgba(255,255,255,0.7)", marginTop: 10 },

  transparentBottom: {
    position: "absolute",
    bottom: 80,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  tWordmark: {
    fontSize: 36,
    fontWeight: "800",
    color: "rgba(255,255,255,0.85)",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tDay: {
    fontSize: 80,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginTop: 4,
  },
  tChallenge: {
    fontSize: 32,
    color: "rgba(255,255,255,0.5)",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginTop: 4,
  },
  tBadgeRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  tBadgeHard: { backgroundColor: "rgba(232,89,60,0.4)", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  tBadgeHardText: { fontSize: 24, fontWeight: "700", color: "#E8593C" },
  tBadgeTime: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  tBadgeTimeText: { fontSize: 24, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  tStreakWrap: { alignItems: "flex-end" },
  tStreakNum: {
    fontSize: 80,
    fontWeight: "800",
    color: "#E8593C",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tStreakLabel: {
    fontSize: 24,
    color: "rgba(255,255,255,0.4)",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  proofPhotoArea: { width: 1080, height: 1060, backgroundColor: "rgba(255,255,255,0.03)" },
  proofPhotoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  proofPhotoPlaceholderText: { fontSize: 80, fontWeight: "800", color: "rgba(255,255,255,0.04)" },
  proofStats: { flex: 1, paddingHorizontal: 60, paddingTop: 40, justifyContent: "flex-end", paddingBottom: 60 },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  verifiedDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#97C459" },
  verifiedText: { fontSize: 24, fontWeight: "700", color: "#97C459", letterSpacing: 1 },
  proofTaskName: { fontSize: 48, fontWeight: "700", color: "#fff" },
  proofMeta: { fontSize: 28, color: "rgba(255,255,255,0.35)", marginTop: 8 },
  proofStatsRow: { flexDirection: "row", gap: 48, marginTop: 32 },
  proofStatLabel: { fontSize: 22, color: "rgba(255,255,255,0.25)", letterSpacing: 1 },
  proofStatValue: { fontSize: 48, fontWeight: "700", color: "#fff", marginTop: 4 },
  proofDivider: { width: "100%", height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 24 },
  proofBrandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  proofBrand: { fontSize: 32, fontWeight: "800", color: "#E8593C", letterSpacing: 1 },
  proofUrl: { fontSize: 24, color: "rgba(255,255,255,0.12)" },

  grindHeader: {
    position: "absolute",
    top: 80,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grindWordmark: { fontSize: 36, fontWeight: "800", color: "#E8593C", letterSpacing: 1 },
  grindDayLabel: { fontSize: 28, color: "rgba(255,255,255,0.3)" },
  grindTitle: { fontSize: 56, fontWeight: "700", color: "#fff", marginTop: 200, marginLeft: 60 },
  grindSubtitle: { fontSize: 28, color: "rgba(255,255,255,0.3)", marginTop: 8, marginLeft: 60 },
  grindTasksWrap: { marginTop: 60, marginHorizontal: 60, gap: 16 },
  grindTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 24,
    borderLeftWidth: 6,
    borderLeftColor: "#97C459",
  },
  grindCheck: { fontSize: 36, color: "#97C459" },
  grindTaskInfo: { flex: 1 },
  grindTaskName: { fontSize: 32, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  grindTaskDetail: { fontSize: 24, color: "rgba(255,255,255,0.3)", marginTop: 4 },
  grindTaskTime: { fontSize: 24, color: "rgba(255,255,255,0.2)" },
  grindBottom: {
    position: "absolute",
    bottom: 80,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  grindStreakNum: { fontSize: 64, fontWeight: "700", color: "#fff" },
  grindStreakLabel: { fontSize: 22, color: "rgba(255,255,255,0.25)", letterSpacing: 1 },
  grindUrl: { fontSize: 24, color: "rgba(255,255,255,0.12)" },

  calloutPre: { fontSize: 28, letterSpacing: 2, color: "rgba(255,255,255,0.25)", marginBottom: 10 },
  calloutChallenge: { fontSize: 72, fontWeight: "700", color: "#fff", textAlign: "center", letterSpacing: -1 },
  calloutStats: { fontSize: 32, color: "rgba(255,255,255,0.35)", textAlign: "center", lineHeight: 48, marginTop: 10 },
  calloutPill: {
    marginTop: 50,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(232,89,60,0.35)",
    borderRadius: 40,
  },
  calloutPillText: { fontSize: 28, fontWeight: "700", color: "#E8593C", letterSpacing: 2 },
});
