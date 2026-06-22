/**
 * Timer body — countdown / count-up dial with pause + sound chips.
 *
 * The parent owns timer state via `useTaskTimer`. We just receive the display
 * values + the toggle/reset handlers and render the ring.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Pause, Play, RotateCcw } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

export type TimerSound = "silent" | "chime" | "rain";

type TaskTimerValue = { sound: TimerSound };

export type TaskTimerBodyProps = {
  value: TaskTimerValue;
  onChangeSound: (next: TimerSound) => void;
  /** Display string e.g. "03:24". */
  timerDisplay: string;
  /** 0..1 progress of the countdown / countup. */
  progressFrac: number;
  /** "of 5:00" style total label. */
  totalLabel: string;
  isRunning: boolean;
  isComplete: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
};

const RING_SIZE = 220;
const RING_STROKE = 6;
const RING_RADIUS = RING_SIZE / 2 - RING_STROKE * 2;
const RING_C = 2 * Math.PI * RING_RADIUS;

const SOUND_OPTIONS: readonly { id: TimerSound; label: string }[] = [
  { id: "silent", label: "Silent" },
  { id: "chime", label: "Chime" },
  { id: "rain", label: "Rain" },
] as const;

export function TaskTimerBody({
  value,
  onChangeSound,
  timerDisplay,
  progressFrac,
  totalLabel,
  isRunning,
  isComplete,
  onTogglePlay,
  onReset,
}: TaskTimerBodyProps) {
  const dashOffset = RING_C * (1 - Math.max(0, Math.min(1, progressFrac)));
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={DS_COLORS_V2.surface.dividerDark}
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={DS_COLORS_V2.brand.primary}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${RING_C} ${RING_C}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.ringInner} pointerEvents="none">
            <Text style={styles.statusLabel}>
              {isComplete ? "DONE" : isRunning ? "IN PROGRESS" : "PAUSED"}
            </Text>
            <Text style={styles.timerText}>{timerDisplay}</Text>
            <Text style={styles.totalText}>{totalLabel}</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRunning ? "Pause timer" : "Start timer"}
            onPress={onTogglePlay}
            style={({ pressed }) => [
              styles.playBtn,
              pressed ? styles.pressed : null,
            ]}
          >
            {isRunning ? (
              <Pause
                size={16}
                color={DS_COLORS_V2.text.onDark}
                strokeWidth={2}
              />
            ) : (
              <Play
                size={16}
                color={DS_COLORS_V2.text.onDark}
                strokeWidth={2}
              />
            )}
            <Text style={styles.playBtnText}>{isRunning ? "Pause" : "Resume"}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
            onPress={onReset}
            style={({ pressed }) => [
              styles.refreshBtn,
              pressed ? styles.pressed : null,
            ]}
          >
            <RotateCcw
              size={16}
              color={DS_COLORS_V2.text.onDark}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.soundCard}>
        <Text style={styles.soundLabel}>SOUND</Text>
        <View style={styles.soundRow}>
          {SOUND_OPTIONS.map((opt) => {
            const selected = value.sound === opt.id;
            return (
              <Pressable
                key={opt.id}
                accessibilityRole="button"
                accessibilityLabel={`${opt.label} sound`}
                accessibilityState={{ selected }}
                onPress={() => onChangeSound(opt.id)}
                style={[
                  styles.soundChip,
                  selected ? styles.soundChipSelected : null,
                ]}
              >
                <Text
                  style={[
                    styles.soundChipText,
                    selected ? styles.soundChipTextSelected : null,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_SPACING_V2.md },

  hero: {
    backgroundColor: DS_COLORS_V2.surface.heroDark,
    borderRadius: DS_RADIUS_V2.lg,
    padding: DS_SPACING_V2.md,
    alignItems: "center",
    gap: DS_SPACING_V2.md,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.streak.securedYellow,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  totalText: {
    fontSize: 11,
    color: DS_COLORS_V2.text.onDarkSecondary,
  },

  controlsRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    gap: DS_SPACING_V2.sm,
  },
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  playBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  refreshBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  pressed: { opacity: 0.85 },

  soundCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 10,
  },
  soundLabel: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
  },
  soundRow: { flexDirection: "row", gap: 8 },
  soundChip: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  soundChipSelected: {
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  soundChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  soundChipTextSelected: { color: DS_COLORS_V2.brand.primary },
});

