import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import type { ProfileRecord } from "@/lib/profile-v2-record";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GriitFade } from "@/components/profile-v2/GriitFade";

type RecordPayload = ProfileRecord & { timezone: string; todayKey: string; elapsedMs: number };

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
  const lockedIn = rec?.consistency.verdict === "Locked in";

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.nav}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_PROFILE as never))}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.back}
          >
            <ChevronLeft size={22} color={PROFILE_V2_COLOR.body} strokeWidth={1.6} />
          </Pressable>
          <Text style={styles.title}>Consistency</Text>
          <View style={styles.back} />
        </View>
        <GriitFade fadeKey={`consistency-${rec?.todayKey ?? "none"}`}>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.rateRow}>
            <Text style={styles.rate}>{rec?.consistency.rate ?? "—"}</Text>
            {rec?.consistency.verdict ? (
              <Text style={[styles.verdict, lockedIn && styles.verdictHot]}>
                {rec.consistency.verdict}
              </Text>
            ) : null}
          </View>
          <Text style={styles.line}>{rec?.consistency.line ?? ""}</Text>

          <View style={styles.facts}>
            <Fact label="LONGEST STREAK" value={rec ? `${rec.detail.longestStreak}` : "—"} />
            <Fact label="TOTAL VERIFIED" value={rec ? `${rec.detail.totalVerified}` : "—"} />
            <Fact label="COMPLETION" value={rec?.detail.completion ?? "—"} />
            <Fact label="FIRST PROOF" value={rec?.detail.firstProof ?? "—"} />
          </View>

          <Text style={styles.group}>BY MONTH</Text>
          <View style={styles.card}>
            {(rec?.detail.months ?? []).map((m) => (
              <View key={m.label} style={styles.monthRow}>
                <Text style={styles.monthLabel}>{m.label}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.round(m.pct * 100)}%` }]} />
                </View>
                <Text style={styles.monthVal}>{m.value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.group}>BY CHALLENGE</Text>
          <View style={styles.card}>
            {(rec?.detail.byChallenge ?? []).map((c) => (
              <View key={c.label} style={styles.chRow}>
                <Text style={styles.chName}>{c.label}</Text>
                <Text style={styles.chVal}>{c.value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.note}>
            A day inside more than one challenge counts once in the totals. Every figure here is a
            count of verified proof rows.
          </Text>
        </ScrollView>
        </GriitFade>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PROFILE_V2_COLOR.canvas },
  nav: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "400", color: PROFILE_V2_COLOR.ink },
  body: { paddingHorizontal: 28, paddingBottom: 34 },
  rateRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 8 },
  rate: { fontSize: 40, fontWeight: "500", letterSpacing: -1.6, color: PROFILE_V2_COLOR.ink },
  verdict: { fontSize: 17, fontWeight: "400", color: PROFILE_V2_COLOR.body },
  verdictHot: { color: PROFILE_V2_COLOR.orange },
  line: { marginTop: 6, fontSize: 13, lineHeight: 19, color: PROFILE_V2_COLOR.body },
  facts: {
    marginTop: 18,
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderRadius: 20,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  fact: { width: "50%", padding: 16, gap: 6 },
  factLabel: { fontSize: 10, letterSpacing: 0.7, color: PROFILE_V2_COLOR.mutedLight },
  factVal: { fontSize: 16, fontWeight: "500", color: PROFILE_V2_COLOR.ink },
  group: {
    marginTop: 22,
    marginBottom: 8,
    fontSize: 11,
    letterSpacing: 1,
    color: PROFILE_V2_COLOR.mutedLight,
  },
  card: { backgroundColor: PROFILE_V2_COLOR.surface, borderRadius: 20, padding: 16, gap: 12 },
  monthRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  monthLabel: { width: 74, fontSize: 14, color: PROFILE_V2_COLOR.ink },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: PROFILE_V2_COLOR.track, overflow: "hidden" },
  fill: { height: 6, backgroundColor: PROFILE_V2_COLOR.orange },
  monthVal: { fontSize: 12, color: PROFILE_V2_COLOR.mutedLight },
  chRow: { flexDirection: "row", justifyContent: "space-between" },
  chName: { fontSize: 14, color: PROFILE_V2_COLOR.ink },
  chVal: { fontSize: 13, color: PROFILE_V2_COLOR.muted },
  note: { marginTop: 18, fontSize: 12, lineHeight: 18, color: PROFILE_V2_COLOR.mutedLight },
});
