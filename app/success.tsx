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
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Shield, Share2, ArrowRight, Flame, Zap } from "lucide-react-native";
import Colors from "@/constants/colors";
import Celebration from "@/components/Celebration";
import { trpc } from "@/lib/trpc";

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showConfetti, setShowConfetti] = useState(false);
  const utils = trpc.useUtils();

  const shieldScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const challengeId = params.challengeId as string;
  const title = params.title as string;
  const duration = params.duration as string;
  const tasksCount = params.tasksCount as string;
  const difficulty = params.difficulty as string;

  const joinMutation = trpc.challenges.join.useMutation({
    onSuccess: () => {
      utils.challenges.getActive.invalidate();
    },
    onError: (error) => {
      console.error("Auto-join failed:", error);
    },
  });

  useEffect(() => {
    if (Platform.OS !== "web") {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log("Haptic not available:", error);
      }
    }

    setShowConfetti(true);

    Animated.sequence([
      Animated.spring(shieldScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
        delay: 200,
      }),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(actionsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [shieldScale, titleOpacity, cardOpacity, cardSlide, actionsOpacity, pulseAnim]);

  const handleStartNow = async () => {
    if (joinMutation.isPending) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await joinMutation.mutateAsync({ challengeId });
    router.replace(`/challenge/${challengeId}`);
  };

  const handleShare = async () => {
    try {
      const message = `I just created "${title}" on GRIT. ${parseInt(duration, 10)} days. ${tasksCount} daily tasks. Join me.`;
      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({ title: `Join ${title}`, text: message });
        } else {
          await navigator.clipboard.writeText(message);
          alert("Copied to clipboard!");
        }
      } else {
        await Share.share({ message, title: `Join ${title}` });
      }
    } catch (error) {
      console.log("Share failed:", error);
    }
  };

  const handleBack = () => {
    router.replace("/(tabs)");
  };

  const getDurationLabel = () => {
    const days = parseInt(duration, 10);
    if (days === 1) return "24H";
    return `${days} days`;
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "easy": return "#22C55E";
      case "medium": return "#F59E0B";
      case "hard": return "#EF4444";
      case "extreme": return "#B91C1C";
      default: return Colors.accent;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Celebration visible={showConfetti} onComplete={() => setShowConfetti(false)} />

      <View style={styles.content}>
        <Animated.View style={[styles.shieldContainer, { transform: [{ scale: Animated.multiply(shieldScale, pulseAnim) }] }]}>
          <View style={styles.shieldOuter}>
            <View style={styles.shieldInner}>
              <Shield size={44} color="#fff" fill="#fff" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: titleOpacity, alignItems: "center" }}>
          <Text style={styles.title}>Challenge Created</Text>
          <Text style={styles.subtitle}>This is day 1. You{"'"}re leading now.</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.challengeCard,
            { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
          ]}
        >
          <Text style={styles.challengeTitle}>{title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Flame size={14} color={Colors.streak.fire} />
              <Text style={styles.statPillText}>{getDurationLabel()}</Text>
            </View>
            <View style={styles.statPill}>
              <Zap size={14} color={Colors.accent} />
              <Text style={styles.statPillText}>{tasksCount} tasks</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: getDifficultyColor() + "14" }]}>
              <Text style={[styles.statPillText, { color: getDifficultyColor() }]}>
                {difficulty || "medium"}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: actionsOpacity }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartNow}
            disabled={joinMutation.isPending}
            activeOpacity={0.85}
            testID="success-start-button"
          >
            <Text style={styles.primaryButtonText}>
              {joinMutation.isPending ? "Joining..." : "Start Now"}
            </Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Share2 size={18} color={Colors.text.secondary} />
            <Text style={styles.secondaryButtonText}>Share Challenge</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.textButton} onPress={handleBack} activeOpacity={0.7}>
            <Text style={styles.textButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  shieldContainer: {
    marginBottom: 28,
  },
  shieldOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.streak.shield + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  shieldInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.streak.shield,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "900" as const,
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 32,
    textAlign: "center",
  },
  challengeCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 36,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  statPillText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "rgba(255,255,255,0.8)",
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: Colors.streak.shield,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: "#fff",
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "rgba(255,255,255,0.7)",
  },
  textButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  textButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "rgba(255,255,255,0.4)",
  },
});
