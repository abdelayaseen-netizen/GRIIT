import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Shield, X } from "lucide-react-native";
import { useApp } from "@/contexts/AppContext";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { inviteToChallenge } from "@/lib/share";
import { formatTRPCError } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS } from "@/lib/design-system";

export default function CommitmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    challengeId?: string;
    title?: string;
    duration?: string;
    difficulty?: string;
  }>();
  const { refetchAll } = useApp();
  const [joining, setJoining] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const challengeId = params.challengeId ?? "";
  const title = params.title ?? "Challenge";
  const duration = params.duration ?? "0";
  const difficulty = (params.difficulty as string) || "medium";
  const isHardMode = difficulty === "hard" || difficulty === "extreme";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleConfirm = useCallback(async () => {
    if (!challengeId || joining) return;
    setJoining(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      const result = await trpcMutate(TRPC.challenges.join, { challengeId }) as { joined?: boolean; runStatus?: string } | undefined;
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      try {
        await trpcMutate(TRPC.referrals.markJoinedChallenge, { challengeId });
      } catch {
        // attribution is best-effort
      }
      await refetchAll();
      const runStatus = result?.runStatus;
      if (runStatus === "waiting") {
        Alert.alert("You're in!", "Waiting for more people to join. Share the challenge so the team can start.", [
          { text: "OK", onPress: () => router.replace(ROUTES.CHALLENGE_ID(challengeId) as never) },
        ]);
      } else {
        Alert.alert("You're in!", "Invite a friend to join with you?", [
          { text: "Not now", onPress: () => router.replace(ROUTES.CHALLENGE_ID(challengeId) as never) },
          {
            text: "Share",
            onPress: () => {
              inviteToChallenge({ name: title, id: challengeId }).catch(() => {});
              router.replace(ROUTES.CHALLENGE_ID(challengeId) as never);
            },
          },
        ]);
      }
    } catch (err: unknown) {
      const { title, message } = formatTRPCError(err);
      Alert.alert(title, message);
    } finally {
      setJoining(false);
    }
  }, [challengeId, joining, router, refetchAll, title]);

  const handleCancel = () => {
    if (joining) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal" }} />
      
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={handleCancel}
        accessibilityLabel="Dismiss"
        accessibilityRole="button"
      />

      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCancel}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <X size={22} color={DS_COLORS.grayDark} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Shield size={28} color={DS_COLORS.accent} strokeWidth={2} />
          </View>

          <Text style={styles.header}>You are committing to this challenge.</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Challenge</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{title}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{duration} days</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mode</Text>
              <Text style={[styles.detailValue, isHardMode && styles.hardModeText]}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Text>
            </View>
          </View>

          {isHardMode && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>One missed day resets progress.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.confirmButton, joining && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={joining}
            accessibilityLabel="Confirm commitment to join"
            accessibilityRole="button"
          >
            {joining ? (
              <ActivityIndicator color={DS_COLORS.white} />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Commitment</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
            accessibilityLabel="Cancel and go back"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <View style={styles.bottomHandle} />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  content: {
    backgroundColor: DS_COLORS.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    marginBottom: 4,
  },
  iconContainer: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DS_COLORS.surfaceGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  header: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: DS_COLORS.borderDark,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  detailsCard: {
    backgroundColor: DS_COLORS.white,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: DS_COLORS.grayDark,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: DS_COLORS.borderDark,
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  hardModeText: {
    color: DS_COLORS.accent,
    fontWeight: "600" as const,
  },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.surfaceGrayDark,
    marginVertical: 16,
  },
  warningCard: {
    backgroundColor: DS_COLORS.accentSoft,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: DS_COLORS.accent,
    textAlign: "center",
    lineHeight: 22,
  },
  confirmButton: {
    backgroundColor: DS_COLORS.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: DS_COLORS.grayDark,
  },
  bottomHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DS_COLORS.grayMid,
    marginTop: 16,
  },
});
