import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, Shield, ShieldOff } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import type { ProfileRecord } from "@/lib/profile-v2-record";
import { DS_V3 } from "@/lib/design-system";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PushedHeader from "@/components/ds/PushedHeader";
import DisplayNumber from "@/components/ds/DisplayNumber";
import Card from "@/components/ds/Card";
import Divider from "@/components/ds/Divider";
import {
  BY_CHALLENGE_LABEL,
  BY_MONTH_LABEL,
  CAMERA_PROOF_LABEL,
  COMPLETION_LABEL,
  CONSISTENCY_FOOTER,
  CONSISTENCY_TITLE,
  DAYS_CAPTION,
  DAYS_SECURED_LABEL,
  FIRST_PROOF_LABEL,
  LONGEST_STREAK_LABEL,
  SELF_REPORTED_LABEL,
  TOTAL_SECURED_LABEL,
  challengeProofCaption,
  completionPct,
  daysValue,
  heroDayLine,
  lastStandSplitLine,
  ofElapsed,
  recordDayDetail,
  recordDayLabel,
  recordDayNumber,
  type RecordDayRow,
} from "@/lib/consistency-record";

type RecordPayload = ProfileRecord & {
  timezone: string;
  todayKey: string;
  elapsedMs: number;
  days?: RecordDayRow[];
};

const ICON = DS_V3.space.lg;
const BAR = DS_V3.space.xs + DS_V3.space.xs / 2;
const RATIO = 56;
const PT = DS_V3.space.xs / 4;

