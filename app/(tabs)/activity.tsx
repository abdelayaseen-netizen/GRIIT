import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationsTab } from "@/components/activity/NotificationsTab";
import { LeaderboardTab } from "@/components/activity/LeaderboardTab";
import { styles } from "@/components/activity/activity-styles";

type MainTab = "notifications" | "leaderboard";

const VALID_TABS: readonly MainTab[] = ["notifications", "leaderboard"];

function isMainTab(value: string | undefined): value is MainTab {
  return value === "notifications" || value === "leaderboard";
}

export default function ActivityScreen() {
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const initialTab: MainTab = isMainTab(tab) ? tab : "notifications";
  const [mainTab, setMainTab] = useState<MainTab>(initialTab);

  // Keep state in sync if the user re-navigates to this screen with a new
  // ?tab= while it's already mounted.
  useEffect(() => {
    if (isMainTab(tab) && tab !== mainTab) {
      setMainTab(tab);
    }
  // mainTab intentionally excluded — we only react to the query param changing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  if (isGuest || !user?.id) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Text style={styles.screenTitle}>Activity</Text>
        <View style={styles.guestWrap}>
          <Text style={styles.guestText}>Sign in to see notifications and leaderboards.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activityHeader = (
    <>
      <Text style={styles.screenTitle} accessibilityRole="header">
        Activity
      </Text>

      <View style={styles.mainSwitcher}>
        {VALID_TABS.map((t) => (
          <TouchableOpacity
            key={t}
            accessibilityRole="tab"
            style={[styles.mainTab, mainTab === t && styles.mainTabOn]}
            onPress={() => setMainTab(t)}
            accessibilityLabel={`${t === "notifications" ? "Notifications" : "Leaderboard"} tab`}
            accessibilityState={{ selected: mainTab === t }}
          >
            <Text style={[styles.mainTabText, mainTab === t && styles.mainTabTextOn]}>
              {t === "notifications" ? "Notifications" : "Leaderboard"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.tabShell}>
          {mainTab === "notifications" ? (
            <NotificationsTab userId={user.id} listHeader={activityHeader} />
          ) : (
            <LeaderboardTab userId={user.id} listHeader={activityHeader} />
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
