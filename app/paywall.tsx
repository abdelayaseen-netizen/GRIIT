/**
 * Premium Paywall Screen — GRIIT Pro subscription with plan selection.
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Flame, Zap, BarChart2, Users } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";
import { purchasePro, restorePurchases } from "@/lib/revenue-cat";
import { useProStatus } from "@/hooks/useProStatus";

const PRICING_PLANS = [
  {
    id: "monthly" as const,
    label: "Monthly",
    price: "$9.99",
    pricePerMonth: "$9.99/mo",
    billingNote: "Billed monthly",
    badge: null,
    highlight: false,
  },
  {
    id: "annual" as const,
    label: "Annual",
    price: "$59.99",
    pricePerMonth: "$5.00/mo",
    billingNote: "Billed annually — save 50%",
    badge: "BEST VALUE",
    highlight: true,
  },
  {
    id: "lifetime" as const,
    label: "Lifetime",
    price: "$149.99",
    pricePerMonth: "One time",
    billingNote: "Pay once, own forever",
    badge: null,
    highlight: false,
  },
] as const;

type PlanId = (typeof PRICING_PLANS)[number]["id"];

const VALUE_PROPS = [
  { icon: Flame, title: "Unlimited challenges", subtitle: "Join as many as you want" },
  { icon: BarChart2, title: "Advanced analytics", subtitle: "Detailed streak and score breakdowns" },
  { icon: Users, title: "Team challenges", subtitle: "Compete with friends" },
  { icon: Zap, title: "Priority access", subtitle: "New challenges before anyone else" },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refetch: refetchPro } = useProStatus();

  const [selectedPlan, setSelectedPlan] = useState<PlanId>("annual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePlan = PRICING_PLANS.find((p) => p.id === selectedPlan)!;

  const handlePurchase = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await purchasePro();
      if (result.success) {
        await refetchPro();
        router.replace("/(tabs)" as never);
      } else {
        setError(result.error ?? "Purchase failed. Please try again.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Purchase failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [router, refetchPro]);

  const handleRestore = useCallback(async () => {
    setError(null);
    try {
      const result = await restorePurchases();
      if (result.success) {
        await refetchPro();
        router.replace("/(tabs)" as never);
      } else {
        setError("No purchases to restore.");
      }
    } catch {
      setError("Restore failed. Please try again.");
    }
  }, [router, refetchPro]);

  const cancelNote =
    selectedPlan === "lifetime" ? "One-time purchase." : "Cancel anytime.";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
        accessibilityLabel="Close"
        accessibilityRole="button"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={18} color={DS_COLORS.TEXT_SECONDARY} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconBadge}>
            <Flame size={36} color={DS_COLORS.WHITE} />
          </View>
          <Text style={styles.headline}>Unlock GRIIT Premium</Text>
          <Text style={styles.subheadline}>Build discipline without limits.</Text>
        </View>

        {/* Value Props Card */}
        <View style={styles.valueCard}>
          {VALUE_PROPS.map((prop, index) => (
            <View key={prop.title}>
              <View style={styles.valueRow}>
                <prop.icon size={20} color={DS_COLORS.ACCENT_PRIMARY} />
                <View style={styles.valueTextContainer}>
                  <Text style={styles.valueTitle}>{prop.title}</Text>
                  <Text style={styles.valueSubtitle}>{prop.subtitle}</Text>
                </View>
              </View>
              {index < VALUE_PROPS.length - 1 && <View style={styles.valueDivider} />}
            </View>
          ))}
        </View>

        {/* Plan Selector */}
        <Text style={styles.planSectionLabel}>CHOOSE YOUR PLAN</Text>
        <View style={styles.planContainer}>
          {PRICING_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.85}
                accessibilityLabel={`Select ${plan.label} plan`}
                accessibilityRole="button"
              >
                {plan.badge && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <View style={styles.planRow}>
                  {/* Radio */}
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  {/* Middle */}
                  <View style={styles.planMiddle}>
                    <Text style={styles.planLabel}>{plan.label}</Text>
                    <Text style={styles.planBillingNote}>{plan.billingNote}</Text>
                  </View>
                  {/* Right */}
                  <View style={styles.planRight}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPerMonth}>{plan.pricePerMonth}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Social Proof */}
        <View style={styles.socialProofRow}>
          <View style={styles.avatarStack}>
            {[DS_COLORS.AVATAR_COLOR_1, DS_COLORS.AVATAR_COLOR_2, DS_COLORS.AVATAR_COLOR_3].map(
              (color, i) => (
                <View
                  key={i}
                  style={[
                    styles.avatar,
                    { backgroundColor: color, marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i },
                  ]}
                >
                  <Text style={styles.avatarText}>{["A", "M", "J"][i]}</Text>
                </View>
              )
            )}
          </View>
          <Text style={styles.socialProofText}>Join 2,800+ people building discipline</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + 12 }]}>
        {/* Error Pill */}
        {error && (
          <TouchableOpacity
            style={styles.errorPill}
            onPress={() => setError(null)}
            activeOpacity={0.85}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
          >
            <Text style={styles.errorText}>{error}</Text>
          </TouchableOpacity>
        )}

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
          onPress={handlePurchase}
          disabled={isLoading}
          activeOpacity={0.85}
          accessibilityLabel={`Purchase ${activePlan.label} plan`}
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
          ) : (
            <Text style={styles.ctaButtonText}>
              Start {activePlan.label} — {activePlan.price}
            </Text>
          )}
        </TouchableOpacity>

        {/* Below Button Row */}
        <View style={styles.belowButtonRow}>
          <Text style={styles.cancelNote}>{cancelNote}</Text>
          <TouchableOpacity
            onPress={handleRestore}
            accessibilityLabel="Restore purchases"
            accessibilityRole="button"
          >
            <Text style={styles.restoreText}>Restore purchases</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Line */}
        <Text style={styles.legalLine}>
          By continuing you agree to our{" "}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL("https://griit.app/terms")}
          >
            Terms
          </Text>{" "}
          &{" "}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL("https://griit.app/privacy")}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.BG_PRIMARY,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.BG_CARD,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER_CARD,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 56,
    paddingHorizontal: DS_SPACING.SCREEN_H,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headline: {
    fontSize: DS_TYPOGRAPHY.SIZE_3XL,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BLACK,
    color: DS_COLORS.TEXT_PRIMARY,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: DS_TYPOGRAPHY.SIZE_MD,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_REGULAR,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginTop: 8,
  },
  valueCard: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
    padding: DS_SPACING.BASE,
    marginBottom: 28,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    gap: 12,
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  valueSubtitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 1,
  },
  valueDivider: {
    height: 1,
    backgroundColor: DS_COLORS.DIVIDER,
  },
  planSectionLabel: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_SECONDARY,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  planContainer: {
    gap: 10,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderWidth: 1.5,
    borderColor: DS_COLORS.BORDER_CARD,
    borderRadius: DS_RADIUS.LG,
    padding: 16,
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: DS_COLORS.ACCENT_PRIMARY,
    shadowColor: DS_COLORS.ACCENT_PRIMARY,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  planBadge: {
    position: "absolute",
    top: -10,
    right: 12,
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
    borderRadius: DS_RADIUS.PILL,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  planBadgeText: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.WHITE,
    letterSpacing: 0.5,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: DS_COLORS.BORDER_CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
    borderColor: DS_COLORS.ACCENT_PRIMARY,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DS_COLORS.WHITE,
  },
  planMiddle: {
    flex: 1,
    marginLeft: 12,
  },
  planLabel: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  planBillingNote: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  planRight: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: DS_TYPOGRAPHY.SIZE_LG,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BLACK,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  planPerMonth: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  socialProofRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarStack: {
    flexDirection: "row",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: DS_COLORS.BG_PRIMARY,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.WHITE,
  },
  socialProofText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    marginLeft: 10,
  },
  stickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DS_COLORS.BG_CARD,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.BORDER_DEFAULT,
    paddingHorizontal: DS_SPACING.SCREEN_H,
    paddingTop: 12,
  },
  errorPill: {
    backgroundColor: DS_COLORS.ERROR_BG,
    borderWidth: 1,
    borderColor: DS_COLORS.ERROR_RED,
    borderRadius: DS_RADIUS.MD,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  errorText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.ERROR_RED,
    textAlign: "center",
  },
  ctaButton: {
    height: 56,
    borderRadius: DS_RADIUS.PILL,
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    fontSize: DS_TYPOGRAPHY.SIZE_MD,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.WHITE,
  },
  belowButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 16,
  },
  cancelNote: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_TERTIARY,
  },
  restoreText: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_MEDIUM,
    color: DS_COLORS.ACCENT_PRIMARY,
  },
  legalLine: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_TERTIARY,
    textAlign: "center",
    marginTop: 6,
  },
  legalLink: {
    textDecorationLine: "underline",
  },
});
