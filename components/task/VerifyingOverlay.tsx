/**
 * VerifyingOverlay — full-screen overlay shown while the submit mutation is in-flight.
 *
 * Rules (inviolable):
 *  - Rows are populated ONLY from gates actually evaluated client-side.
 *  - Minimum display time: 600 ms (enforced by parent via verifyStartMsRef).
 *  - Never shown for a fake/stub success.
 *
 * Design: dark semi-opaque backdrop, centred card with spinner + gate rows.
 */
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native";
import { DS_COLORS_V2, DS_RADIUS_V2, DS_SPACING_V2 } from "@/lib/design-system";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type VerifyingRow = {
  /** Short label e.g. "Within time window" */
  label: string;
  /** Contextual detail e.g. "07:42" or "not from library" */
  detail?: string;
};

type VerifyingOverlayProps = {
  visible: boolean;
  rows: VerifyingRow[];
  /** Final success line shown under the rows e.g. "Photo proof submitted". */
  typeSuccessLine: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export function VerifyingOverlay({
  visible,
  rows,
  typeSuccessLine,
}: VerifyingOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator
            size="large"
            color={DS_COLORS_V2.brand.primary}
            style={styles.spinner}
          />
          <Text style={styles.heading}>Verifying your proof…</Text>

          {rows.length > 0 ? (
            <View style={styles.rows}>
              {rows.map((row, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.rowDot}>·</Text>
                  <Text style={styles.rowText}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    {row.detail ? (
                      <Text style={styles.rowDetail}> · {row.detail}</Text>
                    ) : null}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {typeSuccessLine ? (
            <Text style={styles.successLine}>{typeSuccessLine}</Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers — build row list from gate flags (honest-cut rule: only evaluated gates)
// ──────────────────────────────────────────────────────────────────────────────
export function buildVerifyingRows(opts: {
  hasTimeWindow: boolean;
  submitTimeLabel: string;
  hasCameraOnly: boolean;
  hasLocation: boolean;
}): VerifyingRow[] {
  const rows: VerifyingRow[] = [];
  if (opts.hasTimeWindow) {
    rows.push({ label: "Within time window", detail: opts.submitTimeLabel });
  }
  if (opts.hasCameraOnly) {
    rows.push({ label: "Live camera", detail: "not from library" });
  }
  if (opts.hasLocation) {
    rows.push({ label: "On location" });
  }
  return rows;
}

// ──────────────────────────────────────────────────────────────────────────────
// Per-type success line
// ──────────────────────────────────────────────────────────────────────────────
export function getTypeSuccessLine(taskTypeRaw: string): string {
  switch (taskTypeRaw) {
    case "photo":
      return "Photo proof submitted";
    case "timer":
      return "Session time recorded";
    case "run":
      return "Run entry submitted";
    case "workout":
      return "Workout logged";
    case "journal":
      return "Journal entry saved";
    case "counter":
      return "Daily target recorded";
    case "water":
      return "Daily water logged";
    case "reading":
      return "Reading pages logged";
    case "checkin":
      return "Location confirmed";
    default:
      return "Task completed";
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: DS_SPACING_V2.lg,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.xl,
    padding: DS_SPACING_V2.lg,
    alignItems: "center",
    gap: DS_SPACING_V2.sm,
  },
  spinner: {
    marginBottom: DS_SPACING_V2.xs,
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  rows: {
    width: "100%",
    gap: 4,
    marginTop: DS_SPACING_V2.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  rowDot: {
    fontSize: 13,
    color: DS_COLORS_V2.text.secondary,
    lineHeight: 20,
  },
  rowText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  rowLabel: {
    color: DS_COLORS_V2.text.primary,
    fontWeight: "500",
  },
  rowDetail: {
    color: DS_COLORS_V2.text.secondary,
  },
  successLine: {
    fontSize: 12,
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
    marginTop: DS_SPACING_V2.xs,
  },
});
