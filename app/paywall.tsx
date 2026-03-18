/**
 * Full-screen paywall: RevenueCat Pro subscription. Dark athletic theme.
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";
import { purchasePro, restorePurchases } from "@/lib/revenue-cat";
import { useProStatus } from "@/hooks/useProStatus";

const ERROR_COLOR = DS_COLORS.errorText ?? DS_COLORS.ERROR_RED;

export default function PaywallScreen() {
  const router = useRouter();
  const { refetch: refetchPro } = useProStatus();
  const [loading, setLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await purchasePro();
      if (result.success) {
        await refetchPro();
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)" as never);
      } else {
        setError(result.error ?? "Purchase failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router, refetchPro]);

  const handleRestore = useCallback(async () => {
    setError(null);
    setRestoreLoading(true);
    try {
      const result = await restorePurchases();
      if (result.success) {
        await refetchPro();
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)" as never);
      } else {
        setError("No purchases to restore.");
      }
    } catch {
      setError("Restore failed. Please try again.");
    } finally {
      setRestoreLoading(false);
    }
  }, [router, refetchPro]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background ?? DS_COLORS.BLACK }]} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>GRIIT</Text>
        <Text style={styles.subheading}>Unlock your full potential</Text>

        <View style={styles.valueProps}>
          <View style={styles.valueRow}>
            <Text style={styles.bullet}>◆</Text>
            <Text style={styles.valueText}>Unlimited challenges — all 75+ day programs</Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={styles.bullet}>◆</Text>
            <Text style={styles.valueText}>All verification modes — GPS, photo proof, heart rate</Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={styles.bullet}>◆</Text>
            <Text style={styles.valueText}>Leaderboards + Teams — compete and stay accountable</Text>
          </View>
        </View>

        <View style={styles.pricingBlock}>
          <Text style={styles.price}>$9.99 / month</Text>
          <Text style={styles.priceSub}>or $79.99 / year — save 33%</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: DS_COLORS.ACCENT_PRIMARY }]}
          onPress={handlePurchase}
          disabled={loading || restoreLoading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Start Pro subscription"
        >
          {loading ? (
            <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Start Pro — $9.99/mo</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleRestore}
          disabled={loading || restoreLoading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
        >
          {restoreLoading ? (
            <ActivityIndicator color={DS_COLORS.textMuted} size="small" />
          ) : (
            <Text style={styles.secondaryBtnText}>Restore purchases</Text>
          )}
        </TouchableOpacity>

        {error ? (
          <Text style={[styles.errorText, { color: ERROR_COLOR }]} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <Text style={styles.footer}>Cancel anytime. No commitment.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: DS_SPACING.screenHorizontal ?? 20,
    paddingTop: 40,
    paddingBottom: DS_SPACING.section,
  },
  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: DS_COLORS.ACCENT_PRIMARY,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "500",
    color: DS_COLORS.textSecondary,
    marginBottom: 32,
  },
  valueProps: { marginBottom: 28 },
  valueRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  bullet: { fontSize: 16, color: DS_COLORS.ACCENT_PRIMARY, marginRight: 12 },
  valueText: { fontSize: 16, color: DS_COLORS.textPrimary, flex: 1 },
  pricingBlock: { marginBottom: 24 },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: DS_COLORS.WHITE,
    marginBottom: 4,
  },
  priceSub: { fontSize: 14, color: DS_COLORS.textMuted },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: DS_RADIUS.button,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: { fontSize: 17, fontWeight: "700", color: DS_COLORS.WHITE },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "600", color: DS_COLORS.textMuted },
  errorText: { fontSize: 14, textAlign: "center", marginTop: 8 },
  footer: { fontSize: 12, color: DS_COLORS.textMuted, textAlign: "center", marginTop: 16 },
});
