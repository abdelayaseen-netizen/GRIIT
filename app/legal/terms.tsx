import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DS_COLORS, DS_SPACING } from "@/lib/design-system";

const CONTENT = [
  { heading: "Acceptance of Terms", body: "By using GRIIT you agree to these Terms of Service. If you do not agree, do not use the app." },
  { heading: "Account Responsibilities", body: "You are responsible for keeping your account credentials secure. You must provide accurate information when creating an account. You must be at least 13 years of age (or the minimum age in your jurisdiction) to use GRIIT." },
  { heading: "Subscription and Billing", body: "Subscriptions auto-renew unless cancelled before the end of the current period. You can cancel or manage your subscription in your device's subscription settings or via RevenueCat. Refunds are subject to the platform (App Store / Google Play) policies." },
  { heading: "Acceptable Use", body: "You may not use GRIIT for any illegal or harmful purpose. You may not abuse, harass, or impersonate other users. You may not attempt to circumvent verification or game the system." },
  { heading: "Intellectual Property", body: "GRIIT and its content (including design, text, and branding) are owned by us. You retain ownership of content you create; you grant us a license to use it to operate the service." },
  { heading: "Limitation of Liability", body: "GRIIT is provided as is. We do not guarantee uninterrupted or error-free service. To the extent permitted by law, we are not liable for indirect, incidental, or consequential damages." },
  { heading: "Termination", body: "We may suspend or terminate your account for violation of these terms. You may delete your account at any time from Settings." },
  { heading: "Contact", body: "griit.health@gmail.com" },
];

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>GRIIT Terms of Service</Text>
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
