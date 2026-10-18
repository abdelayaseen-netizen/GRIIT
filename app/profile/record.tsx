/**
 * Your record — build 92 chunk 07.4 (P2-03 Challenges, P2-05 Badges, P2-06 Stats; Option A).
 * Challenges (Running · Finished · Left) and Badges are free. Stats shows the free streak history and
 * the signed-in user's data, then a preview of the Pro deeper stats.
 * With `userId` (a visitor opening someone else's record row) only Challenges and Badges show, read
 * from that person's gated getRecord; visitors can't see Stats (Part 2 checklist line 98).
 */
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Screen from "@/components/ds/Screen";
import PushedHeader from "@/components/ds/PushedHeader";
import SegmentedControl from "@/components/ds/SegmentedControl";
import EmptyState from "@/components/ds/EmptyState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHomeBootstrap } from "@/lib/use-home-bootstrap";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_V3 } from "@/lib/design-system";
import type { ProfileRecord } from "@/lib/profile-v2-record";
import type { V42BadgeState } from "@/lib/v42-badges";
import type { UserStatsFields } from "@/types";
import { formatDayMonthYear } from "@/lib/profile-v2-badges";
import { badgeRowsFromProgress } from "@/lib/profile-v2-badges";
import { rowsFromProfileRecord } from "@/lib/profile-challenges";
import { todayTaskCounts, type CountableEnrollment } from "@/lib/today-counts";
import { getTodayDateKey } from "@/lib/date-utils";
import { resolveHomeTimeZone } from "@/lib/home-streak";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { homeSecuredToday } from "@/lib/home-secured-visuals";
import { ProfileChallenges } from "@/components/profile/ProfileChallenges";
import { BadgeGrid } from "@/components/profile/BadgeGrid";
import { BadgeRows } from "@/components/profile/BadgeRows";
import { badgeItemsFromRows, PROFILE_V3_FOOTNOTE } from "@/components/profile/ProfileV3";
import { YourDataTab } from "@/components/profile/YourDataTab";
import ProUpgradeSheet from "@/components/share/ProUpgradeSheet";
import { PROFILE_RECORD_TABS, type ProfileRecordTab } from "@/lib/profile-header";
import {
  DEEPER_STATS,
  DEEPER_STATS_BODY,
  DEEPER_STATS_LIST,
  FREE_TAG,
  PRO_TAG,
  STAT_BEST,
  STAT_CURRENT,
  STREAK_HISTORY,
  TRY_PRO,
  YOUR_RECORD_TITLE,
  streakSpanLine,
} from "@/lib/profile-record";

type RecordPayload = ProfileRecord & {
  todayKey: string;
  badgeGrid?: V42BadgeState[];
  user_stats?: UserStatsFields | null;
};

function isTab(v: string | undefined): v is ProfileRecordTab {
  return (PROFILE_RECORD_TABS as readonly string[]).includes(v ?? "");
}

