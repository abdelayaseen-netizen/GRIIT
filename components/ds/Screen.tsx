import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import { screenPadding, type ScreenEdge } from "@/lib/safe-area";

const ALL_EDGES: ScreenEdge[] = ["top", "bottom", "left", "right"];

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: readonly ScreenEdge[];
};

/** Shared screen wrapper. Nothing tappable sits inside the top 59 or bottom 34. */
export default function Screen({ children, style, edges = ALL_EDGES }: Props) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.root, screenPadding(insets, edges), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_V3.color.canvas },
});
