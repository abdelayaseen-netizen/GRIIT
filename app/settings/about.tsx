import React from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { ROUTES } from "@/lib/routes";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export default function SettingsAboutScreen() {
  const router = useRouter();
  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <SettingsNav title="About" />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.card}>
            <Text style={styles.val}>GRIIT {APP_VERSION}</Text>
          </View>
          <Pressable
            onPress={() => router.push(ROUTES.LEGAL_TERMS as never)}
            style={styles.card}
            accessibilityRole="button"
          >
            <Text style={styles.val}>Terms of Service</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(ROUTES.LEGAL_PRIVACY as never)}
            style={styles.card}
            accessibilityRole="button"
          >
            <Text style={styles.val}>Privacy Policy</Text>
          </Pressable>
          <Pressable
            onPress={() => void Linking.openURL("mailto:griit.health@gmail.com")}
            style={styles.card}
            accessibilityRole="button"
          >
            <Text style={styles.val}>Contact</Text>
            <Text style={styles.hint}>griit.health@gmail.com</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PROFILE_V2_COLOR.canvas },
  body: { paddingHorizontal: 28, paddingBottom: 40, gap: 12 },
  card: { backgroundColor: PROFILE_V2_COLOR.surface, borderRadius: 20, padding: 16 },
  val: { fontSize: 15, color: PROFILE_V2_COLOR.ink },
  hint: { marginTop: 4, fontSize: 12, color: PROFILE_V2_COLOR.mutedLight },
});
