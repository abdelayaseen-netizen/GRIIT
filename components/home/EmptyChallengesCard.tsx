import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Target, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";

export default function EmptyChallengesCard() {
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(tabs)/discover" as any);
  };

  return (
    <View style={styles.card}>
      <Target size={40} color={Colors.text.muted} />
      <Text style={styles.title}>You have no active challenges</Text>
      <Text style={styles.subtitle}>Join a challenge to start securing your days.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.85}
        testID="empty-challenges-discover-button"
      >
        <Text style={styles.buttonText}>Discover challenges</Text>
        <ChevronRight size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 6,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
