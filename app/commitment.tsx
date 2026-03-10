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
import { Shield, X, Check } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { saveJoinedStarterId } from "@/lib/starter-join";
import { trpcMutate } from "@/lib/trpc";
import { inviteToChallenge } from "@/lib/share";
import { formatTRPCError } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

export default function CommitmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    challengeId?: string;
    isStarter?: string;
    title?: string;
    duration?: string;
    difficulty?: string;
  }>();
  const { refetchAll } = useApp();
  const [joining, setJoining] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const challengeId = params.challengeId ?? "";
  const isStarter = params.isStarter === "1";
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
      if (isStarter) {
        await saveJoinedStarterId(challengeId);
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        Alert.alert("You're in!", "Let's go.", [
          { text: "OK", onPress: () => router.replace(ROUTES.TABS as never) },
        ]);
        return;
      }
      const result = await trpcMutate("challenges.join", { challengeId }) as { joined?: boolean; runStatus?: string } | undefined;
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      try {
        await trpcMutate("referrals.markJoinedChallenge", { challengeId });
      } catch {
        // attribution is best-effort
      }
      await refetchAll();
      const runStatus = result?.runStatus;
      if (runStatus === "waiting") {
        Alert.alert("You're in!", "Waiting for more people to join. Share the challenge so the team can start.", [
          { text: "OK", onPress: () => router.replace(ROUTES.TABS as never) },
        ]);
      } else {
        Alert.alert("You're in!", "Invite a friend to join with you?", [
          { text: "Not now", onPress: () => router.replace(ROUTES.TABS as never) },
          {
            text: "Share",
            onPress: () => {
              inviteToChallenge({ name: title, id: challengeId }).catch((err) => {
                if (__DEV__) console.warn("[commitment] inviteToChallenge failed:", err instanceof Error ? err.message : err);
              });
              router.replace(ROUTES.TABS as never);
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
  }, [challengeId, isStarter, joining, router, refetchAll, title]);

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
          >
            <X size={22} color={Colors.text.tertiary} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Shield size={32} color={isHardMode ? "#E87D4F" : Colors.text.primary} strokeWidth={2} />
          </View>

          <Text style={styles.header}>challenge.</Text>

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
              <Text style={styles.warningText}>⚠️ One missed day resets progress to Day 1.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.checkboxRow]}
            onPress={() => setUnderstood((u) => !u)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, understood && styles.checkboxChecked]}>
              {understood ? <Check size={14} color="#fff" strokeWidth={3} /> : null}
            </View>
            <Text style={styles.checkboxLabel}>I understand the rules and reset conditions.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: Colors.accent },
              isHardMode && !understood && styles.confirmButtonFaded,
              joining && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={joining || (isHardMode && !understood)}
          >
            {joining ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Commitment</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 4,
  },
  iconContainer: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 28,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  hardModeText: {
    color: Colors.accent,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.text.primary,
    borderColor: Colors.text.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  warningCard: {
    backgroundColor: "rgba(232,125,79,0.08)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(232,125,79,0.2)",
  },
  warningText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#C86A3A",
    textAlign: "center",
    lineHeight: 20,
  },
  confirmButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmButtonFaded: {
    opacity: 0.5,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#fff",
    letterSpacing: 0.2,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
});
