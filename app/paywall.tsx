/**
 * Premium Paywall Screen — GRIIT Pro subscription with RevenueCat offerings.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { PurchasesPackage } from "react-native-purchases";
import { DS_COLORS, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";
import { getOfferings, purchasePackage, restorePurchases } from "@/lib/revenue-cat";
import {
  getPaywallVariant,
  track,
  trackEvent,
  trackPaywallOfferingSelected,
  trackPaywallPurchaseCancelled,
  trackPaywallPurchaseCompleted,
  trackPaywallPurchaseFailed,
  trackPaywallPurchaseStarted,
  trackPaywallRestoreFailed,
  trackPaywallRestoreTapped,
  trackPaywallVariantAssigned,
  type PaywallVariant,
} from "@/lib/analytics";
import { useProStatus } from "@/hooks/useProStatus";
import { ROUTES } from "@/lib/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PaywallControl from "@/components/paywall/PaywallControl";
import PaywallSocialProof from "@/components/paywall/PaywallSocialProof";

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
  const { refetch: refetchPro } = useProStatus();

  const [variant] = useState<PaywallVariant>(() => getPaywallVariant());
  const [offering, setOffering] = useState<Awaited<ReturnType<typeof getOfferings>>>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const paywallViewedTracked = useRef(false);

  const source = typeof params.source === "string" ? params.source : "unknown";

  useEffect(() => {
    if (paywallViewedTracked.current) return;
    paywallViewedTracked.current = true;
    try {
      trackPaywallVariantAssigned({ variant });
      track({ name: "paywall_viewed", source, variant });
      trackEvent("paywall_viewed", { source, variant });
      track({ name: "paywall_shown", source });
    } catch {
      /* non-fatal */
    }
  }, [source, variant]);

  useEffect(() => {
    let cancelled = false;
    getOfferings().then((o) => {
      if (cancelled) return;
      setOffering(o);
      const pkgs = [...(o?.availablePackages ?? [])].sort((a, b) => packageSortKey(a) - packageSortKey(b));
      if (pkgs.length > 0) {
        const annual = pkgs.find(
          (p) => p.identifier.toLowerCase().includes("annual") || (p.product?.title ?? "").toLowerCase().includes("annual")
        );
        setSelectedPackage(annual ?? pkgs[0] ?? null);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClose = useCallback(() => {
    try {
      track({ name: "paywall_dismissed", source });
    } catch {
      /* non-fatal */
    }
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.TABS_HOME as never);
  }, [router, source]);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage) => {
      setPurchasing(true);
      setErrorMessage(null);
      trackPaywallPurchaseStarted({ package_id: pkg.identifier, variant });
      const result = await purchasePackage(pkg);
      setPurchasing(false);
      if (result.success) {
        trackPaywallPurchaseCompleted({ package_id: pkg.identifier, variant });
        if (Platform.OS !== "web") {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        await refetchPro();
        router.replace(ROUTES.TABS as never);
      } else if (result.cancelled) {
        trackPaywallPurchaseCancelled({ package_id: pkg.identifier, variant });
      } else {
        trackPaywallPurchaseFailed({
          package_id: pkg.identifier,
          variant,
          error_code: result.error ?? "purchase_failed",
        });
        setErrorMessage(result.error ?? "Purchase failed. Please try again.");
      }
    },
    [refetchPro, router, variant]
  );

  const handleCta = useCallback(() => {
    if (!selectedPackage) {
      setErrorMessage("No plan available. Try again later.");
      return;
    }
    void handlePurchase(selectedPackage);
  }, [handlePurchase, selectedPackage]);

  const handleRestore = useCallback(async () => {
    trackPaywallRestoreTapped({ variant });
    setPurchasing(true);
    setErrorMessage(null);
    const result = await restorePurchases();
    setPurchasing(false);
    if (result.success) {
      await refetchPro();
      router.replace(ROUTES.TABS as never);
      return;
    }
    trackPaywallRestoreFailed({ variant, error_code: result.error ?? "restore_failed" });
    setErrorMessage(result.error ?? "No purchases found to restore.");
  }, [refetchPro, router, variant]);

  const packages = useMemo(
    () => [...(offering?.availablePackages ?? [])].sort((a, b) => packageSortKey(a) - packageSortKey(b)),
    [offering]
  );

  const renderPlanItem = useCallback(
    ({ item: pkg }: { item: PurchasesPackage }) => {
      const isSelected = selectedPackage?.identifier === pkg.identifier;
      const title = pkg.product?.title ?? pkg.identifier;
      const price = pkg.product?.priceString ?? "—";
      return (
        <TouchableOpacity
          style={[styles.planCard, isSelected && styles.planCardSelected]}
          onPress={() => {
            setSelectedPackage(pkg);
            trackPaywallOfferingSelected({ package_id: pkg.identifier, variant });
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
                {pkg.product?.description?.trim() || pkg.packageType.replace(/_/g, " ")}
              </Text>
            </View>
            <Text style={styles.planPrice}>{price}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [purchasing, selectedPackage?.identifier, variant]
  );

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
      {variant === "social_proof" ? (
        <PaywallSocialProof
          loading={loading}
          packages={packages}
          selectedPackage={selectedPackage}
          purchasing={purchasing}
          errorMessage={errorMessage}
          onClearError={() => setErrorMessage(null)}
          onClose={handleClose}
          onCta={handleCta}
          onRestore={handleRestore}
          renderPlanItem={renderPlanItem}
          selectedTitle={selectedTitle}
          selectedPrice={selectedPrice}
          cancelNote={cancelNote}
          insetsBottom={0}
        />
      ) : (
        <PaywallControl
          loading={loading}
          packages={packages}
          selectedPackage={selectedPackage}
          purchasing={purchasing}
          errorMessage={errorMessage}
          onClearError={() => setErrorMessage(null)}
          onClose={handleClose}
          onCta={handleCta}
          onRestore={handleRestore}
          renderPlanItem={renderPlanItem}
          selectedTitle={selectedTitle}
          selectedPrice={selectedPrice}
          cancelNote={cancelNote}
          insetsBottom={0}
        />
      )}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
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
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: DS_RADIUS.MD,
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
    borderRadius: DS_RADIUS.SM,
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
  planPrice: {
    fontSize: DS_TYPOGRAPHY.SIZE_LG,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BLACK,
    color: DS_COLORS.TEXT_PRIMARY,
  },
});
