import React, { useState, useEffect, useCallback } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Snowflake,
  Shield,
  PenLine,
  BarChart3,
  Crown,
  RefreshCw,
  Unlock,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_SHADOWS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { BASE_COLORS } from "@/constants/theme";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  type PurchasesOffering,
  type PurchasesPackage,
} from "@/lib/subscription";
import { useApp } from "@/contexts/AppContext";
import { track } from "@/lib/analytics";

const SOURCE_MESSAGES: Record<string, string> = {
  challenge_limit: "Upgrade to join unlimited challenges",
  streak_freeze: "Don't lose your streak — upgrade to unlock freezes",
  last_stand: "Save your progress with Last Stand",
  create_challenge: "Create your own challenges with Premium",
  settings: "Unlock your full potential",
  profile: "Unlock your full potential",
};

const FEATURES = [
  { icon: Unlock, label: "Unlimited Active Challenges", desc: "No cap on how many you can run at once" },
  { icon: Snowflake, label: "Streak Freeze", desc: "Protect your streak. 2 freezes per month included." },
  { icon: Shield, label: "Last Stand", desc: "One final chance to save a broken streak" },
  { icon: PenLine, label: "Custom Challenges", desc: "Build challenges from scratch with custom tasks" },
  { icon: BarChart3, label: "Discipline Analytics", desc: "Weekly trends, detailed stats, and progress insights" },
  { icon: Crown, label: "Premium Badge", desc: "Stand out on leaderboards and profiles" },
];

