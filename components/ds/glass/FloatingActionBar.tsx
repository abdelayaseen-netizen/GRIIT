/**
 * Build 92 01.1 · port of design/handoff/b92/part0-liquid-glass/src/ds/glass/FloatingActionBar.tsx.
 * Chrome glass (or the fallback) holding a solid #BB471D primary and an optional glass
 * secondary. Lists under the bar get ACTION_BAR_CONTENT_INSET of bottom padding.
 * Loading: the bar stays; only the primary shows a spinner and "Posting".
 */
import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/ds/Button";
import { DS_V3 } from "@/lib/design-system";
import { GLASS_RADIUS, glassInset } from "@/lib/glass";
import { GlassSurface } from "./GlassSurface";

export type FloatingActionBarProps = {
  primary: string;
  onPrimary: () => void;
  secondary?: string;
  onSecondary?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Label while loading. Copy table: "Posting". */
  loadingLabel?: string;
  testID?: string;
};

export function FloatingActionBar({
  primary,
  onPrimary,
  secondary,
  onSecondary,
  disabled,
  loading,
  loadingLabel = "Posting",
  testID,
}: FloatingActionBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const inset = glassInset(width);
  return (
    <GlassSurface
      kind="chrome"
      testID={testID}
      style={[styles.bar, { left: inset, right: inset, bottom: Math.max(insets.bottom - 10, DS_V3.space.sm) }]}
    >
      {secondary ? (
        <View style={styles.flex}>
          <Button variant="glass" label={secondary} onPress={onSecondary} fill />
        </View>
      ) : null}
      <View style={styles.flex}>
        <Button
          variant="primary"
          label={loading ? loadingLabel : primary}
          accessibilityLabel={primary}
          onPress={onPrimary}
          disabled={disabled}
          loading={loading}
          fill
        />
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    flexDirection: "row",
    gap: DS_V3.space.sm,
    padding: 7,
    borderRadius: GLASS_RADIUS.actionBar,
    overflow: "hidden",
  },
  flex: { flex: 1, minHeight: 50, justifyContent: "center" },
});

export default FloatingActionBar;
