/**
 * Counter · Count body — big n/target, segment row, + Add a {unit}.
 * Water/plain: no camera. Reading: optional page photo with Reading-only banner path.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Plus } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { CameraOnlyBanner } from "@/components/task/CameraOnlyBanner";

export type CounterVariant = "counter" | "water" | "reading";

type TaskCounterValue = {
  count: number;
};

export type TaskCounterBodyProps = {
  variant: CounterVariant;
  value: TaskCounterValue;
  onChangeCount: (next: number) => void;
  onAddPagePhoto?: () => void;
  goal: number;
  unitSingular: string;
  unitPlural: string;
  /** Quiet inline when last saveProgress failed. */
  notSavedYet?: boolean;
  photoUri?: string | null;
};

export function TaskCounterBody({
  variant,
  value,
  onChangeCount,
  onAddPagePhoto,
  goal,
  unitSingular,
  unitPlural,
  notSavedYet = false,
  photoUri = null,
}: TaskCounterBodyProps) {
  const target = Math.max(1, goal);
  const segments = Math.min(target, 24);

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.numberRow}>
          <Text style={styles.count}>{value.count}</Text>
          <Text style={styles.denom}>{`/ ${target}`}</Text>
        </View>
        <Text style={styles.unitLabel}>
          {value.count === 1 ? unitSingular : unitPlural} today
        </Text>

        <View style={styles.segments}>
          {Array.from({ length: segments }).map((_, idx) => {
            const filled = idx < value.count;
            return (
              <View
                key={idx}
                accessibilityRole="image"
                accessibilityLabel={`${unitSingular} ${idx + 1} ${filled ? "filled" : "empty"}`}
                style={[
                  styles.segment,
                  filled ? styles.segmentFilled : styles.segmentEmpty,
                ]}
              >
                {filled ? (
                  <Check
                    size={10}
                    color={DS_COLORS_V2.brand.primaryText}
                    strokeWidth={2.5}
                  />
                ) : null}
              </View>
            );
          })}
        </View>

        {notSavedYet ? (
          <Text style={styles.notSaved} accessibilityLiveRegion="polite">
            not saved yet
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add a ${unitSingular}`}
          onPress={() => onChangeCount(value.count + 1)}
          style={({ pressed }) => [
            styles.addBtn,
            pressed ? styles.pressed : null,
          ]}
        >
          <Plus size={16} color={DS_COLORS_V2.brand.primaryText} strokeWidth={2} />
          <Text style={styles.addBtnText}>{`+ Add a ${unitSingular}`}</Text>
        </Pressable>
      </View>

      {variant === "reading" && onAddPagePhoto ? (
        <View style={styles.photoBlock}>
          <CameraOnlyBanner variant="reading" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add page photo (optional)"
            onPress={onAddPagePhoto}
            style={({ pressed }) => [
              styles.pagePlaceholder,
              pressed ? styles.pressed : null,
            ]}
          >
            {photoUri ? (
              <Text style={styles.pagePlaceholderText}>Page photo attached</Text>
            ) : (
              <Text style={styles.pagePlaceholderText}>[ page ]</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_SPACING_V2.md },
  hero: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.lg,
    padding: DS_SPACING_V2.lg,
    gap: DS_SPACING_V2.md,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  count: {
    fontSize: 64,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
    lineHeight: 64,
  },
  denom: {
    fontSize: 24,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
    paddingBottom: 6,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
  segments: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    alignSelf: "stretch",
  },
  segment: {
    width: 28,
    height: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentFilled: {
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  segmentEmpty: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_COLORS_V2.surface.divider,
  },
  notSaved: {
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS_V2.semantic.warning,
  },
  addBtn: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
  },
  pressed: { opacity: 0.9 },
  photoBlock: { gap: DS_SPACING_V2.sm },
  pagePlaceholder: {
    minHeight: 120,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_COLORS_V2.surface.divider,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
  },
  pagePlaceholderText: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
});
