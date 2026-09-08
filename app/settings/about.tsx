import React from "react";
import { Linking, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { ROUTES } from "@/lib/routes";
import { DS_V3 } from "@/lib/design-system";
import Card from "@/components/ds/Card";
import ListRow from "@/components/ds/ListRow";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export default function SettingsAboutScreen() {
  const router = useRouter();
  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <SettingsNav title="About" />
        <ScrollView contentContainerStyle={styles.body}>
          <Card style={styles.card}>
            <ListRow title={`GRIIT ${APP_VERSION}`} />
            <ListRow
              title="Terms of Service"
              onPress={() => router.push(ROUTES.LEGAL_TERMS as never)}
            />
            <ListRow
              title="Privacy Policy"
              onPress={() => router.push(ROUTES.LEGAL_PRIVACY as never)}
            />
            <ListRow
              title="Contact"
              subtitle="griit.health@gmail.com"
              onPress={() => void Linking.openURL("mailto:griit.health@gmail.com")}
              divider={false}
            />
          </Card>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.xs * 10,
  },
  card: { padding: 0, overflow: "hidden" },
});
