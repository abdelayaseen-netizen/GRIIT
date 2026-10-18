/**
 * Build 92 05.3: the GRIIT Pro upgrade sheet opened from a Pro sticker (P1-18).
 * Sits over the full-screen share sheet, so it is its own transparent Modal.
 * Prices come from RevenueCat offerings; "Try GRIIT Pro" buys the annual package
 * when there is one, "Not now" returns to the carousel on the same style.
 */
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Activity, Hash, Snowflake, Sticker, X } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { getOfferings, purchasePackage } from "@/lib/revenue-cat";
import { useProStatus } from "@/hooks/useProStatus";
import {
  PRO_SHEET_BULLETS,
  PRO_SHEET_FREE_LINE,
  PRO_SHEET_NOT_NOW,
  PRO_SHEET_PRICE_LOADING,
  PRO_SHEET_PRICE_SOURCE,
  PRO_SHEET_PRICE_UNAVAILABLE,
  PRO_SHEET_PURCHASE_FAILED,
  PRO_SHEET_TITLE,
  PRO_SHEET_TRY,
  proPackagesFromOffering,
  proPriceLine,
  proTrialPackage,
  type ProPackages,
} from "@/lib/pro-upgrade";

const ICONS = [Sticker, Snowflake, Hash, Activity] as const;

export type ProUpgradeSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Called after a successful purchase, once the entitlement has been refetched. */
  onUnlocked: () => void;
};

export default function ProUpgradeSheet({ visible, onClose, onUnlocked }: ProUpgradeSheetProps) {
  const insets = useSafeAreaInsets();
  const { refetch } = useProStatus();
  const [pkgs, setPkgs] = useState<ProPackages | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getOfferings()
      .then((offering) => {
        if (!cancelled) setPkgs(proPackagesFromOffering(offering));
      })
      .catch(() => {
        if (!cancelled) setPkgs({ monthly: null, annual: null });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const trial = pkgs ? proTrialPackage(pkgs) : null;
  const priceLine = pkgs
    ? proPriceLine({
        monthly: pkgs.monthly?.product?.priceString ?? null,
        annual: pkgs.annual?.product?.priceString ?? null,
      })
    : "";

  const buy = useCallback(async () => {
    if (!trial || busy) return;
    setBusy(true);
    setError(null);
    const result = await purchasePackage(trial);
    if (result.success) {
      await refetch();
      setBusy(false);
      onUnlocked();
      return;
    }
    setBusy(false);
    if (!result.cancelled) setError(PRO_SHEET_PURCHASE_FAILED);
  }, [busy, onUnlocked, refetch, trial]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel={PRO_SHEET_NOT_NOW} onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, DS_V3.space.lg) }]} testID="pro-upgrade-sheet">
          <View style={styles.grabber} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>{PRO_SHEET_TITLE}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={PRO_SHEET_NOT_NOW} onPress={onClose} hitSlop={8} style={styles.close}>
              <X size={22} color={DS_V3.color.textPrimary} />
            </Pressable>
          </View>
          <Text style={styles.free}>{PRO_SHEET_FREE_LINE}</Text>
          {PRO_SHEET_BULLETS.map((line, i) => {
            const Icon = ICONS[i] ?? Sticker;
            return (
              <View key={line} style={[styles.bullet, i > 0 ? styles.bulletLine : null]}>
                <Icon size={18} color={DS_V3.color.textPrimary} />
                <Text style={styles.bulletText}>{line}</Text>
              </View>
            );
          })}
          <Text style={styles.price} testID="pro-price-line">
            {loading ? PRO_SHEET_PRICE_LOADING : priceLine ? `${priceLine} ${PRO_SHEET_PRICE_SOURCE}` : PRO_SHEET_PRICE_UNAVAILABLE}
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={PRO_SHEET_TRY}
            accessibilityState={{ disabled: !trial || busy }}
            disabled={!trial || busy}
            onPress={() => void buy()}
            style={[styles.primary, !trial || busy ? styles.primaryOff : null]}
            testID="pro-try"
          >
            {busy ? <ActivityIndicator color={DS_V3.color.textPrimary} /> : <Text style={styles.primaryText}>{PRO_SHEET_TRY}</Text>}
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={PRO_SHEET_NOT_NOW} onPress={onClose} style={styles.secondary} testID="pro-not-now">
            <Text style={styles.secondaryText}>{PRO_SHEET_NOT_NOW}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: DS_V3.color.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    gap: DS_V3.space.sm,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DS_V3.color.textTertiary,
    marginBottom: DS_V3.space.sm,
  },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { ...DS_V3.type.title, color: DS_V3.color.textPrimary },
  close: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  free: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary, marginBottom: DS_V3.space.xs },
  bullet: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.md, paddingVertical: DS_V3.space.md },
  bulletLine: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: DS_V3.color.hairline },
  bulletText: { ...DS_V3.type.body, color: DS_V3.color.textPrimary, flex: 1 },
  price: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary, marginTop: DS_V3.space.xs },
  error: { ...DS_V3.type.caption, color: DS_V3.color.danger },
  primary: {
    height: DS_V3.size.button,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: DS_V3.space.sm,
  },
  primaryOff: { opacity: 0.5 },
  primaryText: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  secondary: { height: DS_V3.size.buttonSmall, alignItems: "center", justifyContent: "center" },
  secondaryText: { ...DS_V3.type.body, color: DS_V3.color.textSecondary },
});
