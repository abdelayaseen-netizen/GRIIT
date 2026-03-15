import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { AlertCircle } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";

export default function DayMissedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ challengeId?: string; isHardMode?: string; hasGrace?: string; graceUsed?: string }>();

  const challengeId = params.challengeId;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isHardMode = params.isHardMode === "true";
  const hasGrace = params.hasGrace === "true";
  const graceUsed = params.graceUsed === "true";

  const goToDestination = () => {
    if (challengeId) {
      router.replace(ROUTES.CHALLENGE_ID(challengeId) as never);
    } else {
      router.replace(ROUTES.TABS as never);
    }
  };

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRestart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    goToDestination();
  };

  const getMessage = () => {
    if (isHardMode) {
      return "Hard Mode requires full restart.";
    }
    if (graceUsed) {
      return "Grace limit exceeded. Restart required.";
    }
    if (hasGrace) {
      return "Grace day used.";
    }
    return "Restart required.";
  };

  const shouldShowRestart = isHardMode || graceUsed;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <AlertCircle size={48} color={DS_COLORS.textSecondary} strokeWidth={1.5} />
        </View>

        <Text style={styles.header} accessibilityRole="header">Day Missed.</Text>

        <Text style={styles.message}>{getMessage()}</Text>

        {shouldShowRestart && (
          <TouchableOpacity
            style={styles.restartButton}
            onPress={handleRestart}
            activeOpacity={0.85}
            accessibilityLabel="Restart challenge"
            accessibilityRole="button"
          >
            <Text style={styles.restartButtonText}>Restart Challenge</Text>
          </TouchableOpacity>
        )}

        {!shouldShowRestart && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={goToDestination}
            activeOpacity={0.85}
            accessibilityLabel="Continue"
            accessibilityRole="button"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={goToDestination}
          activeOpacity={0.7}
          accessibilityLabel="Back to Home"
          accessibilityRole="button"
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DS_COLORS.chipFill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  header: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  message: {
    fontSize: 17,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  restartButton: {
    width: "100%",
    backgroundColor: DS_COLORS.overlayDark,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  restartButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  continueButton: {
    width: "100%",
    backgroundColor: DS_COLORS.overlayDark,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  homeButton: {
    paddingVertical: 14,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
  },
});
