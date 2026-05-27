/**
 * AlternativesDrawer — bottom sheet that lists every pack from `CHALLENGE_PACKS`
 * plus a dashed "Write my own challenge" escape-hatch row.
 *
 * Tap a pack → `onSelect` (parent updates the proposal & closes the sheet).
 * Tap the dashed row → `onOpenWriteMyOwn` (parent opens `WriteMyOwnSheet`).
 */
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Plus, X } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { CHALLENGE_PACKS, type ChallengePackDef } from "@/lib/challenge-packs";

export type AlternativesDrawerProps = {
  visible: boolean;
  currentPackId: string;
  onSelect: (pack: ChallengePackDef) => void;
  onOpenWriteMyOwn: () => void;
  onClose: () => void;
};

function estimatedMinutes(pack: ChallengePackDef): number {
  return Math.max(5, pack.taskCount * 18);
}

export function AlternativesDrawer({
  visible,
  currentPackId,
  onSelect,
  onOpenWriteMyOwn,
  onClose,
}: AlternativesDrawerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close alternatives"
        style={styles.backdrop}
        onPress={onClose}
      >
        <Pressable
          accessible={false}
          style={styles.sheet}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Pick a different one</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              onPress={onClose}
              style={styles.closeBtn}
            >
              <X size={20} color={DS_COLORS_V2.text.primary} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {CHALLENGE_PACKS.map((pack) => {
              const isCurrent = pack.id === currentPackId;
              return (
                <Pressable
                  key={pack.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${pack.name}`}
                  onPress={() => onSelect(pack)}
                  style={({ pressed }) => [
                    styles.row,
                    isCurrent ? styles.rowActive : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Text style={styles.rowEmoji}>{pack.emoji}</Text>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{pack.name}</Text>
                    <Text style={styles.rowDesc} numberOfLines={1}>
                      {pack.description}
                    </Text>
                  </View>
                  <View style={styles.minutesPill}>
                    <Text style={styles.minutesText}>
                      {`~${estimatedMinutes(pack)}m`}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Write my own challenge"
              onPress={onOpenWriteMyOwn}
              style={({ pressed }) => [
                styles.writeOwnRow,
                pressed ? styles.pressed : null,
              ]}
            >
              <Plus
                size={18}
                color={DS_COLORS_V2.text.primary}
                strokeWidth={2}
              />
              <Text style={styles.writeOwnText}>Write my own challenge</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: DS_COLORS_V2.overlay.photoGradientStrong,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderTopLeftRadius: DS_RADIUS_V2.xl,
    borderTopRightRadius: DS_RADIUS_V2.xl,
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.lg,
    maxHeight: "85%",
  },
  handleRow: {
    alignItems: "center",
    paddingVertical: DS_SPACING_V2.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.divider,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: DS_SPACING_V2.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { marginTop: DS_SPACING_V2.xs },
  listContent: { paddingBottom: DS_SPACING_V2.lg, gap: DS_SPACING_V2.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.sm,
    padding: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    backgroundColor: DS_COLORS_V2.surface.card,
  },
  rowActive: {
    borderColor: DS_COLORS_V2.brand.primary,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
  },
  rowEmoji: { fontSize: 22, width: 28, textAlign: "center" },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  rowDesc: {
    fontSize: 12,
    color: DS_COLORS_V2.text.secondary,
  },
  minutesPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.cardChipNeutral,
  },
  minutesText: {
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
  writeOwnRow: {
    marginTop: DS_SPACING_V2.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING_V2.xs,
    padding: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 1.5,
    borderColor: DS_COLORS_V2.surface.divider,
    borderStyle: "dashed",
  },
  writeOwnText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  pressed: { opacity: 0.85 },
});

export default AlternativesDrawer;
