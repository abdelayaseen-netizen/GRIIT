import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";

/**
 * Stub screen for followers / following lists from profile.
 * Query: ?kind=followers | following
 */
export default function ProfileFollowListStub() {
  const router = useRouter();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const label = kind === "following" ? "Following" : "Followers";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_PROFILE as never))}
            style={styles.backBtn}
            hitSlop={12}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={24} color={DS_COLORS.PROFILE_TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{label}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={styles.body}>Coming soon</Text>
          <Text style={styles.sub}>You&apos;ll be able to browse this list here.</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.PROFILE_PAGE_BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.PROFILE_BORDER_ALT,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  headerSpacer: { width: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  body: { fontSize: 16, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  sub: { marginTop: 8, fontSize: 13, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY, textAlign: "center" },
});
