import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"
import { ErrorBoundary } from "@/components/ErrorBoundary";

const CONTENT = [
  { heading: "Information We Collect", body: "Account information: email, username, display name, and optional profile photo and bio. Photos and captions you post as proof, captured with your permission via camera or photo library, only when you choose to post. Location, only for Hard Mode tasks, checked once at the moment you submit proof to verify the check-in; we never track location continuously. Challenge activity: check-ins, streaks, freezes, badges, respects, comments, and follows. Subscription status via RevenueCat; we never see your payment card details. Device data: device type, OS version, app version, push token if you enable notifications, and crash reports. Usage analytics via PostHog to improve the product." },
  { heading: "How We Use Your Information", body: "To run your challenges and streaks, display your posts to the audience you choose, verify Hard Mode check-ins, process your subscription, send notifications you've opted into, show leaderboards, fix crashes, and improve GRIIT based on how it's used." },
  { heading: "What Other Users Can See", body: "Your username, display name, profile photo, bio, streaks, badges, and challenge activity are visible to other users. Proof posts follow the proof visibility setting (off, optional, or public) chosen for the challenge. You control what appears in each photo you post." },
  { heading: "Sharing With Third Parties", body: "We do not sell your personal data and we do not show ads. We share data only with providers needed to run GRIIT: Supabase (database, auth, photo storage), RevenueCat (subscriptions), Apple (payments), PostHog (analytics), Sentry (crash reporting), and Expo (infrastructure and push delivery). We may disclose data if required by law." },
  { heading: "Data Storage and Security", body: "Your data is stored on Supabase cloud infrastructure, encrypted in transit, with restricted access to production data." },
  { heading: "Deletion and Your Rights", body: "Delete your account any time in Settings; this removes your profile, posts, photos, check-ins, and challenge history. Depending on where you live you may also have rights to access, correct, or export your data. Contact us and we will respond within 30 days." },
  { heading: "Children", body: "GRIIT is not directed at children under 13 and we do not knowingly collect data from anyone under 13. If you believe a child under 13 has an account, contact us and we will delete it." },
  { heading: "Changes to This Policy", body: "If we make material changes we will update the date above and notify you in the app." },
  { heading: "Contact", body: "griit.health@gmail.com" },
];

function PrivacyPolicyScreenInner() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>GRIIT Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: June 12, 2026</Text>
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

export default function PrivacyPolicyScreen() {
  return (
    <ErrorBoundary>
      <PrivacyPolicyScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.background },
  scroll: { flex: 1 },
  content: { padding: DS_SPACING.screenHorizontal, paddingBottom: DS_SPACING.xxxl },
  title: { fontSize: 22, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.textPrimary, marginBottom: 4 },
  updated: { fontSize: 13, color: DS_COLORS.textMuted, marginBottom: DS_SPACING.xl },
  section: { marginBottom: DS_SPACING.xl },
  heading: { fontSize: 16, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.textPrimary, marginBottom: 6 },
  body: { fontSize: 14, color: DS_COLORS.textSecondary, lineHeight: 22 },
});
