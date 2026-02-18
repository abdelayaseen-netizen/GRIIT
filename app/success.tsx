import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Shield, Share2, Award, TrendingUp } from "lucide-react-native";
import Colors from "@/constants/colors";


export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const badgeScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const statsSlide = useRef(new Animated.Value(30)).current;

  const challengeId = params.challengeId as string;
  const title = params.title as string;
  const duration = params.duration as string;
  const tasksCount = params.tasksCount as string;
  const difficulty = params.difficulty as string;
  const daysCompleted = params.daysCompleted as string;
  const finalStreak = params.finalStreak as string;
  const isCompletion = params.isCompletion === "true";

  const isHardMode = difficulty === "hard" || difficulty === "extreme";

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.sequence([
      Animated.spring(badgeScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 7,
        delay: 150,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(statsSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [badgeScale, fadeAnim, statsSlide]);

  const handleContinue = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.replace("/(tabs)");
  };

  const handleShare = async () => {
    try {
      const message = `I completed "${title}" on GRIT. ${daysCompleted} of ${duration} days secured. ${isHardMode ? "Hard Mode." : ""}`;
      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({ title: "Challenge Complete", text: message });
        } else {
          await navigator.clipboard.writeText(message);
          alert("Copied to clipboard!");
        }
      } else {
        await Share.share({ message, title: "Challenge Complete" });
      }
    } catch (error) {
      console.log("Share failed:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.badgeContainer,
            { transform: [{ scale: badgeScale }] },
          ]}
        >
          <View style={[styles.badgeOuter, isHardMode && styles.badgeOuterHard]}>
            <View style={[styles.badgeInner, isHardMode && styles.badgeInnerHard]}>
              <Award size={48} color="#fff" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.header}>Challenge Complete.</Text>

          {isHardMode && (
            <View style={styles.hardModeTag}>
              <Shield size={14} color="#E87D4F" />
              <Text style={styles.hardModeTagText}>Hard Mode</Text>
            </View>
          )}

          <Text style={styles.challengeTitle}>{title}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.statsCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: statsSlide }],
            },
          ]}
        >
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <TrendingUp size={18} color={Colors.streak.shield} />
              <Text style={styles.statLabel}>Final Streak</Text>
            </View>
            <Text style={styles.statValue}>{finalStreak} days</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Shield size={18} color={Colors.streak.shield} />
              <Text style={styles.statLabel}>Days Secured</Text>
            </View>
            <Text style={styles.statValue}>{daysCompleted}/{duration}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.recognitionCard, { opacity: fadeAnim }]}>
          <Text style={styles.recognitionText}>You showed up consistently.</Text>
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.primaryButton, isHardMode && styles.primaryButtonHard]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Share2 size={18} color={Colors.text.secondary} />
            <Text style={styles.secondaryButtonText}>Share Completion</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    marginBottom: 32,
  },
  badgeOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.streak.shield + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeOuterHard: {
    backgroundColor: "rgba(232,125,79,0.15)",
  },
  badgeInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.streak.shield,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeInnerHard: {
    backgroundColor: "#E87D4F",
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
  },
  header: {
    fontSize: 38,
    fontWeight: "900" as const,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -1,
  },
  hardModeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(232,125,79,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(232,125,79,0.25)",
    marginBottom: 12,
  },
  hardModeTagText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#E87D4F",
    letterSpacing: 0.3,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text.secondary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  statsCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  statValue: {
    fontSize: 19,
    fontWeight: "800" as const,
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 18,
  },
  recognitionCard: {
    width: "100%",
    backgroundColor: Colors.pill,
    borderRadius: 14,
    padding: 18,
    marginBottom: 32,
  },
  recognitionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#111",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonHard: {
    backgroundColor: "#E87D4F",
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: "#fff",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
});
