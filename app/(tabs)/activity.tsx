import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenChrome from "@/components/ds/ScreenChrome";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LiveFeedSection from "@/components/LiveFeedSection";
import { NotificationsTab } from "@/components/activity/NotificationsTab";
import { LeaderboardTab } from "@/components/activity/LeaderboardTab";
import RootHeader from "@/components/ds/RootHeader";
import SegmentedControl from "@/components/ds/SegmentedControl";
import { DS_V3 } from "@/lib/design-system";
import { useHomeBootstrap } from "@/lib/use-home-bootstrap";
import { countActiveEnrollments } from "@/lib/free-challenge-limit";

type MainTab = "feed" | "notifications" | "leaderboard";

function isMainTab(value: string | undefined): value is MainTab {
  return value === "feed" || value === "notifications" || value === "leaderboard";
}

const SEGMENTS = ["Feed", "Notifications", "Leaderboard"] as const;

export default function ActivityScreen() {
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const initialTab: MainTab = isMainTab(tab) ? tab : "feed";
  const [mainTab, setMainTab] = useState<MainTab>(initialTab);
  const bootstrap = useHomeBootstrap(isGuest ? undefined : user?.id);

  useEffect(() => {
    if (isMainTab(tab) && tab !== mainTab) {
      setMainTab(tab);
    }
  // mainTab intentionally excluded — we only react to the query param changing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  if (isGuest || !user?.id) {
    return (
      <ScreenChrome>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <RootHeader title="Activity" />
        <View style={styles.guestWrap}>
          <Text style={styles.guestText}>
            Sign in to see the feed, notifications and leaderboards.
          </Text>
        </View>
      </SafeAreaView>
      </ScreenChrome>
    );
  }

  const segment =
    mainTab === "leaderboard" ? "Leaderboard" : mainTab === "notifications" ? "Notifications" : "Feed";

  return (
    <ErrorBoundary>
      <ScreenChrome>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <RootHeader title="Activity" />
        <View style={styles.segment}>
          <SegmentedControl
            items={[...SEGMENTS]}
            value={segment}
            onChange={(v) =>
              setMainTab(
                v === "Leaderboard" ? "leaderboard" : v === "Notifications" ? "notifications" : "feed",
              )
            }
          />
        </View>
        <View style={styles.tabShell}>
          {mainTab === "feed" ? (
            <LiveFeedSection
              activeChallengesCount={countActiveEnrollments(
                (Array.isArray(bootstrap.data?.activeChallenges)
                  ? bootstrap.data.activeChallenges
                  : []) as { status?: string }[],
              )}
              viewerTargetStreak={bootstrap.data?.profile?.target_streak ?? null}
            />
          ) : mainTab === "notifications" ? (
            <NotificationsTab userId={user.id} />
          ) : (
            <LeaderboardTab userId={user.id} />
          )}
        </View>
      </SafeAreaView>
      </ScreenChrome>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  segment: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
  },
  tabShell: {
    flex: 1,
  },
  guestWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
  },
  guestText: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
});
