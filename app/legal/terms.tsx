import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"
import { ErrorBoundary } from "@/components/ErrorBoundary";

const CONTENT = [
  { heading: "Acceptance and Eligibility", body: "By using GRIIT you agree to these Terms. You must be at least 13 years old. If you are under 18, a parent or guardian must agree to these Terms on your behalf." },
  { heading: "Your Account", body: "You are responsible for your account and credentials. Provide accurate information. No impersonation or automated account creation. You may delete your account at any time in Settings." },
  { heading: "Subscriptions and Billing", body: "GRIIT Pro is billed through your Apple ID. Payment is charged at purchase, or at the end of the free trial if not cancelled at least 24 hours before it ends. Subscriptions auto-renew unless turned off at least 24 hours before the period ends. Manage or cancel in Settings, Apple ID, Subscriptions. Deleting the app does not cancel a subscription. Refunds are handled by Apple." },
  { heading: "Your Content", body: "You own the content you post. By posting, you grant us a license to host, store, and display it within GRIIT so the service can function. The license ends when you delete the content or your account." },
  { heading: "Community Rules", body: "GRIIT has zero tolerance for objectionable content: no sexually explicit, violent, threatening, harassing, hateful, illegal, deceptive, or infringing content. Every post can be reported in-app. We review reports promptly, typically within 24 hours, remove violating content, and suspend or ban offending accounts." },
  { heading: "Acceptable Use", body: "Do not circumvent proof verification, manipulate streaks or leaderboards, scrape data, reverse engineer the app, or interfere with the service." },
  { heading: "Health Disclaimer", body: "Challenges may involve physical activity or lifestyle changes. GRIIT does not provide medical advice. Consult a physician before starting any fitness or diet challenge. You participate at your own risk." },
  { heading: "Disclaimers and Liability", body: "GRIIT is provided as is. We do not guarantee uninterrupted or error-free service or that data will never be lost. To the fullest extent permitted by law, we are not liable for indirect or consequential damages, and our total liability is limited to what you paid us in the prior 12 months." },
  { heading: "Termination", body: "We may suspend or terminate accounts that violate these Terms. You may stop using GRIIT at any time." },
  { heading: "Governing Law", body: "These Terms are governed by the laws of the State of New Jersey, United States." },
  { heading: "Contact", body: "griit.health@gmail.com" },
];

function TermsScreenInner() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>GRIIT Terms of Service</Text>
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

export default function TermsScreen() {
  return (
    <ErrorBoundary>
      <TermsScreenInner />
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
