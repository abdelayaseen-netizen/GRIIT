/**
 * VerifyingProof — dark full-bleed verifying phase for task-states-v2.
 *
 * Rows take `{ label, verified }` from the server response (Step 11+).
 * A row animates in only when `verified` is true or false — never while pending.
 * Failed checks render as inline failure (not a fake green check).
 */
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { Check, X } from "lucide-react-native";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import {
  visibleVerifyingRows,
  type VerifyingProofRow,
} from "@/lib/verifying-proof";

export type { VerifyingProofRow } from "@/lib/verifying-proof";
export { visibleVerifyingRows } from "@/lib/verifying-proof";

export type VerifyingProofProps = {
  rows: VerifyingProofRow[];
  /** Overall submit/verify failure — shown inline under the rows. */
  error?: string | null;
  /** When true, spinner stays visible even if all rows resolved. */
  loading?: boolean;
};

function VerifyingRowItem({
  label,
  verified,
  index,
}: {
  label: string;
  verified: boolean;
  index: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        delay: index * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        delay: index * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, index]);

  const passed = verified === true;

  return (
    <Animated.View
      style={[styles.row, { opacity, transform: [{ translateY }] }]}
      accessibilityLabel={`${label}. ${passed ? "Passed" : "Failed"}`}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: passed
              ? DS_COLORS_V2.proof.gatePassBg
              : DS_COLORS_V2.proof.gateFailBg,
          },
        ]}
      >
        {passed ? (
          <Check
            size={14}
            color={DS_COLORS_V2.proof.inWindowOnDark}
            strokeWidth={2}
          />
        ) : (
          <X
            size={14}
            color={DS_COLORS_V2.semantic.danger}
            strokeWidth={2}
          />
        )}
      </View>
      <Text
        style={[
          styles.rowLabel,
          !passed ? styles.rowLabelFail : null,
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

export function VerifyingProof({
  rows,
  error,
  loading = true,
}: VerifyingProofProps) {
  const visible = visibleVerifyingRows(rows);
  const allResolved =
    rows.length > 0 && rows.every((r) => r.verified === true || r.verified === false);
  const showSpinner = loading || !allResolved;

  return (
    <View style={styles.root} accessibilityLabel="Checking your proof">
      <View style={styles.center}>
        {showSpinner ? (
          <ActivityIndicator
            size="large"
            color={DS_COLORS_V2.brand.primary}
            style={styles.spinner}
          />
        ) : null}
        <Text style={styles.heading}>Checking your proof</Text>

        {visible.length > 0 ? (
          <View style={styles.rows}>
            {visible.map((row, i) => (
              <VerifyingRowItem
                key={`${row.label}-${i}`}
                label={row.label}
                verified={row.verified === true}
                index={i}
              />
            ))}
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_COLORS_V2.surface.heroDark,
    paddingHorizontal: DS_SPACING_V2.lg,
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    gap: DS_SPACING_V2.md,
  },
  spinner: {
    marginBottom: DS_SPACING_V2.xs,
  },
  heading: {
    fontSize: 20,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
    textAlign: "center",
  },
  rows: {
    alignSelf: "stretch",
    marginTop: DS_SPACING_V2.sm,
    gap: DS_SPACING_V2.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.sm,
    paddingVertical: 4,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: DS_RADIUS_V2.full,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS_V2.text.onDark,
  },
  rowLabelFail: {
    color: DS_COLORS_V2.semantic.dangerOnDarkText,
  },
  errorBox: {
    alignSelf: "stretch",
    marginTop: DS_SPACING_V2.sm,
    padding: DS_SPACING_V2.md,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.proof.gateFailBg,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS_V2.semantic.danger,
    textAlign: "center",
  },
});
