/**
 * Check-in body — geofence map placeholder + location row + range pill.
 *
 * Parent owns the GPS state (current user location, distance from target).
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { Check, Clock, MapPin, X } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

export type TaskCheckinValue = {
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
  /** When > 0, renders the "Required stay" card. */
  requiredStayMinutes: number;
  hasGps: boolean;
};

export function TaskCheckinBody({
  value,
  locationName,
  locationAddress,
  distanceMeters,
  accuracyMeters,
  requiredStayMinutes,
  hasGps,
}: TaskCheckinBodyProps) {
  const distanceLabel =
    typeof distanceMeters === "number"
      ? `You're ${Math.round(distanceMeters)} m from saved location`
      : "Locating…";
  const accuracyLabel =
    typeof accuracyMeters === "number"
      ? ` · accuracy ±${Math.round(accuracyMeters)} m`
      : "";

  return (
    <View style={styles.wrap}>
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

      {requiredStayMinutes > 0 ? (
        <View style={styles.stayCard}>
          <Clock
            size={16}
            color={DS_COLORS_V2.text.primary}
            strokeWidth={2}
          />
          <View style={styles.stayBody}>
            <Text style={styles.stayTitle}>
              {`At least ${requiredStayMinutes} minutes`}
            </Text>
            <Text style={styles.stayMeta}>Starts on check-in</Text>
          </View>
          <MapPin size={14} color={DS_COLORS_V2.brand.primary} strokeWidth={2} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_SPACING_V2.md },
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.overlay.chipOnPhoto70,
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

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  locationInfo: { flex: 1, gap: 2 },
  locationName: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  locationAddress: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
  },
  rangePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.full,
    borderWidth: 1,
  },
  rangePillIn: {
    backgroundColor: DS_COLORS_V2.semantic.successSoft,
    borderColor: DS_COLORS_V2.semantic.success,
  },
  rangePillOut: {
    backgroundColor: DS_COLORS_V2.semantic.dangerSoft,
    borderColor: DS_COLORS_V2.semantic.danger,
  },
  rangePillText: {
    fontSize: 11,
    fontWeight: "500",
  },
  rangePillTextIn: { color: DS_COLORS_V2.semantic.success },
  rangePillTextOut: { color: DS_COLORS_V2.semantic.danger },

  metaLine: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    fontSize: 10,
    color: DS_COLORS_V2.text.secondary,
  },

  stayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  stayBody: { flex: 1, gap: 2 },
  stayTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  stayMeta: {
    fontSize: 11,
    color: DS_COLORS_V2.brand.primary,
  },
});

export default TaskCheckinBody;
