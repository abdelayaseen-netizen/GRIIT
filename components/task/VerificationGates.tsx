import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
import type { TaskHardVerificationConfig } from "@/lib/task-hard-verification";

export type GateStatusKind = "locked" | "checking" | "passed" | "failed" | "pending";

export interface GateStatus {
  status: GateStatusKind;
  detail?: string;
}

interface Props {
  config: TaskHardVerificationConfig;
  /** When require_camera_only, parent sets true after a proof URL exists */
  photoSatisfied?: boolean;
  /** Strava is informational for now — does not block completion */
  onGatesResolved: (allPassed: boolean, locationData?: { lat: number; lng: number }) => void;
  onTimeWindowFailed?: () => void;
}

export function VerificationGates({ config, photoSatisfied = false, onGatesResolved, onTimeWindowFailed }: Props) {
  const [timeGate, setTimeGate] = useState<GateStatus>({ status: "checking" });
  const [locationGate, setLocationGate] = useState<GateStatus>({ status: "checking" });
  const [verifiedCoords, setVerifiedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const notifiedTimeFail = useRef(false);
  const onResolvedRef = useRef(onGatesResolved);
  const onTimeFailRef = useRef(onTimeWindowFailed);
  onResolvedRef.current = onGatesResolved;
  onTimeFailRef.current = onTimeWindowFailed;

  const hasSchedule =
    Boolean(config.schedule_window_start?.trim()) && Boolean(config.schedule_window_end?.trim());
  const hasLocationGate =
    config.require_location === true &&
    typeof config.location_latitude === "number" &&
    typeof config.location_longitude === "number";

  const photoGate: GateStatus = config.require_camera_only
    ? photoSatisfied
      ? { status: "passed", detail: "Proof ready" }
      : { status: "pending", detail: "Take photo to pass" }
    : { status: "passed" };

  const stravaGate: GateStatus = config.require_strava
    ? { status: "pending", detail: "Link Strava in Settings (coming soon)" }
    : { status: "passed" };

  useEffect(() => {
    if (!config.hard_mode || !hasSchedule) {
      setTimeGate({ status: "passed" });
      return;
    }

    const checkTime = () => {
      const tz = config.schedule_timezone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: tz,
      });
      const parts = formatter.formatToParts(now);
      const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
      const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
      const current = h * 60 + m;

      const startParts = (config.schedule_window_start ?? "").split(":").map(Number);
      const endParts = (config.schedule_window_end ?? "").split(":").map(Number);
      const sH = startParts[0] ?? 0;
      const sM = startParts[1] ?? 0;
      const eH = endParts[0] ?? 0;
      const eM = endParts[1] ?? 0;
      const start = sH * 60 + sM;
      const end = eH * 60 + eM;

      let isIn: boolean;
      if (start <= end) {
        isIn = current >= start && current <= end;
      } else {
        isIn = current >= start || current <= end;
      }

      const formatT = (hr: number, mn: number) => {
        const p = hr >= 12 ? "PM" : "AM";
        const dh = hr % 12 || 12;
        return `${dh}:${String(mn).padStart(2, "0")} ${p}`;
      };

      if (isIn) {
        notifiedTimeFail.current = false;
        setTimeGate({ status: "passed", detail: `Now ${formatT(h, m)}` });
      } else if (current < start) {
        notifiedTimeFail.current = false;
        const diff = start - current;
        const diffH = Math.floor(diff / 60);
        const diffM = diff % 60;
        setTimeGate({
          status: "locked",
          detail: diffH > 0 ? `Opens in ${diffH}h ${diffM}m` : `Opens in ${diffM}m`,
        });
      } else {
        setTimeGate({ status: "failed", detail: `Window closed at ${formatT(eH, eM)}` });
        if (!notifiedTimeFail.current) {
          notifiedTimeFail.current = true;
          onTimeFailRef.current?.();
        }
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [config, hasSchedule]);

  useEffect(() => {
    if (!config.hard_mode || !hasLocationGate) {
      setLocationGate({ status: "passed" });
      return;
    }

    let cancelled = false;
    (async () => {
      setLocationGate({ status: "checking" });
      setVerifiedCoords(null);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== "granted") {
          setLocationGate({ status: "failed", detail: "Location permission denied" });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (cancelled) return;
        const latT = config.location_latitude as number;
        const lonT = config.location_longitude as number;
        const R = 6371000;
        const toRad = (d: number) => (d * Math.PI) / 180;
        const dLat = toRad(loc.coords.latitude - latT);
        const dLon = toRad(loc.coords.longitude - lonT);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(latT)) * Math.cos(toRad(loc.coords.latitude)) * Math.sin(dLon / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const maxR = config.location_radius_meters ?? 200;

        if (dist <= maxR) {
          setVerifiedCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          setLocationGate({ status: "passed", detail: config.location_name || "At location" });
        } else {
          setVerifiedCoords(null);
          setLocationGate({
            status: "failed",
            detail: `${Math.round(dist)}m from ${config.location_name || "target"}`,
          });
        }
      } catch {
        if (!cancelled) {
          setVerifiedCoords(null);
          setLocationGate({ status: "failed", detail: "Could not get location" });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [config, hasLocationGate]);

  const computeAndReport = useCallback(() => {
    if (!config.hard_mode) {
      onResolvedRef.current(true, undefined);
      return;
    }

    const timeOk = !hasSchedule || timeGate.status === "passed";
    const timeBlocks =
      hasSchedule &&
      (timeGate.status === "locked" || timeGate.status === "failed" || timeGate.status === "checking");
    const locOk = !hasLocationGate || locationGate.status === "passed";
    const locBlocks =
      hasLocationGate &&
      (locationGate.status === "checking" || locationGate.status === "failed" || locationGate.status === "locked");
    const photoOk = !config.require_camera_only || photoSatisfied;

    const allPassed = timeOk && locOk && photoOk && !timeBlocks && !locBlocks;

    const locOut =
      hasLocationGate && locationGate.status === "passed" && verifiedCoords ? verifiedCoords : undefined;

    onResolvedRef.current(allPassed, locOut);
  }, [
    config.hard_mode,
    config.require_camera_only,
    hasSchedule,
    hasLocationGate,
    timeGate.status,
    locationGate.status,
    photoSatisfied,
    verifiedCoords,
  ]);

  useEffect(() => {
    computeAndReport();
  }, [computeAndReport]);

  if (!config.hard_mode) return null;

  const gates: {
    name: string;
    sub: string;
    gate: GateStatus;
  }[] = [];

  if (hasSchedule) {
    gates.push({
      name: "Time window",
      sub: `${config.schedule_window_start} — ${config.schedule_window_end}`,
      gate: timeGate,
    });
  }
  if (hasLocationGate) {
    gates.push({
      name: config.location_name || "Location",
      sub: "GPS verification",
      gate: locationGate,
    });
  }
  if (config.require_camera_only) {
    gates.push({ name: "Photo proof", sub: "Camera only", gate: photoGate });
  }
  if (config.require_strava) {
    gates.push({ name: "Strava activity", sub: "Auto-verify via Strava", gate: stravaGate });
  }

  if (gates.length === 0) {
    return (
      <View style={s.container} accessibilityLabel="Hard mode verification">
        <View style={s.header}>
          <Text style={s.title}>Verification gates</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>Hard</Text>
          </View>
        </View>
        <Text style={s.gateSub}>No extra gates on this task.</Text>
      </View>
    );
  }

  const statusColor = (st: GateStatusKind) => {
    switch (st) {
      case "passed":
        return { bg: DS_COLORS.GREEN_BG, text: DS_COLORS.GREEN };
      case "failed":
        return { bg: DS_COLORS.BADGE_HARD_BG, text: DS_COLORS.BADGE_HARD_RED };
      case "locked":
        return { bg: DS_COLORS.GRAY_CARD_BG, text: DS_COLORS.TEXT_SECONDARY };
      case "checking":
        return { bg: DS_COLORS.amberLightBg, text: DS_COLORS.amberDarkText };
      case "pending":
        return { bg: DS_COLORS.amberLightBg, text: DS_COLORS.amberDarkText };
      default:
        return { bg: DS_COLORS.GRAY_CARD_BG, text: DS_COLORS.TEXT_SECONDARY };
    }
  };

  const statusLabel = (st: GateStatusKind) => {
    switch (st) {
      case "passed":
        return "Passed";
      case "failed":
        return "Failed";
      case "locked":
        return "Locked";
      case "checking":
        return "Checking";
      case "pending":
        return "Needed";
      default:
        return "";
    }
  };

  return (
    <View style={s.container} accessibilityLabel="Hard mode verification gates">
      <View style={s.header}>
        <Text style={s.title}>Verification gates</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>Hard</Text>
        </View>
      </View>
      {gates.map((g, i) => {
        const colors = statusColor(g.gate.status);
        const pillText =
          g.gate.detail && g.gate.status !== "passed" ? g.gate.detail : statusLabel(g.gate.status);
        return (
          <View
            key={`${g.name}-${i}`}
            style={[s.gateRow, i < gates.length - 1 ? s.gateRowBorder : undefined]}
            accessibilityLabel={`${g.name}: ${pillText}`}
          >
            <View style={[s.gateIcon, { backgroundColor: colors.bg }]}>
              {g.gate.status === "checking" ? (
                <ActivityIndicator size="small" color={colors.text} accessibilityLabel="Checking" />
              ) : (
                <Text style={[s.gateIconText, { color: colors.text }]}>
                  {g.gate.status === "passed" ? "✓" : g.gate.status === "failed" ? "✕" : "•"}
                </Text>
              )}
            </View>
            <View style={s.gateTextCol}>
              <Text style={s.gateName}>{g.name}</Text>
              <Text style={s.gateSub}>{g.gate.detail && g.gate.status !== "passed" ? g.gate.detail : g.sub}</Text>
            </View>
            <View style={[s.statusPill, { backgroundColor: colors.bg }]}>
              <Text style={[s.statusText, { color: colors.text }]} numberOfLines={2}>
                {pillText}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: DS_COLORS.CARD_BG,
    borderRadius: DS_RADIUS.LG,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS.PROFILE_TEXT_PRIMARY,
  },
  badge: {
    backgroundColor: DS_COLORS.PROFILE_STAT_CORAL_BG,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: DS_RADIUS.MD,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS.PROFILE_TIER_STARTER_TEXT,
  },
  gateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  gateRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: DS_COLORS.PROFILE_BORDER_ALT,
  },
  gateIcon: {
    width: 32,
    height: 32,
    borderRadius: DS_RADIUS.MD,
    alignItems: "center",
    justifyContent: "center",
  },
  gateIconText: {
    fontSize: 14,
    fontWeight: "500",
  },
  gateTextCol: { flex: 1 },
  gateName: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS.PROFILE_TEXT_PRIMARY,
  },
  gateSub: {
    fontSize: 11,
    fontWeight: "400",
    color: DS_COLORS.PROFILE_TEXT_SECONDARY,
    marginTop: 1,
  },
  statusPill: {
    maxWidth: "38%",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: DS_RADIUS.MD,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "right",
  },
});
