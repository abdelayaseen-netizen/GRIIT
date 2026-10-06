import React from "react";
import { Linking, ScrollView, StyleSheet } from "react-native";
import Screen from "@/components/ds/Screen";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import * as Application from "expo-application";
import { ROUTES } from "@/lib/routes";
import { aboutVersionLine } from "@/lib/about-line";
import { DS_V3 } from "@/lib/design-system";
import Card from "@/components/ds/Card";
import ListRow from "@/components/ds/ListRow";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const ABOUT_LINE = aboutVersionLine({
  version: Constants.expoConfig?.version,
  build: Application.nativeBuildVersion,
  commit: (Constants.expoConfig?.extra as { commit?: string } | undefined)?.commit,
});

export default function SettingsAboutScreen() {
  const router = useRouter();
  return (
    <ErrorBoundary>
      <Screen style={styles.safe} edges={["top"]}>
        <SettingsNav title="About" />
        <ScrollView contentContainerStyle={styles.body}>
          <Card style={styles.card}>
            <ListRow title={ABOUT_LINE} />
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
      </Screen>
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
