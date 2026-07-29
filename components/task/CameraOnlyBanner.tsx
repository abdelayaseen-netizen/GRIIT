/**
 * CameraOnlyBanner + InWindowStatusPill — Capture-phase chrome for task-states-v2.
 *
 * Banner: lock icon + verbatim camera/reading copy.
 * Pill: green/red dot + "{HH:MM} · in window" / "out of window" from
 * `evaluateScheduleWindow` (same evaluation as GatesCard).
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Lock } from "lucide-react-native";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import {
  evaluateScheduleWindow,
  formatPillClock,
} from "@/lib/schedule-window";

export { formatPillClock } from "@/lib/schedule-window";

export type CameraOnlyBannerVariant = "camera" | "reading";

export type CameraOnlyBannerProps = {
  /** `camera` → "Camera only · no library"; `reading` → "Reading only · page photo". */
  variant?: CameraOnlyBannerVariant;
};

const BANNER_COPY: Record<CameraOnlyBannerVariant, string> = {
  camera: "Camera only · no library",
  reading: "Reading only · page photo",
};

export function CameraOnlyBanner({ variant = "camera" }: CameraOnlyBannerProps) {
  return (
    <View style={styles.banner} accessibilityRole="text">
      <Lock size={14} color={DS_COLORS_V2.text.onDark} strokeWidth={2} />
      <Text style={styles.bannerText}>{BANNER_COPY[variant]}</Text>
    </View>
  );
}

export type InWindowStatusPillProps = {
  scheduleWindowStart?: string | null;
  scheduleWindowEnd?: string | null;
  scheduleTimezone?: string | null;
  /** Injectable clock for tests / capture timestamp display. */
  now?: Date;
};

export function InWindowStatusPill({
  scheduleWindowStart,
  scheduleWindowEnd,
  scheduleTimezone,
  now: nowProp,
}: InWindowStatusPillProps) {
  const [tickNow, setTickNow] = useState(() => nowProp ?? new Date());

  useEffect(() => {
    if (nowProp) {
      setTickNow(nowProp);
      return;
    }
    const id = setInterval(() => setTickNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, [nowProp]);

  const evaluation = evaluateScheduleWindow({
    start: scheduleWindowStart,
    end: scheduleWindowEnd,
    timeZone: scheduleTimezone,
    now: tickNow,
  });

  // No window configured — still show clock, omit window qualifier.
  if (evaluation.status === "none") {
    const clock = formatPillClock(tickNow, scheduleTimezone);
    return (
      <View style={styles.pill} accessibilityLabel={`${clock}`}>
        <Text style={styles.pillText}>{clock}</Text>
      </View>
    );
  }

  const inWindow = evaluation.status === "in_window";
  const clock = formatPillClock(tickNow, scheduleTimezone);
  const qualifier = inWindow ? "in window" : "out of window";
  const label = `${clock} · ${qualifier}`;

  return (
    <View style={styles.pill} accessibilityLabel={label}>
      <View
        style={[
          styles.pillDot,
          {
            backgroundColor: inWindow
              ? DS_COLORS_V2.proof.inWindowOnDark
              : DS_COLORS_V2.semantic.dangerOnDark,
          },
        ]}
      />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    paddingHorizontal: DS_SPACING_V2.md,
    paddingVertical: DS_SPACING_V2.xs,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: DS_SPACING_V2.sm,
    paddingVertical: 6,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.overlay.chipOnPhoto55,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
});