export default function YourRecordScreen() {
  const router = useRouter();
  const { tab: tabParam, userId: userIdParam, handle } = useLocalSearchParams<{
    tab?: string;
    userId?: string;
    handle?: string;
  }>();
  const { user } = useAuth();
  const { profile, isPremium } = useApp();
  const isVisitor = Boolean(userIdParam) && userIdParam !== user?.id;
  const tabs: readonly ProfileRecordTab[] = isVisitor ? ["Challenges", "Badges"] : PROFILE_RECORD_TABS;
  const [tab, setTab] = useState<ProfileRecordTab>(
    isTab(tabParam) && tabs.includes(tabParam) ? tabParam : "Challenges",
  );
  const [proOpen, setProOpen] = useState(false);
  const bootstrap = useHomeBootstrap(isVisitor ? undefined : user?.id);
  const targetId = isVisitor ? (userIdParam ?? "") : (user?.id ?? "");
  const q = useQuery({
    queryKey: ["profiles", "getRecord", targetId],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getRecord, isVisitor ? { userId: userIdParam } : undefined) as Promise<RecordPayload>,
    staleTime: 60 * 1000,
    enabled: !!targetId,
  });
  const record = q.data;
  const userStats = isVisitor ? (record?.user_stats ?? null) : (bootstrap.data?.stats?.user_stats ?? record?.user_stats ?? null);
  const homeTimeZone = resolveHomeTimeZone(profile?.timezone, getDeviceIanaTimeZone());
  const todayKey = record?.todayKey ?? getTodayDateKey(homeTimeZone);
  const securedDateKeys = Array.isArray(bootstrap.data?.securedDateKeys) ? bootstrap.data.securedDateKeys : [];
  const todaySecured = homeSecuredToday(securedDateKeys, todayKey);
  const todayCounts = todayTaskCounts({
    activeChallenges: (bootstrap.data?.activeChallenges ?? []) as CountableEnrollment[],
    todayCheckins: bootstrap.data?.todayCheckinsForUser ?? [],
    todayKey,
    timeZone: homeTimeZone,
  });
  const fmt = (key: string) => formatDayMonthYear(key.slice(0, 10));
  const rows = rowsFromProfileRecord(
    record ?? { runs: [], completed: [] },
    isVisitor
      ? { todaySecured: !!record && record.streak.lastCompletedDateKey === record.todayKey, formatDate: fmt }
      : { todaySecured, formatDate: fmt, leftByEnrollment: todayCounts.byEnrollment },
  );
  const best = userStats?.best_streak ?? record?.streak.best ?? 0;
  const current = userStats?.current_streak ?? record?.streak.current ?? 0;
  const bestSpan = streakSpanLine(userStats?.best_streak_start, userStats?.best_streak_end, fmt);

  return (
    <ErrorBoundary>
      <Screen style={styles.safe} edges={["top"]}>
        <PushedHeader title={isVisitor ? (handle ? `@${handle}` : "Record") : YOUR_RECORD_TITLE} onBack={() => router.back()} />
        <View style={styles.seg}>
          <SegmentedControl
            items={[...tabs]}
            value={tab}
            onChange={(v) => {
              if (isTab(v)) setTab(v);
            }}
          />
        </View>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {tab === "Challenges" ? (
            q.isError && !record ? (
              <EmptyState heading="Couldn't load your record." body="" actionLabel="Try again" onAction={() => void q.refetch()} />
            ) : rows.length === 0 && record ? (
              <EmptyState
                heading="No active challenge"
                body="Start one from Discover."
                actionLabel="Find a challenge"
                onAction={() => router.push(ROUTES.TABS_DISCOVER as never)}
              />
            ) : (
              <ProfileChallenges
                challenges={rows}
                formatDate={fmt}
                onOpen={(row) =>
                  router.push(
                    (row.status === "active" ? ROUTES.CHALLENGE_ACTIVE(row.id) : ROUTES.CHALLENGE_ID(row.challengeId)) as never,
                  )
                }
              />
            )
          ) : null}

          {tab === "Badges" ? (
            record?.badgeGrid ? (
              <BadgeGrid badges={record.badgeGrid} />
            ) : isVisitor ? (
              // Visitor badges come only from the gated record; nothing is computed client-side.
              <BadgeRows badges={badgeItemsFromRows(record?.badges ?? [])} footnote={PROFILE_V3_FOOTNOTE} />
            ) : (
              <BadgeRows
                badges={badgeItemsFromRows(
                  record?.badges ??
                    badgeRowsFromProgress({
                      bestStreak: record?.streak.best ?? 0,
                      verifiedDays: record?.detail.totalVerified ?? 0,
                    }),
                )}
                footnote={PROFILE_V3_FOOTNOTE}
              />
            )
          ) : null}

          {tab === "Stats" && !isVisitor ? (
            <View style={styles.stats}>
              <View style={styles.card} testID="streak-history">
                <View style={styles.cardHead}>
                  <Text style={styles.cardTitle}>{STREAK_HISTORY}</Text>
                  <Text style={styles.tag}>{FREE_TAG}</Text>
                </View>
                <View style={styles.statRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statCap}>{STAT_BEST}</Text>
                    <Text style={styles.statNum}>{best}</Text>
                    {bestSpan ? <Text style={styles.statSub}>{bestSpan}</Text> : null}
                  </View>
                  <View style={[styles.statCol, styles.statHair]}>
                    <Text style={styles.statCap}>{STAT_CURRENT}</Text>
                    <Text style={styles.statNum}>{current}</Text>
                  </View>
                </View>
              </View>
              <YourDataTab />
              {isPremium ? null : (
                <View style={styles.card} testID="deeper-stats">
                  <View style={styles.cardHead}>
                    <Text style={styles.cardTitle}>{DEEPER_STATS}</Text>
                    <Text style={[styles.tag, styles.tagPro]}>{PRO_TAG}</Text>
                  </View>
                  <Text style={styles.body1}>{DEEPER_STATS_BODY}</Text>
                  <Text style={styles.body2}>{DEEPER_STATS_LIST}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={TRY_PRO}
                    onPress={() => setProOpen(true)}
                    style={styles.proBtn}
                  >
                    <Text style={styles.proBtnTxt}>{TRY_PRO}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>
        <ProUpgradeSheet visible={proOpen} onClose={() => setProOpen(false)} onUnlocked={() => setProOpen(false)} />
      </Screen>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  seg: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.sm, paddingBottom: DS_V3.space.md },
  body: { paddingBottom: DS_V3.space.section },
  stats: { paddingHorizontal: DS_V3.space.gutter, gap: DS_V3.space.lg },
  card: {
    borderRadius: DS_V3.radius.card,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    backgroundColor: DS_V3.color.surface,
    padding: DS_V3.space.lg,
    gap: DS_V3.space.sm,
  },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  tag: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  tagPro: { color: DS_V3.color.brand },
  statRow: { flexDirection: "row", marginTop: DS_V3.space.xs },
  statCol: { flex: 1, gap: 2 },
  statHair: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: DS_V3.color.hairline, paddingLeft: DS_V3.space.lg },
  statCap: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  statNum: {
    fontSize: 24,
    lineHeight: 28,
    color: DS_V3.color.textPrimary,
    fontFamily: DS_V3.displayFace,
    fontWeight: DS_V3.displayWeight,
    fontVariant: ["tabular-nums"],
  },
  statSub: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  body1: { ...DS_V3.type.body, color: DS_V3.color.textPrimary },
  body2: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  proBtn: {
    marginTop: DS_V3.space.xs,
    height: 44,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  proBtnTxt: { ...DS_V3.type.bodyStrong, color: "#FFFFFF" },
});
