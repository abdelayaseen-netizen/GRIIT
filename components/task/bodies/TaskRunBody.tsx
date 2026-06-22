/**
 * Run body — distance + pace + time hero, with route map placeholder.
 *
 * The parent owns GPS state; this is a pure controlled body. Manual input
 * fallback is supported via `manualInput` props for non-GPS runs (legacy
 * non-hard-mode flow).
 */
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Pause, Play } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

type TaskRunValue = {
  /** kilometers travelled (live or manual). */
  distanceKm: number;
  /** elapsed seconds. */
  elapsedSeconds: number;
};

export type TaskRunBodyProps = {
  value: TaskRunValue;
  /** Goal in kilometers. */
  goalKm?: number;
  /** Goal in minutes (for time-based runs). */
  goalMinutes?: number;
  isRunning: boolean;
  hasGps: boolean;
  onTogglePlay?: () => void;
  /** Manual entry fallback when GPS isn't used. */
  manualInput?: {
    distance: string;
    onChangeDistance: (v: string) => void;
    duration: string;
    onChangeDuration: (v: string) => void;
  };
};

function formatHMS(secs: number): string {
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function formatPace(secs: number, km: number): string {
  if (km <= 0) return "—";
  const paceSec = secs / km;
  const m = Math.floor(paceSec / 60);
  const ss = Math.floor(paceSec % 60);
  return `${m}:${String(ss).padStart(2, "0")}`;
}

export function TaskRunBody({
  value,
  goalKm,
  goalMinutes,
  isRunning,
  hasGps,
  onTogglePlay,
  manualInput,
}: TaskRunBodyProps) {
  const target =
    typeof goalKm === "number" && goalKm > 0
      ? `Target: ${goalKm} km`
      : typeof goalMinutes === "number" && goalMinutes > 0
        ? `Target: ${goalMinutes} min`
        : "Open-ended";
  const progressFrac = goalKm && goalKm > 0 ? Math.min(1, value.distanceKm / goalKm) : 0;
  const remainingKm =
    goalKm && goalKm > 0 ? Math.max(0, goalKm - value.distanceKm) : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroTopLeft}>
            <Text style={styles.statusLabel}>
              {isRunning ? "IN PROGRESS" : "READY"}
            </Text>
            <Text style={styles.target}>{target}</Text>
          </View>
          {hasGps ? (
            <View style={styles.gpsPill}>
              <View style={styles.gpsDot} />
              <Text style={styles.gpsText}>GPS LIVE</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.heroCenter}>
          <Text style={styles.distanceText}>{value.distanceKm.toFixed(2)}</Text>
          <Text style={styles.distanceUnit}>kilometers</Text>
        </View>

        {goalKm && goalKm > 0 ? (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progressFrac * 100)}%` },
              ]}
            />
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>
              {formatHMS(value.elapsedSeconds)}
            </Text>
            <Text style={styles.statLabel}>TIME</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>
              {formatPace(value.elapsedSeconds, value.distanceKm)}
            </Text>
            <Text style={styles.statLabel}>PACE / KM</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>
              {goalKm && goalKm > 0
                ? `${remainingKm.toFixed(2)} km`
                : formatHMS(value.elapsedSeconds)}
            </Text>
            <Text style={styles.statLabel}>
              {goalKm && goalKm > 0 ? "REMAINING" : "ELAPSED"}
            </Text>
          </View>
        </View>

        {onTogglePlay ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRunning ? "Pause run" : "Start run"}
            onPress={onTogglePlay}
            style={({ pressed }) => [
              styles.pauseBtn,
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
            <Text style={styles.pauseBtnText}>
              {isRunning ? "Pause" : "Resume"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {hasGps ? (
        <View style={styles.mapCard}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
          >
            <Path
              d="M 14 84 C 50 60, 70 30, 110 36 C 150 42, 170 70, 190 28"
              stroke={DS_COLORS_V2.brand.primary}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx={14} cy={84} r={5} fill={DS_COLORS_V2.semantic.success} />
            <Circle cx={190} cy={28} r={5} fill={DS_COLORS_V2.brand.primary} />
          </Svg>
        </View>
      ) : null}

      {manualInput ? (
        <View style={styles.manualCard}>
          <Text style={styles.manualLabel}>MANUAL ENTRY</Text>
          <View style={styles.manualRow}>
            <View style={styles.manualField}>
              <Text style={styles.manualFieldLabel}>Distance (km)</Text>
              <TextInput
                accessibilityLabel="Distance in kilometers"
                value={manualInput.distance}
                onChangeText={manualInput.onChangeDistance}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor={DS_COLORS_V2.text.tertiary}
                style={styles.manualInput}
              />
            </View>
            <View style={styles.manualField}>
              <Text style={styles.manualFieldLabel}>Time (min)</Text>
              <TextInput
                accessibilityLabel="Duration in minutes"
                value={manualInput.duration}
                onChangeText={manualInput.onChangeDuration}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={DS_COLORS_V2.text.tertiary}
                style={styles.manualInput}
              />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_SPACING_V2.md },

  hero: {
    backgroundColor: DS_COLORS_V2.surface.heroDark,
    borderRadius: DS_RADIUS_V2.lg,
    padding: DS_SPACING_V2.md,
    gap: DS_SPACING_V2.md,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTopLeft: { gap: 2 },
  statusLabel: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.streak.securedYellow,
  },
  target: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.streak.securedYellow,
  },
  gpsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS_V2.semantic.danger,
  },
  gpsText: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.onDark,
  },

  heroCenter: { alignItems: "center", gap: 4, paddingVertical: 4 },
  distanceText: {
    fontSize: 64,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
    lineHeight: 64,
  },
  distanceUnit: {
    fontSize: 12,
    color: DS_COLORS_V2.text.onDarkSecondary,
  },

  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: DS_COLORS_V2.brand.primary,
  },

  statsRow: { flexDirection: "row", gap: 8 },
  statCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface05,
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.onDarkSecondary,
  },

  pauseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  pauseBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  pressed: { opacity: 0.85 },

  mapCard: {
    width: "100%",
    aspectRatio: 2,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },

  manualCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 10,
  },
  manualLabel: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
  },
  manualRow: { flexDirection: "row", gap: 10 },
  manualField: { flex: 1, gap: 4 },
  manualFieldLabel: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
  },
  manualInput: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
  },
});

