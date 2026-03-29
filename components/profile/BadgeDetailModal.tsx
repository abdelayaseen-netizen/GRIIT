import React from "react";
import { Modal, View, Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { DS_COLORS } from "@/lib/design-system";
import { BADGE_ICONS, badgeAccentFor } from "@/lib/profile-badges";
import { getBadgeDescription } from "@/lib/badge-descriptions";
import { Zap } from "lucide-react-native";

export type BadgeDetailPayload = {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number;
  total: number;
};

type Props = {
  badge: BadgeDetailPayload | null;
  onClose: () => void;
};

export function BadgeDetailModal({ badge, onClose }: Props) {
  const IconComp = badge ? BADGE_ICONS[badge.icon] ?? Zap : Zap;
  const accent = badge ? badgeAccentFor(badge.color) : badgeAccentFor("coral");
  const description = badge ? getBadgeDescription(badge.id) : "";
  const pct = badge ? Math.min(100, (badge.progress / Math.max(1, badge.total)) * 100) : 0;
  const complete = badge ? badge.progress >= badge.total : false;

  return (
    <Modal visible={badge != null} transparent animationType="fade" onRequestClose={onClose}>
      {badge ? (
        <View style={styles.wrap}>
          <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss badge detail" />
          <View style={styles.sheet} accessibilityViewIsModal>
            <View style={[styles.iconCircle, { backgroundColor: accent.bg }]}>
              <IconComp size={32} color={accent.stroke} strokeWidth={2} />
            </View>
            <Text style={styles.title}>{badge.name}</Text>
            <Text style={styles.body}>{description}</Text>
            <Text style={styles.progressLabel}>
              Progress: {badge.progress} / {badge.total} days
            </Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: complete ? DS_COLORS.ACCENT : DS_COLORS.PRIMARY }]} />
            </View>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close badge detail" accessibilityRole="button" style={styles.gotItWrap}>
              <Text style={styles.gotIt}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_COLORS.MODAL_BACKDROP,
  },
  sheet: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 48,
    alignItems: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS.TEXT_MUTED,
    marginBottom: 8,
  },
  barTrack: {
    width: "100%",
    maxWidth: 200,
    height: 6,
    backgroundColor: DS_COLORS.BORDER,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 24,
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  gotItWrap: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  gotIt: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS.PRIMARY,
  },
});
