import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link, Stack } from "expo-router";
import { DS_V3 } from "@/lib/design-system";
import Screen from "@/components/ds/Screen";
import { originTabHref } from "@/lib/origin-tab";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "" }} />
      <Screen>
        <View style={styles.container}>
          <Text style={styles.title}>Page not found</Text>
          <Text style={styles.message}>This screen does not exist.</Text>
          <Link href={originTabHref("home")} asChild>
            <Pressable style={styles.button} accessibilityLabel="Go to Home" accessibilityRole="button">
              <Text style={styles.buttonText}>Go to Home</Text>
            </Pressable>
          </Link>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: DS_V3.space.gutter,
    backgroundColor: DS_V3.color.canvas,
    gap: DS_V3.space.md,
  },
  title: {
    ...DS_V3.type.titleL,
    color: DS_V3.color.textPrimary,
  },
  message: {
    ...DS_V3.type.body,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  button: {
    backgroundColor: DS_V3.color.primary,
    minHeight: DS_V3.size.button,
    paddingHorizontal: DS_V3.space.section,
    borderRadius: DS_V3.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: DS_V3.space.sm,
  },
  buttonText: {
    ...DS_V3.type.headline,
    color: DS_V3.color.textPrimary,
  },
});
