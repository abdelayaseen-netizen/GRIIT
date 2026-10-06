/**
 * Blocking update. Shown only when the installed build is below min_supported_build.
 */
import React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { Flame } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";

const APP_STORE = "itms-apps://apps.apple.com/app/id6761116285";

export default function ForceUpdate() {
  return (
    <View style={styles.root}>
      <Flame size={44} color={DS_V3.color.brand} fill={DS_V3.color.brand} />
      <Text style={styles.title}>Update GRIIT to keep going</Text>
      <Text style={styles.body}>
        This version can’t save proofs anymore. Your streak is safe; it’s waiting in the new version.
      </Text>
      <View style={styles.footer}>
        <Button label="Open the App Store" onPress={() => void Linking.openURL(APP_STORE)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  title: {
    ...DS_V3.type.title,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  body: {
    ...DS_V3.type.body,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: DS_V3.space.gutter,
    right: DS_V3.space.gutter,
    bottom: 46,
  },
});
