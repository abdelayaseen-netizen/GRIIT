/**
 * Premium Paywall Screen — GRIIT Pro subscription with RevenueCat offerings.
 */
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Pressable,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, Flame, Zap, BarChart2, Users } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system";
import { getOfferings, purchasePackage, restorePurchases } from "@/lib/revenue-cat";
import type { PurchasesPackage } from "react-native-purchases";
import { trackEvent } from "@/lib/analytics";
import { useProStatus } from "@/hooks/useProStatus";
import { ROUTES } from "@/lib/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const VALUE_PROPS = [
  { icon: Flame, title: "Unlimited challenges", subtitle: "Join as many as you want" },
  { icon: BarChart2, title: "Advanced analytics", subtitle: "Detailed streak and score breakdowns" },
  { icon: Users, title: "Team challenges", subtitle: "Compete with friends" },
  { icon: Zap, title: "Priority access", subtitle: "New challenges before anyone else" },
];

function packageSortKey(pkg: PurchasesPackage): number {
  const id = pkg.identifier.toLowerCase();
  const title = (pkg.product?.title ?? "").toLowerCase();
  if (id.includes("annual") || title.includes("annual")) return 0;
  if (id.includes("month") || title.includes("month")) return 1;
  if (id.includes("lifetime") || title.includes("lifetime")) return 2;
  return 3;
}

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string }>();
  const insets = useSafeAreaInsets();
  const { refetch: refetchPro } = useProStatus();

  const [offering, setOffering] = useState<Awaited<ReturnType<typeof getOfferings>>>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const paywallViewedTracked = useRef(false);

  useEffect(() => {
    if (paywallViewedTracked.current) return;
    paywallViewedTracked.current = true;
    try {
      const source = typeof params.source === "string" ? params.source : "unknown";
      trackEvent("paywall_viewed", { source });
    } catch {
      /* non-fatal */
    }
  }, [params.source]);

  useEffect(() => {
    let cancelled = false;
    getOfferings().then((o) => {
      if (cancelled) return;
      setOffering(o);
      const pkgs = [...(o?.availablePackages ?? [])].sort((a, b) => packageSortKey(a) - packageSortKey(b));
      if (pkgs.length > 0) {
        const annual = pkgs.find(
          (p) =>
            p.identifier.toLowerCase().includes("annual") ||
            (p.product?.title ?? "").toLowerCase().includes("annual")
        );
        setSelectedPackage(annual ?? pkgs[0] ?? null);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage) => {
      setPurchasing(true);
      setErrorMessage(null);
      const result = await purchasePackage(pkg);
      setPurchasing(false);
      if (result.success) {
        try {
          trackEvent("purchase_completed", {
            plan: pkg.identifier,
            price: pkg.product?.priceString ?? "",
          });
        } catch {
          /* non-fatal */
        }
        await refetchPro();
        router.replace(ROUTES.TABS as never);
      } else if (!result.cancelled) {
        try {
          trackEvent("purchase_failed", { error: result.error ?? "unknown" });
        } catch {
          /* non-fatal */
        }
        setErrorMessage(result.error ?? "Purchase failed. Please try again.");
      }
    },
    [router, refetchPro]
  );

  const handleCta = useCallback(() => {
    if (!selectedPackage) {
      setErrorMessage("No plan available. Try again later.");
      return;
    }
    void handlePurchase(selectedPackage);
  }, [selectedPackage, handlePurchase]);

  const handleRestore = useCallback(async () => {
    setPurchasing(true);
    setErrorMessage(null);
    const result = await restorePurchases();
    setPurchasing(false);
    if (result.success) {
      try {
        trackEvent("purchase_completed", { source: "restore" });
      } catch {
        /* non-fatal */
      }
      await refetchPro();
      router.replace(ROUTES.TABS as never);
    } else {
      try {
        trackEvent("purchase_failed", { error: "restore" });
      } catch {
        /* non-fatal */
      }
      setErrorMessage(result.error ?? "No purchases found to restore.");
    }
  }, [router, refetchPro]);

  const packages = [...(offering?.availablePackages ?? [])].sort((a, b) => packageSortKey(a) - packageSortKey(b));

  const selectedTitle = selectedPackage?.product?.title ?? selectedPackage?.identifier ?? "Premium";
  const selectedPrice = selectedPackage?.product?.priceString ?? "—";

  const cancelNote =
    selectedPackage &&
    (selectedPackage.identifier.toLowerCase().includes("lifetime") ||
      (selectedPackage.product?.title ?? "").toLowerCase().includes("lifetime"))
      ? "One-time purchase."
      : "Cancel anytime.";

  return (
    <ErrorBoundary>
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
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
        <View style={styles.heroSection}>
          <View style={styles.iconBadge}>
            <Flame size={36} color={DS_COLORS.WHITE} />
          </View>
          <Text style={styles.headline}>Unlock GRIIT Premium</Text>
          <Text style={styles.subheadline}>Build discipline without limits.</Text>
        </View>

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

        <Text style={styles.planSectionLabel}>CHOOSE YOUR PLAN</Text>

        {loading ? (
          <View style={styles.loadingPlans}>
            <ActivityIndicator color={GRIIT_COLORS.primary} size="large" accessibilityLabel="Loading plans" />
          </View>
        ) : packages.length === 0 ? (
          <Text style={styles.noPlansText}>Subscription plans are unavailable. Check your connection or try again later.</Text>
        ) : (
          <View style={styles.planContainer}>
            {packages.map((pkg) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const title = pkg.product?.title ?? pkg.identifier;
              const price = pkg.product?.priceString ?? "—";
              const subtitle = pkg.product?.description?.trim() || pkg.packageType.replace(/_/g, " ");
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[styles.planCard, isSelected && styles.planCardSelected]}
                  onPress={() => {
                    setSelectedPackage(pkg);
                    try {
                      trackEvent("paywall_plan_selected", { plan: pkg.identifier });
                    } catch {
                      /* non-fatal */
                    }
                  }}
                  activeOpacity={0.85}
                  disabled={purchasing}
                  accessibilityLabel={`Select ${title}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected, disabled: purchasing }}
                >
                  <View style={styles.planRow}>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.planMiddle}>
                      <Text style={styles.planLabel}>{title}</Text>
                      <Text style={styles.planBillingNote} numberOfLines={2}>
                        {subtitle}
                      </Text>
                    </View>
                    <View style={styles.planRight}>
                      <Text style={styles.planPrice}>{price}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.socialProofRow}>
          <View style={styles.avatarStack}>
            {[DS_COLORS.AVATAR_COLOR_1, DS_COLORS.AVATAR_COLOR_2, DS_COLORS.AVATAR_COLOR_3].map((color, i) => (
              <View
                key={i}
                style={[
                  styles.avatar,
                  { backgroundColor: color, marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i },
                ]}
              >
                <Text style={styles.avatarText}>{["A", "M", "J"][i]}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.socialProofText}>Join 2,800+ people building discipline</Text>
        </View>
      </ScrollView>

      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + 12 }]}>
        {errorMessage ? (
          <TouchableOpacity
            style={styles.errorPill}
            onPress={() => setErrorMessage(null)}
            activeOpacity={0.85}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
          >
            <Text style={styles.errorText} accessibilityRole="alert">
              {errorMessage}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.ctaButton, (purchasing || loading || packages.length === 0) && styles.ctaButtonDisabled]}
          onPress={handleCta}
          disabled={purchasing || loading || packages.length === 0}
          activeOpacity={0.85}
          accessibilityLabel={`Purchase ${selectedTitle}`}
          accessibilityRole="button"
        >
          {purchasing ? (
            <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
          ) : (
            <Text style={styles.ctaButtonText}>
              Start {selectedTitle} — {selectedPrice}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.belowButtonRow}>
          <Text style={styles.cancelNote}>{cancelNote}</Text>
          <Pressable
            onPress={handleRestore}
            disabled={purchasing}
            accessibilityRole="button"
            accessibilityLabel="Restore previous purchases"
          >
            <Text style={styles.restoreText}>Restore purchases</Text>
          </Pressable>
        </View>

        <Text style={styles.legalLine}>
          By continuing you agree to our{" "}
          <Text style={styles.legalLink} onPress={() => Linking.openURL("https://griit.app/terms")}>
            Terms
          </Text>{" "}
          &{" "}
          <Text style={styles.legalLink} onPress={() => Linking.openURL("https://griit.app/privacy")}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </SafeAreaView>
    </ErrorBoundary>
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
  loadingPlans: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  noPlansText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: GRIIT_COLORS.error,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
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
