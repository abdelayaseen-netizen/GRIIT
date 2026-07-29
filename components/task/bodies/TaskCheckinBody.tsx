/**
 * Check-in Confirm — geofence map + range status. No dwell / stay UI (standing cut).
 * Parent owns GPS state (user location, distance, permission).
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { Check, MapPin, X } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

export const CHECKIN_PERMISSION_HELPER =
  "Location access is needed to confirm you're at the saved spot." as const;

type TaskCheckinValue = {
  /** True when user is within the geofence radius. */
  inRange: boolean;
};

export type TaskCheckinBodyProps = {
  value: TaskCheckinValue;
  locationName: string;
  locationAddress?: string;
  /** Distance from saved location in meters. */
  distanceMeters?: number;
  /** Reported GPS accuracy in meters. */
  accuracyMeters?: number;
  hasGps: boolean;
  /** Permission denied — quiet helper, no Alert. */
  permissionDenied?: boolean;
};

export function TaskCheckinBody({
  value,
  locationName,
  locationAddress,
  distanceMeters,
  accuracyMeters,
  hasGps,
  permissionDenied = false,
}: TaskCheckinBodyProps) {
  const distanceLabel =
    typeof distanceMeters === "number"
      ? `${Math.round(distanceMeters)} m from your saved location`
      : permissionDenied
        ? "Waiting for location access"
        : "Locating…";
  const accuracyLabel =
    typeof accuracyMeters === "number"
      ? ` · accuracy ±${Math.round(accuracyMeters)} m`
      : "";

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Checking range</Text>

      <View style={styles.mapCard}>
        <View style={styles.mapInner}>
          <Svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="mapBg" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={DS_COLORS_V2.semantic.successSoft} />
                <Stop offset="100%" stopColor={DS_COLORS_V2.surface.card} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={200} height={100} fill="url(#mapBg)" />
            <Path
              d="M 0 60 L 200 55"
              stroke={DS_COLORS_V2.surface.divider}
              strokeWidth={1}
            />
            <Path
              d="M 60 0 L 60 100"
              stroke={DS_COLORS_V2.surface.divider}
              strokeWidth={1}
            />
            <Circle
              cx={100}
              cy={48}
              r={38}
              stroke={DS_COLORS_V2.brand.primary}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              fill={DS_COLORS_V2.brand.primarySoft}
              fillOpacity={0.5}
            />
            <Circle cx={100} cy={48} r={4} fill={DS_COLORS_V2.brand.primary} />
          </Svg>
          {hasGps ? (
            <View style={styles.gpsPill}>
              <View style={styles.gpsDot} />
              <Text style={styles.gpsText}>GPS LIVE</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.locationRow}>
          <View style={styles.pinWrap}>
            <MapPin size={16} color={DS_COLORS_V2.brand.primary} strokeWidth={2} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName} numberOfLines={1}>
              {locationName}
            </Text>
            {locationAddress ? (
              <Text style={styles.locationAddress} numberOfLines={1}>
                {locationAddress}
              </Text>
            ) : null}
          </View>
          <View
            style={[
              styles.rangePill,
              value.inRange ? styles.rangePillIn : styles.rangePillOut,
            ]}
          >
            {value.inRange ? (
              <Check
                size={12}
                color={DS_COLORS_V2.semantic.success}
                strokeWidth={2.5}
              />
            ) : (
              <X
                size={12}
                color={DS_COLORS_V2.semantic.danger}
                strokeWidth={2.5}
              />
            )}
            <Text
              style={[
                styles.rangePillText,
                value.inRange
                  ? styles.rangePillTextIn
                  : styles.rangePillTextOut,
              ]}
            >
              {value.inRange ? "In range" : "Out of range"}
            </Text>
          </View>
        </View>

        <Text style={styles.metaLine}>
          {`${distanceLabel}${accuracyLabel}`}
        </Text>
      </View>

      {permissionDenied ? (
        <Text style={styles.permissionHelper}>{CHECKIN_PERMISSION_HELPER}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_SPACING_V2.md },
  heading: {
    fontSize: 22,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.3,
  },
  mapCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  mapInner: {
    width: "100%",
    aspectRatio: 2 / 1.4,
    maxHeight: 240,
  },
  gpsPill: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: DS_COLORS_V2.surface.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.full,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS_V2.semantic.success,
  },
  gpsText: {
    fontSize: 10,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
    letterSpacing: 0.4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.sm,
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.md,
  },
  pinWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
  },
  locationInfo: { flex: 1, minWidth: 0 },
  locationName: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  locationAddress: {
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    marginTop: 2,
  },
  rangePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.full,
  },
  rangePillIn: {
    backgroundColor: DS_COLORS_V2.semantic.successSoft,
  },
  rangePillOut: {
    backgroundColor: DS_COLORS_V2.semantic.dangerSoft,
  },
  rangePillText: {
    fontSize: 12,
    fontWeight: "500",
  },
  rangePillTextIn: { color: DS_COLORS_V2.semantic.success },
  rangePillTextOut: { color: DS_COLORS_V2.semantic.danger },
  metaLine: {
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    paddingHorizontal: DS_SPACING_V2.md,
    paddingBottom: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.sm,
  },
  permissionHelper: {
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    lineHeight: 18,
  },
});
