/**
 * ContactSheet — 01_components.md Contact sheet and 03_media.md:60–65.
 * Rows reveal over motion.sheet. Reduce Motion shows every row at once.
 */
import React, { useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import ProofImage from "@/components/ds/ProofImage";

export type ContactSheetProof = {
  uri?: string | null;
  source?: number;
  selfReported?: boolean;
};

export type ContactSheetProps = {
  proofs: ContactSheetProof[];
  target?: number;
  onRevealed?: () => void;
  static?: boolean;
};

const ROW_MS = DS_V3.motion.sheet / DS_V3.contactSheet.rows;

export default function ContactSheet({ proofs, target, onRevealed, static: staticGrid }: ContactSheetProps) {
  const count = target ?? proofs.length;
  const cols =
    count > 0 && count <= DS_V3.contactSheet.cols + 1 && count !== DS_V3.contactSheet.cols
      ? count
      : DS_V3.contactSheet.cols;
  const cells = useMemo(() => {
    const n = Math.max(count, proofs.length);
    return Array.from({ length: n }, (_, i) => proofs[i] ?? { uri: null });
  }, [count, proofs]);
  const rows = Math.ceil(cells.length / cols) || 0;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce || staticGrid || rows === 0) {
        setShown(rows);
        onRevealed?.();
        return;
      }
      setShown(0);
      let row = 0;
      const tick = () => {
        if (cancelled) return;
        row += 1;
        setShown(row);
        if (row >= rows) {
          onRevealed?.();
          return;
        }
        setTimeout(tick, ROW_MS);
      };
      setTimeout(tick, ROW_MS);
    });
    return () => {
      cancelled = true;
    };
  }, [rows, onRevealed, staticGrid]);

  return (
    <View style={styles.grid} accessibilityLabel="Proofs">
      {Array.from({ length: rows }, (_, r) => (
        <View
          key={r}
          style={[styles.row, { opacity: r < shown ? 1 : 0 }]}
        >
          {Array.from({ length: cols }, (_, c) => {
            const cell = cells[r * cols + c];
            if (!cell) return <View key={c} style={styles.slot} />;
            const missing = !cell.uri && cell.source == null;
            return (
              <View
                key={c}
                style={[
                  styles.slot,
                  missing ? styles.missing : null,
                  cell.selfReported ? styles.dim : null,
                ]}
              >
                {missing ? null : (
                  <ProofImage uri={cell.uri} source={cell.source} size="thumb" />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: DS_V3.contactSheet.gap,
    paddingHorizontal: DS_V3.space.gutter,
  },
  row: {
    flexDirection: "row",
    gap: DS_V3.contactSheet.gap,
  },
  slot: {
    flex: 1,
    aspectRatio: 4 / 5,
    borderRadius: DS_V3.radius.thumb,
    overflow: "hidden",
  },
  missing: {
    backgroundColor: DS_V3.color.surface,
  },
  dim: {
    opacity: DS_V3.contactSheet.dimmed,
  },
});
