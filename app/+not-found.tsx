import { View, Text, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { File, Home } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Screen from "@/components/ds/Screen";
import Button from "@/components/ds/Button";
import { originTabHref } from "@/lib/origin-tab";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "" }} />
      <Screen>
        <View style={styles.container}>
          <File size={28} color={DS_V3.color.textSecondary} />
          <Text style={styles.title}>This page isn’t here</Text>
          <Text style={styles.message}>The link may be old. Your proofs and streak aren’t affected.</Text>
        </View>
        <View style={styles.footer}>
          <Button
            fill
            label="Go to Home"
            icon={<Home size={18} color={DS_V3.color.onBrand} />}
            onPress={() => router.replace(originTabHref("home") as never)}
          />
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
    paddingHorizontal: 32,
    gap: 8,
    backgroundColor: DS_V3.color.canvas,
  },
  title: {
    ...DS_V3.type.title,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  message: {
    ...DS_V3.type.body,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: 12,
  },
});
