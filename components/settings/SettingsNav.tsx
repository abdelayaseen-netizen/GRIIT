import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { ROUTES } from "@/lib/routes";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";

export function SettingsNav({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View style={styles.nav}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_PROFILE as never))}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.back}
      >
        <ChevronLeft size={22} color={PROFILE_V2_COLOR.body} strokeWidth={1.6} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.back} />
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "400", color: PROFILE_V2_COLOR.ink },
});
