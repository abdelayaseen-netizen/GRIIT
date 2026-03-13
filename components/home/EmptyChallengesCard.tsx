import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Target } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import Colors from "@/constants/colors";
import { GRIIT_COLORS, GRIIT_RADII, GRIIT_SHADOWS } from "@/src/theme";

export default function EmptyChallengesCard() {
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(ROUTES.TABS_DISCOVER as never);
  };

  return (
    <View style={styles.card}>
      <Target size={40} color={Colors.text.muted} />
      <Text style={styles.title}>You have no active challenges</Text>
      <Text style={styles.subtitle}>Join a challenge to get started.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.85}
        testID="empty-challenges-discover-button"
      >
        <Text style={styles.buttonText}>Discover challenges ›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: GRIIT_RADII.card,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    ...GRIIT_SHADOWS.card,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
  button: {
    backgroundColor: GRIIT_COLORS.primaryAccent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: GRIIT_RADII.buttonPill,
    marginTop: 16,
    alignItems: "center",
    ...GRIIT_SHADOWS.button,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
