import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { DS_V3 } from "@/lib/design-system";
import Card from "@/components/ds/Card";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "Signed in with email";
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
          <Card>
            <Text style={styles.micro}>SIGN-IN METHOD</Text>
            <Text style={styles.val}>{provider}</Text>
          </Card>
          <Pressable onPress={() => setReveal((v) => !v)} accessibilityRole="button">
            <Card>
              <Text style={styles.micro}>EMAIL</Text>
              <Text style={styles.val}>{reveal ? email ?? "Signed in with email" : maskEmail(email)}</Text>
              <Text style={styles.hint}>Tap to {reveal ? "hide" : "reveal"}</Text>
            </Card>
          </Pressable>
          <Card>
            <Text style={styles.micro}>EXPORT DATA</Text>
            <Text style={styles.hint}>Coming with the next update</Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.xs * 10,
    gap: DS_V3.space.md,
  },
  micro: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    color: DS_V3.color.textSecondary,
  },
  val: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  hint: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
