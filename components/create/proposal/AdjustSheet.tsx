/**
 * AdjustSheet — bottom sheet opened from `CalendarPreviewScreen` to let the
 * user tweak duration, difficulty, and photo proof before locking in.
 *
 * Reads/writes the create-proposal store directly. Each mutation also fires a
 * `create_adjusted` PostHog event with the field name.
 */
import React, { useCallback } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ShieldAlert, X } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { trackEvent } from "@/lib/analytics";

import { useCreateProposalStore } from "@/store/create-proposal-store";

const DURATION_OPTIONS: readonly number[] = [7, 21, 30, 60, 75] as const;

export type AdjustSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AdjustSheet({ visible, onClose }: AdjustSheetProps) {
  const duration = useCreateProposalStore((s) => s.durationDays);
  const difficulty = useCreateProposalStore((s) => s.difficulty);
  const photoProof = useCreateProposalStore((s) => s.photoProof);
  const setDuration = useCreateProposalStore((s) => s.setDuration);
  const setDifficulty = useCreateProposalStore((s) => s.setDifficulty);
  const setPhotoProof = useCreateProposalStore((s) => s.setPhotoProof);

  const handleSetDuration = useCallback(
    (d: number) => {
      setDuration(d);
      trackEvent("create_adjusted", { field: "duration", value: d });
    },
    [setDuration]
  );

  const handleSetDifficulty = useCallback(
    (d: "standard" | "hard") => {
      setDifficulty(d);
      trackEvent("create_adjusted", { field: "difficulty", value: d });
    },
    [setDifficulty]
  );

  const handleSetPhoto = useCallback(
    (p: "off" | "optional" | "required") => {
      setPhotoProof(p);
      trackEvent("create_adjusted", { field: "photoProof", value: p });
    },
    [setPhotoProof]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close adjust sheet"
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
            <Text style={styles.title}>Adjust before you commit</Text>
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
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.sectionLabel}>Duration</Text>
            <View style={styles.chipRow}>
              {DURATION_OPTIONS.map((d) => {
                const selected = d === duration;
                return (
                  <Pressable
                    key={d}
                    accessibilityRole="button"
                    accessibilityLabel={`${d} days`}
                    accessibilityState={{ selected }}
                    onPress={() => handleSetDuration(d)}
                    style={[
                      styles.chip,
                      selected ? styles.chipSelected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected ? styles.chipTextSelected : null,
                      ]}
                    >
                      {`${d} days`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Difficulty</Text>
            <View style={styles.toggleRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Standard difficulty"
                accessibilityState={{ selected: difficulty === "standard" }}
                onPress={() => handleSetDifficulty("standard")}
                style={[
                  styles.toggle,
                  difficulty === "standard" ? styles.toggleSelected : null,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    difficulty === "standard" ? styles.toggleTextSelected : null,
                  ]}
                >
                  Standard
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Hard difficulty"
                accessibilityState={{ selected: difficulty === "hard" }}
                onPress={() => handleSetDifficulty("hard")}
                style={[
                  styles.toggle,
                  difficulty === "hard" ? styles.toggleSelected : null,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    difficulty === "hard" ? styles.toggleTextSelected : null,
                  ]}
                >
                  Hard
                </Text>
              </Pressable>
            </View>
            {difficulty === "hard" ? (
              <View style={styles.warnCard}>
                <ShieldAlert
                  size={14}
                  color={DS_COLORS_V2.semantic.warning}
                  strokeWidth={2}
                />
                <Text style={styles.warnText}>
                  Hard mode means no freezes, restart on miss.
                </Text>
              </View>
            ) : null}

            <Text style={styles.sectionLabel}>Photo proof</Text>
            <View style={styles.chipRow}>
              {(["off", "optional", "required"] as const).map((p) => {
                const selected = p === photoProof;
                return (
                  <Pressable
                    key={p}
                    accessibilityRole="button"
                    accessibilityLabel={`Photo proof ${p}`}
                    accessibilityState={{ selected }}
                    onPress={() => handleSetPhoto(p)}
                    style={[
                      styles.chip,
                      selected ? styles.chipSelected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected ? styles.chipTextSelected : null,
                      ]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Apply changes"
              onPress={onClose}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Apply</Text>
            </Pressable>
          </View>
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
  handleRow: { alignItems: "center", paddingVertical: DS_SPACING_V2.xs },
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
  scroll: { marginTop: DS_SPACING_V2.xs },
  scrollContent: { paddingBottom: DS_SPACING_V2.lg, gap: DS_SPACING_V2.xs },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    marginTop: DS_SPACING_V2.sm,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: DS_SPACING_V2.xs },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  chipSelected: {
    backgroundColor: DS_COLORS_V2.brand.primary,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    textTransform: "capitalize",
  },
  chipTextSelected: { color: DS_COLORS_V2.brand.primaryText },
  toggleRow: { flexDirection: "row", gap: DS_SPACING_V2.xs },
  toggle: {
    flex: 1,
    paddingVertical: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    alignItems: "center",
  },
  toggleSelected: {
    backgroundColor: DS_COLORS_V2.brand.primary,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  toggleTextSelected: { color: DS_COLORS_V2.brand.primaryText },
  warnCard: {
    marginTop: DS_SPACING_V2.xs,
    flexDirection: "row",
    gap: DS_SPACING_V2.xs,
    padding: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.semantic.warningSoft,
  },
  warnText: {
    flex: 1,
    fontSize: 12,
    color: DS_COLORS_V2.semantic.warning,
  },
  footer: {
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.xs,
  },
  primaryBtn: {
    backgroundColor: DS_COLORS_V2.brand.primary,
    paddingVertical: 16,
    borderRadius: DS_RADIUS_V2.md,
    alignItems: "center",
  },
  primaryBtnText: {
    color: DS_COLORS_V2.brand.primaryText,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default AdjustSheet;
