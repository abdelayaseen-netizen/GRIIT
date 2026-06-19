// PLACEHOLDER TESTIMONIALS — replace with real beta tester quotes before App Store launch.
// Yaseen has the WhatsApp/iMessage thread of beta tester reactions; pull real quotes from there.
// Apple App Store guideline: testimonials must be from real users with consent.
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame, X } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system";
import type { PaywallBodyProps } from "./types";

const TESTIMONIALS = [
  {
    quote: "I've started more habits than I can count. GRIIT is the first one I didn't quit.",
    author: "Marcus, 24",
  },
  {
    quote: "The streak freeze saved my 47-day run. I would have rage-quit any other app.",
    author: "David, 28",
  },
  {
    quote: "Posting proof to my friends > posting to nobody. Big difference.",
    author: "Jordan, 21",
  },
];

export default function PaywallSocialProof({
  loading,
  packages,
  purchasing,
  errorMessage,
  onClearError,
  onClose,
  onCta,
  onRestore,
  renderPlanItem,
  selectedTitle,
  selectedPrice,
  cancelNote,
  insetsBottom,
}: PaywallBodyProps) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Close paywall">
        <X size={18} color={DS_COLORS.TEXT_SECONDARY} />
      </TouchableOpacity>

      <FlatList
        data={loading ? [] : packages}
        keyExtractor={(pkg) => pkg.identifier}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={3}
        removeClippedSubviews
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={renderPlanItem}
        ListHeaderComponent={
          <>
            <View style={styles.heroSection}>
              <View style={styles.iconBadge}>
                <Flame size={36} color={DS_COLORS.WHITE} />
              </View>
              <Text style={styles.headline}>Join the men building unbreakable discipline</Text>
              <Text style={styles.founderLine}>Built by 1 indie developer obsessed with making discipline stick.</Text>
              <Text style={styles.currentUsers}>Thousands of men currently securing the day</Text>
            </View>

            <View style={styles.wall}>
              <Text style={styles.wallTitle}>Wall of testimonials</Text>
              {TESTIMONIALS.map((item) => (
                <View key={item.author} style={styles.quoteCard}>
                  <Text style={styles.quoteText}>{item.quote}</Text>
                  <Text style={styles.quoteAuthor}>— {item.author}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.planSectionLabel}>CHOOSE YOUR PLAN</Text>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingPlans}>
              <ActivityIndicator color={GRIIT_COLORS.primary} size="large" accessibilityLabel="Loading plans" />
            </View>
          ) : (
            <Text style={styles.noPlansText}>Subscription plans are unavailable. Check your connection.</Text>
          )
        }
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.stickyBar, { paddingBottom: insetsBottom + 12 }]}>
        {errorMessage ? (
          <TouchableOpacity style={styles.errorPill} onPress={onClearError} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Dismiss error">
            <Text style={styles.errorText} accessibilityRole="alert">
              {errorMessage}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.ctaButton, (purchasing || loading || packages.length === 0) && styles.ctaButtonDisabled]}
          onPress={onCta}
          disabled={purchasing || loading || packages.length === 0}
          activeOpacity={0.85}
          accessibilityLabel={`Purchase ${selectedTitle}`}
          accessibilityRole="button"
        >
          {purchasing ? <ActivityIndicator color={DS_COLORS.WHITE} size="small" /> : <Text style={styles.ctaButtonText}>Start {selectedTitle} — {selectedPrice}</Text>}
        </TouchableOpacity>

        <View style={styles.belowButtonRow}>
          <Text style={styles.cancelNote}>{cancelNote}</Text>
          <Pressable onPress={onRestore} disabled={purchasing} accessibilityRole="button" accessibilityLabel="Restore previous purchases">
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.BG_PRIMARY },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: DS_RADIUS.XL,
    backgroundColor: DS_COLORS.BG_CARD,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER_CARD,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scrollContent: { paddingTop: 56, paddingHorizontal: DS_SPACING.SCREEN_H },
  heroSection: { alignItems: "center", marginBottom: 20 },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: DS_RADIUS.XL,
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headline: { fontSize: DS_TYPOGRAPHY.SIZE_2XL, fontWeight: DS_TYPOGRAPHY.WEIGHT_EXTRABOLD, color: DS_COLORS.TEXT_PRIMARY, textAlign: "center" },
  founderLine: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_SECONDARY, marginTop: 8, textAlign: "center" },
  currentUsers: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_PRIMARY, marginTop: 8, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD },
  wall: { backgroundColor: DS_COLORS.BG_CARD, borderRadius: DS_RADIUS.LG, padding: DS_SPACING.BASE, marginBottom: 20 },
  wallTitle: { fontSize: DS_TYPOGRAPHY.SIZE_BASE, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.TEXT_PRIMARY, marginBottom: 8 },
  quoteCard: { backgroundColor: DS_COLORS.BG_CARD_TINTED, borderRadius: DS_RADIUS.MD, padding: 12, marginBottom: 8 },
  quoteText: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_PRIMARY, lineHeight: 20 },
  quoteAuthor: { marginTop: 6, fontSize: DS_TYPOGRAPHY.SIZE_XS, color: DS_COLORS.TEXT_SECONDARY, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD },
  planSectionLabel: { fontSize: DS_TYPOGRAPHY.SIZE_XS, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.TEXT_SECONDARY, marginBottom: 12 },
  loadingPlans: { minHeight: 120, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  noPlansText: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: GRIIT_COLORS.error, textAlign: "center", marginBottom: 20 },
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
  errorText: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.ERROR_RED, textAlign: "center" },
  ctaButton: { height: 56, borderRadius: DS_RADIUS.PILL, backgroundColor: DS_COLORS.ACCENT_PRIMARY, alignItems: "center", justifyContent: "center" },
  ctaButtonDisabled: { opacity: 0.7 },
  ctaButtonText: { fontSize: DS_TYPOGRAPHY.SIZE_MD, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.WHITE },
  belowButtonRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10, gap: 16 },
  cancelNote: { fontSize: DS_TYPOGRAPHY.SIZE_XS, color: DS_COLORS.TEXT_TERTIARY },
  restoreText: { fontSize: DS_TYPOGRAPHY.SIZE_XS, fontWeight: DS_TYPOGRAPHY.WEIGHT_MEDIUM, color: DS_COLORS.ACCENT_PRIMARY },
  legalLine: { fontSize: DS_TYPOGRAPHY.SIZE_XS, color: DS_COLORS.TEXT_TERTIARY, textAlign: "center", marginTop: 6 },
  legalLink: { textDecorationLine: "underline" },
});
