import React, { useCallback, useState } from "react";
import { AppState, Linking, ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import Screen from "@/components/ds/Screen";
import { SettingsNav } from "@/components/settings/SettingsNav";
import ListRow from "@/components/ds/ListRow";
import Card from "@/components/ds/Card";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DS_V3 } from "@/lib/design-system";

type Perm = { title: string; sub: string; value: string };

function label(status: string, kind: "camera" | "location" | "notes"): string {
  if (kind === "location" && status === "granted") return "While using";
  if (status === "granted") return "Allowed";
  if (status === "denied") return "Off";
  return "Not asked";
}

function PermissionsInner() {
  const [rows, setRows] = useState<Perm[]>([
    { title: "Camera", sub: "Needed for proof photos", value: "Not asked" },
    { title: "Location", sub: "Only when you check in", value: "Not asked" },
    { title: "Notifications", sub: "", value: "Not asked" },
    { title: "Apple Health", sub: "Import runs (not built)", value: "Not asked" },
  ]);

  const load = useCallback(async () => {
    const [camera, location, notes] = await Promise.all([
      Camera.getCameraPermissionsAsync().catch(() => ({ status: "undetermined" })),
      Location.getForegroundPermissionsAsync().catch(() => ({ status: "undetermined" })),
      Notifications.getPermissionsAsync().catch(() => ({ status: "undetermined" })),
    ]);
    setRows([
      { title: "Camera", sub: "Needed for proof photos", value: label(camera.status, "camera") },
      { title: "Location", sub: "Only when you check in", value: label(location.status, "location") },
      { title: "Notifications", sub: "", value: label(notes.status, "notes") },
      { title: "Apple Health", sub: "Import runs (not built)", value: "Not asked" },
    ]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
      const sub = AppState.addEventListener("change", (state) => {
        if (state === "active") void load();
      });
      return () => sub.remove();
    }, [load]),
  );

  return (
    <Screen style={styles.safe} edges={["top"]}>
      <SettingsNav title="Permissions" />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={styles.card}>
          {rows.map((row, i) => (
            <ListRow
              key={row.title}
              title={row.title}
              subtitle={row.sub || undefined}
              trailing={<Text style={styles.value}>{row.value}</Text>}
              onPress={() => void Linking.openSettings()}
              divider={i < rows.length - 1}
            />
          ))}
        </Card>
        <Text style={styles.note}>Each row opens GRIIT in iOS Settings. GRIIT never reads your camera roll.</Text>
      </ScrollView>
    </Screen>
  );
}

export default function PermissionsScreen() {
  return (
    <ErrorBoundary>
      <PermissionsInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.gutter },
  card: { padding: 0, overflow: "hidden" },
  value: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  note: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary, marginTop: 12 },
});
