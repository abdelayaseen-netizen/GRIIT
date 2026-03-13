import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Shield, Check, Share2 } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { shareDaySecured } from "@/lib/share";

const SECURE_DAY_MESSAGES = [
  "Day {day} Secured.",
  "You showed up. Day {day} locked in.",
  "Another one. Day {day} secured.",
  "Discipline wins. Day {day} done.",
  "Day {day} in the books. Keep going.",
];

export default function SecureConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [shareError, setShareError] = React.useState(false);

  const day = params.day as string | undefined;
  const streak = params.streak as string | undefined;
  const totalDays = params.totalDays as string | undefined;
  const isHardMode = params.isHardMode === "true";

  const headerMessage = React.useMemo(() => {
    const d = day ?? "0";
    const msg = SECURE_DAY_MESSAGES[Math.floor(Math.random() * SECURE_DAY_MESSAGES.length)];
    return msg.replace(/\{day\}/g, d);
  }, [day]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      router.back();
    }, 2500);

    return () => clearTimeout(timer);
  }, [scaleAnim, fadeAnim, progressAnim, router]);

  if (!day || !streak || !totalDays) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.content}>
          <Text style={styles.header}>Not found</Text>
          <TouchableOpacity style={styles.shareButton} onPress={() => router.back()} activeOpacity={0.85} accessibilityLabel="Return to home" accessibilityRole="button">
            <Text style={styles.shareButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", `${(parseInt(day) / parseInt(totalDays)) * 100}%`],
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconOuter}>
            <View style={[styles.iconInner, isHardMode && styles.iconInnerHard]}>
              <Shield size={40} color="#fff" fill="#fff" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.header}>{headerMessage}</Text>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Check size={16} color={DS_COLORS.success} />
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>
              <Text style={styles.statValue}>{streak} days</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Shield size={16} color={DS_COLORS.textMuted} />
                <Text style={styles.statLabel}>Progress</Text>
              </View>
              <Text style={styles.statValue}>
                {day}/{totalDays}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth, backgroundColor: isHardMode ? "#E87D4F" : DS_COLORS.success },
                ]}
              />
            </View>
          </View>

          {isHardMode && (
            <View style={styles.hardModeTag}>
              <Text style={styles.hardModeText}>Hard Mode</Text>
            </View>
          )}

          {shareError && (
            <Text style={[styles.statLabel, { color: "#B91C1C", marginBottom: 8 }]}>Share failed. Tap to retry.</Text>
          )}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              setShareError(false);
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              shareDaySecured({
                streak: parseInt(streak || "0", 10),
                dayNumber: parseInt(day || "0", 10),
              }).catch(() => setShareError(true));
            }}
            activeOpacity={0.85}
            accessibilityLabel="Share your achievement"
            accessibilityRole="button"
          >
            <Share2 size={18} color={DS_COLORS.accent} />
            <Text style={styles.shareButtonText}>Share Your Win</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
    marginBottom: 32,
  },
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DS_COLORS.success + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: DS_COLORS.success,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInnerHard: {
    backgroundColor: "#E87D4F",
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
  },
  header: {
    fontSize: 36,
    fontWeight: "900" as const,
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 28,
    letterSpacing: -1,
  },
  statsCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.textSecondary,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: DS_COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.border,
    marginVertical: 16,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 20,
  },
  progressTrack: {
    height: 8,
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  hardModeTag: {
    backgroundColor: "rgba(232,125,79,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(232,125,79,0.25)",
  },
  hardModeText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#E87D4F",
    letterSpacing: 0.5,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DS_COLORS.accent,
    backgroundColor: DS_COLORS.accent + "12",
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.accent,
  },
});