function parsePrice(priceString: string): number {
  const match = priceString.replace(/[^0-9.,]/g, "").replace(",", ".").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export default function PricingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string }>();
  const source = params.source ?? "";
  const { isPremium, refreshPremiumStatus } = useApp();

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [offeringLoading, setOfferingLoading] = useState(true);
  const [offeringError, setOfferingError] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const tagline = SOURCE_MESSAGES[source] ?? "Unlock your full potential";

  useEffect(() => {
    if (!isPremium && source) track({ name: "paywall_shown", source });
  }, [isPremium, source]);

  const loadOfferings = useCallback(async () => {
    setOfferingLoading(true);
    setOfferingError(false);
    setOffering(null);
    setSelectedPackage(null);
    try {
      const current = await getOfferings();
      setOffering(current ?? null);
      if (current?.availablePackages?.length) {
        const annual = current.availablePackages.find(
          (p) => p.identifier === "$rc_annual" || String(p.product?.title ?? "").toLowerCase().includes("annual")
        );
        const monthly = current.availablePackages.find(
          (p) => p.identifier === "$rc_monthly" || String(p.product?.title ?? "").toLowerCase().includes("month")
        );
        setSelectedPackage(annual ?? monthly ?? current.availablePackages[0]);
      }
    } catch {
      setOfferingError(true);
    } finally {
      setOfferingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  const handleSubscribe = async () => {
    if (!selectedPackage || purchasing) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchasing(true);
    setPurchaseError(null);
    const pkgType = selectedPackage.identifier?.includes("annual") ? "annual" : "monthly";
    track({ name: "purchase_started", package_type: pkgType });
    try {
      const result = await purchasePackage(selectedPackage);
      if (result.success) {
        track({ name: "purchase_completed", package_type: pkgType, price: selectedPackage.product?.priceString });
        await refreshPremiumStatus();
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } else if (result.error && result.error !== "cancelled") {
        track({ name: "purchase_failed", package_type: pkgType, error: result.error });
        if (result.error.toLowerCase().includes("internet") || result.error.toLowerCase().includes("connection")) {
          setPurchaseError("Please check your connection and try again.");
        } else if (result.error.toLowerCase().includes("pending")) {
          setPurchaseError("Purchase pending — we'll update your status when confirmed.");
        } else {
          setPurchaseError(result.error);
        }
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (restoring) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRestoring(true);
    setRestoreMessage(null);
    track({ name: "restore_attempted" });
    try {
      const { success, isPremium: restored } = await restorePurchases();
      if (success && restored) {
        track({ name: "restore_succeeded" });
        await refreshPremiumStatus();
        setRestoreMessage("Subscription restored.");
        setTimeout(() => router.back(), 800);
      } else {
        setRestoreMessage("No active subscription found.");
      }
    } finally {
      setRestoring(false);
    }
  };

  const handleBack = () => {
    if (!isPremium && source) track({ name: "paywall_dismissed", source });
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isPremium) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} hitSlop={12} accessibilityLabel="Go back">
            <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Crown size={48} color={DS_COLORS.accent} />
          <Text style={styles.title}>You&apos;re already on Premium</Text>
          <Text style={styles.subtitle}>Enjoy unlimited access.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const monthlyPkg = offering?.availablePackages?.find(
    (p) => p.identifier === "$rc_monthly" || String(p.product?.title ?? "").toLowerCase().includes("month")
  );
  const annualPkg = offering?.availablePackages?.find(
    (p) => p.identifier === "$rc_annual" || String(p.product?.title ?? "").toLowerCase().includes("annual")
  );
  const monthlyPrice = monthlyPkg ? parsePrice(monthlyPkg.product?.priceString ?? "0") : 0;
  const annualPrice = annualPkg ? parsePrice(annualPkg.product?.priceString ?? "0") : 0;
  const savePercent =
    monthlyPrice > 0 && annualPrice > 0 ? Math.round((1 - annualPrice / 12 / monthlyPrice) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
      <View style={[styles.hero, { backgroundColor: DS_COLORS.accent }]}>
        <Text style={styles.heroLogo}>G R I I T</Text>
        <Text style={styles.heroTitle}>Unlock your full potential.</Text>
        <Text style={styles.heroSubtitle}>Build discipline without limits.</Text>
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={12} accessibilityLabel="Go back">
          <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: DS_COLORS.textPrimary }]}>GRIIT Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.tagline, { color: DS_COLORS.textSecondary }]}>{tagline}</Text>

        <View style={styles.featureList}>
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <View key={label} style={[styles.featureRow, { borderLeftColor: DS_COLORS.accent }]}>
              <View style={[styles.featureIconWrap, { backgroundColor: DS_COLORS.accentSoft }]}>
                <Icon size={20} color={DS_COLORS.accent} />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={[styles.featureLabel, { color: DS_COLORS.textPrimary }]}>{label}</Text>
                {desc ? <Text style={[styles.featureDesc, { color: DS_COLORS.textSecondary }]}>{desc}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {offeringLoading ? (
          <View style={[styles.packageRow, styles.skeleton]}>
            <View style={[styles.packageCard, styles.skeletonCard]} />
            <View style={[styles.packageCard, styles.skeletonCard]} />
          </View>
        ) : offeringError ? (
          <View style={styles.retryWrap}>
            <Text style={[styles.retryText, { color: DS_COLORS.textSecondary }]}>Couldn&apos;t load plans.</Text>
            <TouchableOpacity
              onPress={loadOfferings}
              style={[styles.retryBtn, { backgroundColor: DS_COLORS.accent }]}
              activeOpacity={0.8}
            >
              <RefreshCw size={18} color="#FFF" />
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : offering?.availablePackages?.length ? (
          <View style={styles.packageRow}>
            {monthlyPkg && (
              <TouchableOpacity
                onPress={() => setSelectedPackage(monthlyPkg)}
                activeOpacity={0.8}
                style={[
                  styles.packageCard,
                  selectedPackage?.identifier === monthlyPkg.identifier && styles.packageCardSelected,
                ]}
              >
                <Text style={[styles.packageLabel, { color: DS_COLORS.textPrimary }]}>Monthly</Text>
                <Text style={[styles.packagePrice, { color: DS_COLORS.textPrimary }]}>
                  {monthlyPkg.product?.priceString ?? "—"}
                </Text>
                <Text style={[styles.packagePerMonth, { color: DS_COLORS.textSecondary }]}>Flexible</Text>
              </TouchableOpacity>
            )}
            {annualPkg && (
              <TouchableOpacity
                onPress={() => setSelectedPackage(annualPkg)}
                activeOpacity={0.8}
                style={[
                  styles.packageCard,
                  selectedPackage?.identifier === annualPkg.identifier && styles.packageCardAnnualSelected,
                ]}
              >
                {savePercent > 0 && (
                  <View style={[styles.saveBadge, { backgroundColor: DS_COLORS.success }]}>
                    <Text style={styles.saveBadgeText}>Save {savePercent}%</Text>
                  </View>
                )}
                <Text style={[styles.packageLabel, { color: DS_COLORS.textPrimary }]}>Annual</Text>
                <Text style={[styles.packagePrice, { color: DS_COLORS.textPrimary }]}>
                  {annualPkg.product?.priceString ?? "—"}
                </Text>
                <Text style={[styles.packagePerMonth, { color: DS_COLORS.textSecondary }]}>
                  {annualPrice > 0 ? `$${(annualPrice / 12).toFixed(2)}/mo` : "per year"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {purchaseError ? (
          <Text style={[styles.errorText, { color: DS_COLORS.danger }]}>{purchaseError}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSubscribe}
          disabled={!selectedPackage || purchasing}
          activeOpacity={0.8}
          style={[
            styles.cta,
            { backgroundColor: DS_COLORS.accent },
            (!selectedPackage || purchasing) && { backgroundColor: DS_COLORS.border, opacity: 0.9 },
          ]}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.ctaText}>
              {selectedPackage
                ? (selectedPackage.product as { introPrice?: unknown })?.introPrice != null
                  ? "Start your 7-day free trial"
                  : "Start Premium"
                : "Subscribe"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoring}
          style={styles.restoreWrap}
          activeOpacity={0.7}
        >
          {restoring ? (
            <ActivityIndicator size="small" color={DS_COLORS.accent} />
          ) : (
            <Text style={[styles.restoreText, { color: DS_COLORS.accent }]}>Restore purchases</Text>
          )}
        </TouchableOpacity>
        {restoreMessage ? (
          <Text style={[styles.restoreMessage, { color: DS_COLORS.textSecondary }]}>{restoreMessage}</Text>
        ) : null}

        <Text style={[styles.legal, { color: DS_COLORS.textSecondary }]}>
          Subscription auto-renews. Cancel anytime.
        </Text>
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => router.push(ROUTES.LEGAL_TERMS as never)}>
            <Text style={[styles.legalLink, { color: DS_COLORS.accent }]}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={[styles.legal, { color: DS_COLORS.textSecondary }]}> · </Text>
          <TouchableOpacity onPress={() => router.push(ROUTES.LEGAL_PRIVACY as never)}>
            <Text style={[styles.legalLink, { color: DS_COLORS.accent }]}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    paddingVertical: DS_SPACING.xxl,
    paddingHorizontal: DS_SPACING.lg,
    alignItems: "center",
  },
  heroLogo: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 4,
    color: DS_COLORS.white,
    marginBottom: DS_SPACING.md,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: DS_COLORS.white,
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.sm,
    backgroundColor: DS_COLORS.background,
  },
  headerTitle: {
    ...DS_TYPOGRAPHY.sectionHeader,
    color: DS_COLORS.textPrimary,
  },
  scroll: { flex: 1, backgroundColor: DS_COLORS.background },
  scrollContent: { paddingHorizontal: DS_SPACING.lg, paddingBottom: 40 },
  tagline: {
    ...DS_TYPOGRAPHY.screenSubtitle,
    marginBottom: DS_SPACING.lg,
    textAlign: "center",
  },
  featureList: {
    backgroundColor: BASE_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.cardPadding,
    marginBottom: DS_SPACING.xl,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    marginBottom: 4,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTextWrap: { flex: 1 },
  featureLabel: { ...DS_TYPOGRAPHY.cardSubtitle, fontWeight: "600", marginBottom: 2 },
  featureDesc: { fontSize: 13, lineHeight: 18 },
  packageRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: DS_SPACING.lg,
  },
  packageCard: {
    flex: 1,
    backgroundColor: BASE_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.cardPadding,
    borderWidth: 2,
    borderColor: "transparent",
    ...DS_SHADOWS.card,
  },
  packageCardSelected: {
    borderColor: DS_COLORS.border,
    backgroundColor: DS_COLORS.surface,
  },
  packageCardAnnualSelected: {
    borderColor: DS_COLORS.accent,
    borderWidth: 2,
    backgroundColor: DS_COLORS.cardSelectedBg,
  },
  skeleton: { minHeight: 120 },
  skeletonCard: { backgroundColor: DS_COLORS.skeletonBg },
  packageLabel: { ...DS_TYPOGRAPHY.cardTitle, marginBottom: 4 },
  packagePrice: { fontSize: 22, fontWeight: "700", marginBottom: 2 },
  packagePerMonth: { ...DS_TYPOGRAPHY.metadata },
  saveBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saveBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  retryWrap: {
    alignItems: "center",
    paddingVertical: DS_SPACING.xl,
    marginBottom: DS_SPACING.md,
  },
  retryText: { marginBottom: 12 },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: DS_RADIUS.input,
  },
  retryBtnText: { color: "#FFF", fontWeight: "600" },
  errorText: { marginBottom: 8, textAlign: "center" },
  cta: {
    paddingVertical: 16,
    borderRadius: DS_RADIUS.card,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginBottom: DS_SPACING.md,
  },
  ctaText: { ...DS_TYPOGRAPHY.ctaButton },
  restoreWrap: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  restoreText: { fontSize: 14, fontWeight: "500" },
  restoreMessage: { textAlign: "center", marginBottom: 8, fontSize: 13 },
  legal: { fontSize: 12, textAlign: "center", marginBottom: 4 },
  legalLinks: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 24 },
  legalLink: { fontSize: 12 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: DS_SPACING.xl,
  },
  title: { ...DS_TYPOGRAPHY.screenTitle, marginTop: 16, textAlign: "center" },
  subtitle: { ...DS_TYPOGRAPHY.screenSubtitle, marginTop: 8 },
});