export default function ConsistencyDetailScreen() {
  const router = useRouter();
  const { userId: userIdParam } = useLocalSearchParams<{ userId?: string }>();
  const { user } = useAuth();
  const targetId = userIdParam || user?.id || "";
  const q = useQuery({
    queryKey: ["profiles", "getRecord", targetId],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getRecord, userIdParam ? { userId: userIdParam } : undefined) as Promise<RecordPayload>,
    staleTime: 60 * 1000,
    enabled: !!targetId,
  });
  const rec = q.data;
  const secured = rec?.consistency.verifiedClosed ?? 0;
  const elapsed = rec?.consistency.closedDueDays ?? 0;
  const primary = rec?.runs[0];
  const months = (rec?.detail.months ?? []).filter((m) => m.pct > 0 || m.value !== "0 of 0");
  const challenges = rec?.detail.byChallenge ?? [];
  const days = rec?.days ?? [];
  const lastStandDays = rec?.detail.lastStandDays ?? 0;

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <PushedHeader
          title={CONSISTENCY_TITLE}
          onBack={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_PROFILE as never))}
        />
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>{DAYS_SECURED_LABEL}</Text>
          <View style={styles.hero}>
            <DisplayNumber value={secured} size="home" />
            <Text style={styles.ofElapsed}>{ofElapsed(elapsed)}</Text>
          </View>
          {primary ? (
            <Text style={styles.dayLine}>{heroDayLine(primary.day, primary.dayTotal)}</Text>
          ) : null}

          <Card style={styles.stats}>
            <View style={styles.grid}>
              <View style={styles.cell}>
                <Text style={styles.label}>{LONGEST_STREAK_LABEL}</Text>
                <View style={styles.inlineNum}>
                  <DisplayNumber value={rec?.detail.longestStreak ?? 0} size="inline" />
                  <Text style={styles.daysCap}>{DAYS_CAPTION}</Text>
                </View>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>{TOTAL_SECURED_LABEL}</Text>
                <View style={styles.inlineNum}>
                  <DisplayNumber value={rec?.detail.totalVerified ?? 0} size="inline" />
                  <Text style={styles.daysCap}>{DAYS_CAPTION}</Text>
                </View>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>{COMPLETION_LABEL}</Text>
                <Text style={styles.heading}>
                  {completionPct(
                    rec?.consistency.verifiedClosed ?? 0,
                    rec?.consistency.closedDueDays ?? 0,
                  )}
                </Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>{FIRST_PROOF_LABEL}</Text>
                <Text style={styles.heading}>{rec?.detail.firstProof ?? "—"}</Text>
              </View>
            </View>
            <Divider style={styles.splitRule} />
            <View style={styles.splitRow}>
              <Camera size={ICON} color={DS_V3.color.textSecondary} strokeWidth={2} />
              <Text style={styles.splitLabel}>{CAMERA_PROOF_LABEL}</Text>
              <Text style={styles.splitVal}>{daysValue(rec?.detail.cameraDays ?? 0)}</Text>
            </View>
            <View style={styles.splitRow}>
              <ShieldOff size={ICON} color={DS_V3.color.textSecondary} strokeWidth={2} />
              <Text style={styles.splitLabel}>{SELF_REPORTED_LABEL}</Text>
              <Text style={styles.splitVal}>{daysValue(rec?.detail.selfReportedDays ?? 0)}</Text>
            </View>
            <View style={styles.splitRow}>
              <Shield size={16} color={DS_V3.color.textSecondary} strokeWidth={2} />
              <Text style={styles.splitLabel}>{lastStandSplitLine(lastStandDays)}</Text>
            </View>
          </Card>

          <Text style={[styles.label, styles.section]}>{BY_MONTH_LABEL}</Text>
          {months.map((m, i) => (
            <View key={m.label}>
              <View style={styles.monthRow}>
                <Text style={styles.monthName}>{m.label}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.round(m.pct * 100)}%` }]} />
                </View>
                <Text style={styles.ratio}>{m.value}</Text>
              </View>
              {i < months.length - 1 ? <Divider /> : null}
            </View>
          ))}
          {days.map((day, i) => {
            const securedDay = day.state === "secured";
            return (
              <View key={day.dateKey}>
                <View style={styles.dayRow}>
                  <View style={styles.dayCopy}>
                    <Text style={securedDay ? styles.dayLabelOn : styles.dayLabelOff}>
                      {recordDayLabel(day.state)}
                    </Text>
                    <Text style={styles.chCap}>{recordDayDetail(day)}</Text>
                  </View>
                  <Text style={styles.ratio}>{recordDayNumber(day.dateKey)}</Text>
                </View>
                {i < days.length - 1 ? <Divider /> : null}
              </View>
            );
          })}

          <Text style={[styles.label, styles.section]}>{BY_CHALLENGE_LABEL}</Text>
          {challenges.map((c, i) => (
            <View key={c.label}>
              <View style={styles.chRow}>
                <View style={styles.chCopy}>
                  <Text style={styles.chName}>{c.label}</Text>
                  <Text style={styles.chCap}>
                    {challengeProofCaption(c.camera, c.selfReported)}
                  </Text>
                </View>
                <Text style={styles.ratio}>{c.value}</Text>
              </View>
              {i < challenges.length - 1 ? <Divider /> : null}
            </View>
          ))}

          <Text style={styles.footer}>{CONSISTENCY_FOOTER}</Text>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.section,
    gap: DS_V3.space.sm,
  },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
  },
  hero: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: DS_V3.space.sm,
  },
  ofElapsed: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  dayLine: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  stats: {
    marginTop: DS_V3.space.lg,
    gap: DS_V3.space.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "50%",
    paddingVertical: DS_V3.space.md,
    gap: DS_V3.space.xs,
  },
  inlineNum: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: DS_V3.space.xs,
  },
  daysCap: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  splitRule: {
    marginVertical: DS_V3.space.xs,
  },
  splitRow: {
    minHeight: DS_V3.size.tap,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  splitLabel: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  splitVal: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  section: {
    marginTop: DS_V3.space.section,
    marginBottom: DS_V3.space.sm,
  },
  monthRow: {
    minHeight: DS_V3.size.tap,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  monthName: {
    width: 74,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  track: {
    flex: 1,
    height: BAR,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    overflow: "hidden",
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  fill: {
    height: "100%",
    backgroundColor: DS_V3.color.brand,
  },
  ratio: {
    width: RATIO,
    textAlign: "right",
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  dayRow: {
    minHeight: DS_V3.size.tap,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  dayCopy: { flex: 1, gap: PT },
  dayLabelOn: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  dayLabelOff: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  chRow: {
    minHeight: DS_V3.size.tap,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    paddingVertical: DS_V3.space.sm,
  },
  chCopy: { flex: 1, gap: PT },
  chName: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  chCap: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    marginTop: DS_V3.space.section,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
