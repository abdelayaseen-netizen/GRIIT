import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import type { ProfileRecord } from "@/lib/profile-v2-record";
import { formatDayMonthYear } from "@/lib/profile-v2-badges";
import { daysFromSource, type DaySource } from "@/lib/day-state";
import { CONSISTENCY_TITLE } from "@/lib/consistency-record";
import { DS_V3 } from "@/lib/design-system";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PushedHeader from "@/components/ds/PushedHeader";
import { ConsistencyGrid } from "@/components/profile/ConsistencyGrid";

type RecordPayload = ProfileRecord & {
  timezone: string;
  todayKey: string;
  monthKey?: string;
  daySource?: DaySource;
};

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
  const tz = rec?.timezone ?? "UTC";
  const todayKey = rec?.todayKey;
  const monthKey = rec?.monthKey ?? (todayKey ? todayKey.slice(0, 7) : "");
  const days = useMemo(
    () => daysFromSource(rec?.daySource, tz, { todayKey }),
    [rec?.daySource, tz, todayKey],
  );
  const enrollments = rec?.daySource?.enrollments ?? [];
  const names = Object.fromEntries([
    ...(rec?.runs ?? []).map((r) => [r.challengeId, r.name] as const),
    ...(rec?.completed ?? []).map((r) => [r.challengeId, r.name] as const),
  ]);
  const firstJoin = enrollments.map((e) => e.startDateKey).sort()[0];
  const joinedLabel = firstJoin ? formatDayMonthYear(firstJoin) : "";

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <PushedHeader
          title={CONSISTENCY_TITLE}
          onBack={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_PROFILE as never))}
        />
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {days.length === 0 ? (
            <Text style={styles.empty}>No due days yet.</Text>
          ) : (
            <ConsistencyGrid
              days={days}
              enrollments={enrollments}
              names={names}
              joinedLabel={joinedLabel}
              monthKey={monthKey}
              dueDayKeys={rec?.consistency.dueDayKeys ?? []}
              securedDateKeys={(rec?.daySource?.securedDays ?? []).map((s) =>
                typeof s === "string" ? s : s.dateKey,
              )}
              todayKey={todayKey ?? ""}
            />
          )}
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
  },
  empty: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
});
