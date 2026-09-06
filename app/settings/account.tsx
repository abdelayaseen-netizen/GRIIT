import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "—";
  const [local, domain] = email.split("@");
  return `${(local ?? "").slice(0, 1)}•••@${domain}`;
}

export default function SettingsAccountScreen() {
  const { user } = useAuth();
  const [reveal, setReveal] = useState(false);
  const email = user?.email ?? null;
  const provider =
    user?.app_metadata?.provider === "apple"
      ? "Apple"
      : "email";

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <SettingsNav title="Account" />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.card}>
            <Text style={styles.micro}>SIGN-IN METHOD</Text>
            <Text style={styles.val}>{provider}</Text>
          </View>
          <Pressable onPress={() => setReveal((v) => !v)} style={styles.card} accessibilityRole="button">
            <Text style={styles.micro}>EMAIL</Text>
            <Text style={styles.val}>{reveal ? email ?? "—" : maskEmail(email)}</Text>
            <Text style={styles.hint}>Tap to {reveal ? "hide" : "reveal"}</Text>
          </Pressable>
          <View style={styles.card}>
            <Text style={styles.micro}>EXPORT DATA</Text>
            <Text style={styles.hint}>Coming with the next update</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PROFILE_V2_COLOR.canvas },
  body: { paddingHorizontal: 28, paddingBottom: 40, gap: 12 },
  card: { backgroundColor: PROFILE_V2_COLOR.surface, borderRadius: 20, padding: 16 },
  micro: { fontSize: 11, letterSpacing: 0.8, color: PROFILE_V2_COLOR.mutedLight },
  val: { marginTop: 6, fontSize: 16, color: PROFILE_V2_COLOR.ink },
  hint: { marginTop: 6, fontSize: 12, color: PROFILE_V2_COLOR.mutedLight },
});
