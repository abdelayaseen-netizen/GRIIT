import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationsTab } from "@/components/activity/NotificationsTab";
import { LeaderboardTab } from "@/components/activity/LeaderboardTab";
import LiveFeedSection from "@/components/LiveFeedSection";
import { styles } from "@/components/activity/activity-styles";

type MainTab = "feed" | "notifications" | "leaderboard";

export default function ActivityScreen() {
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const [mainTab, setMainTab] = useState<MainTab>("feed");

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
        <TouchableOpacity
          accessibilityRole="tab"
          style={[styles.mainTab, mainTab === "feed" && styles.mainTabOn]}
          onPress={() => setMainTab("feed")}
          accessibilityLabel="Feed tab"
          accessibilityState={{ selected: mainTab === "feed" }}
        >
          <Text style={[styles.mainTabText, mainTab === "feed" && styles.mainTabTextOn]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="tab"
          style={[styles.mainTab, mainTab === "notifications" && styles.mainTabOn]}
          onPress={() => setMainTab("notifications")}
          accessibilityLabel="Notifications tab"
          accessibilityState={{ selected: mainTab === "notifications" }}
        >
          <Text style={[styles.mainTabText, mainTab === "notifications" && styles.mainTabTextOn]}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="tab"
          style={[styles.mainTab, mainTab === "leaderboard" && styles.mainTabOn]}
          onPress={() => setMainTab("leaderboard")}
          accessibilityLabel="Leaderboard tab"
          accessibilityState={{ selected: mainTab === "leaderboard" }}
        >
          <Text style={[styles.mainTabText, mainTab === "leaderboard" && styles.mainTabTextOn]}>Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.tabShell}>
          {mainTab === "feed" ? (
            <View style={styles.tabShell}>
              {activityHeader}
              <LiveFeedSection />
            </View>
          ) : mainTab === "notifications" ? (
            <NotificationsTab userId={user.id} listHeader={activityHeader} />
          ) : (
            <LeaderboardTab userId={user.id} listHeader={activityHeader} />
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
