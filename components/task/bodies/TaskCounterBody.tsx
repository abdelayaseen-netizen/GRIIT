/**
 * Counter body — generic counter, water, or reading.
 *
 * Variant mapping:
 *   - counter:  big-number + ± buttons + progress bar.
 *   - water:    cup grid + ± + reminders toggle.
 *   - reading:  book title input + page counter + quick-add chips + photo row.
 */
import React from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Bell, Camera, Check, Minus, Plus } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

export type CounterVariant = "counter" | "water" | "reading";

type TaskCounterValue = {
  count: number;
  bookTitle?: string;
  remindersEnabled?: boolean;
};

export type TaskCounterBodyProps = {
  variant: CounterVariant;
  value: TaskCounterValue;
  onChangeCount: (next: number) => void;
  onChangeBookTitle?: (v: string) => void;
  onToggleReminders?: (v: boolean) => void;
  onAddPagePhoto?: () => void;
  goal: number;
  unitSingular: string;
  unitPlural: string;
};

const QUICK_ADD: readonly number[] = [5, 10, 25] as const;

export function TaskCounterBody({
  variant,
  value,
  onChangeCount,
  onChangeBookTitle,
  onToggleReminders,
  onAddPagePhoto,
  goal,
  unitSingular,
  unitPlural,
}: TaskCounterBodyProps) {
  const remaining = Math.max(0, goal - value.count);
  const progressFrac = goal > 0 ? Math.min(1, value.count / goal) : 0;

  return (
    <View style={styles.wrap}>
      {variant === "reading" ? (
        <View style={styles.bookCard}>
          <Text style={styles.label}>WHAT ARE YOU READING?</Text>
          <TextInput
            accessibilityLabel="Book title"
            value={value.bookTitle ?? ""}
            onChangeText={onChangeBookTitle ?? (() => undefined)}
            placeholder="Book title"
            placeholderTextColor={DS_COLORS_V2.text.tertiary}
            style={styles.bookInput}
          />
        </View>
      ) : null}

      <View style={styles.hero}>
        <Text style={styles.heroTopline}>DAILY TARGET</Text>
        <View style={styles.heroNumberRow}>
          <Text style={styles.heroNumber}>{value.count}</Text>
          <Text style={styles.heroDenom}>{`/ ${goal}`}</Text>
        </View>
        <Text style={styles.heroSub}>
          {remaining > 0
            ? `${remaining} ${remaining === 1 ? unitSingular : unitPlural} to go`
            : "Goal reached — nice work."}
        </Text>

        {variant === "water" ? (
          <View style={styles.cupsRow}>
            {Array.from({ length: goal }).map((_, idx) => {
              const filled = idx < value.count;
              return (
                <View
                  key={idx}
                  accessibilityRole="image"
                  accessibilityLabel={`Cup ${idx + 1} ${filled ? "filled" : "empty"}`}
                  style={[
                    styles.cupSlot,
                    filled ? styles.cupFilled : styles.cupEmpty,
                  ]}
                >
                  {filled ? (
                    <Check
                      size={11}
                      color={DS_COLORS_V2.brand.primaryText}
                      strokeWidth={2.5}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progressFrac * 100)}%` },
              ]}
            />
          </View>
        )}

        <View style={styles.controlsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Subtract one ${unitSingular}`}
            onPress={() => onChangeCount(Math.max(0, value.count - 1))}
            style={({ pressed }) => [
              styles.minusBtn,
              pressed ? styles.pressed : null,
            ]}
            hitSlop={6}
          >
            <Minus size={18} color={DS_COLORS_V2.text.onDark} strokeWidth={2} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add one ${unitSingular}`}
            onPress={() => onChangeCount(value.count + 1)}
            style={({ pressed }) => [
              styles.addBtn,
              pressed ? styles.pressed : null,
            ]}
          >
            <Plus
              size={16}
              color={DS_COLORS_V2.brand.primaryText}
              strokeWidth={2}
            />
            <Text style={styles.addBtnText}>{`Add a ${unitSingular}`}</Text>
          </Pressable>
        </View>

        {variant === "reading" ? (
          <View style={styles.quickRow}>
            {QUICK_ADD.map((n) => (
              <Pressable
                key={n}
                accessibilityRole="button"
                accessibilityLabel={`Add ${n} pages`}
                onPress={() => onChangeCount(value.count + n)}
                style={({ pressed }) => [
                  styles.quickChip,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.quickChipText}>{`+${n}`}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      {variant === "water" ? (
        <View style={styles.remindersCard}>
          <Bell
            size={16}
            color={DS_COLORS_V2.text.primary}
            strokeWidth={2}
          />
          <Text style={styles.remindersText}>Hourly reminders</Text>
          <Switch
            accessibilityLabel="Toggle hourly reminders"
            value={!!value.remindersEnabled}
            onValueChange={onToggleReminders ?? (() => undefined)}
            trackColor={{
              false: DS_COLORS_V2.surface.divider,
              true: DS_COLORS_V2.brand.primary,
            }}
            thumbColor={DS_COLORS_V2.surface.card}
          />
        </View>
      ) : null}

      {variant === "reading" && onAddPagePhoto ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add page photo (optional)"
          onPress={onAddPagePhoto}
          style={({ pressed }) => [
            styles.photoRow,
            pressed ? styles.pressed : null,
          ]}
        >
          <Camera
            size={16}
            color={DS_COLORS_V2.text.primary}
            strokeWidth={2}
          />
          <Text style={styles.photoRowText}>Add a page photo (optional)</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_SPACING_V2.md },
  label: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
  },
  bookCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 8,
  },
  bookInput: {
    fontSize: 14,
    color: DS_COLORS_V2.text.primary,
    paddingVertical: 6,
  },

  hero: {
    backgroundColor: DS_COLORS_V2.surface.heroDark,
    borderRadius: DS_RADIUS_V2.lg,
    padding: DS_SPACING_V2.md,
    gap: 14,
    alignItems: "center",
  },
  heroTopline: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.streak.securedYellow,
    alignSelf: "flex-start",
  },
  heroNumberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  heroNumber: {
    fontSize: 64,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryOnDark,
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
    lineHeight: 64,
  },
  heroDenom: {
    fontSize: 24,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDarkSecondary,
    paddingBottom: 6,
  },
  heroSub: {
    fontSize: 12,
    color: DS_COLORS_V2.text.onDarkSecondary,
  },

  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: DS_COLORS_V2.brand.primaryOnDark,
  },

  cupsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  cupSlot: {
    width: 28,
    height: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cupFilled: {
    backgroundColor: DS_COLORS_V2.brand.primaryOnDark,
  },
  cupEmpty: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_COLORS_V2.overlay.onDarkBorder25,
  },

  controlsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  minusBtn: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
  },
  pressed: { opacity: 0.85 },

  quickRow: { flexDirection: "row", gap: 8, alignSelf: "stretch" },
  quickChip: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },

  remindersCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  remindersText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },

  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  photoRowText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
});

