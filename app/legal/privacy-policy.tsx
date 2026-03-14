import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

const CONTENT = [
  { heading: "Information We Collect", body: "Account information (email, username, display name); challenge activity and progress data; device information for push notifications; usage analytics (anonymized)." },
  { heading: "How We Use Your Information", body: "To provide and improve the GRIIT service; to track your challenge progress and streaks; to send push notifications you've opted into; to display leaderboards and social features." },
  { heading: "Data Storage", body: "Your data is stored securely on Supabase (cloud infrastructure). We use industry-standard encryption for data in transit." },
  { heading: "Your Rights", body: "You can request deletion of your account and data. You can opt out of push notifications at any time. You can contact us at [EMAIL] for any privacy concerns." },
  { heading: "Third-Party Services", body: "Supabase (database and authentication), RevenueCat (subscription management), PostHog (anonymized analytics), Expo (app infrastructure)." },
  { heading: "Changes to This Policy", body: "We may update this policy from time to time. We will notify you of significant changes." },
  { heading: "Contact", body: "[EMAIL]" },
];

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>GRIIT Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: March 2025</Text>
        {CONTENT.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.background },
  scroll: { flex: 1 },
  content: { padding: DS_SPACING.screenHorizontal, paddingBottom: DS_SPACING.xxxl },
  title: { fontSize: 22, fontWeight: "700", color: DS_COLORS.textPrimary, marginBottom: 4 },
  updated: { fontSize: 13, color: DS_COLORS.textMuted, marginBottom: DS_SPACING.xl },
  section: { marginBottom: DS_SPACING.xl },
  heading: { fontSize: 16, fontWeight: "700", color: DS_COLORS.textPrimary, marginBottom: 6 },
  body: { fontSize: 14, color: DS_COLORS.textSecondary, lineHeight: 22 },
});
