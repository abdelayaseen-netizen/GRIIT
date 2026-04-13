import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { formatSecondsToMMSS } from "@/lib/formatTime";
import { DS_COLORS, DS_RADIUS, DS_SHADOWS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { useActiveSessionStore } from "@/store/activeSessionStore";
import { useNotificationPrefsStore } from "@/store/notificationPrefsStore";

export function ActiveTaskCard() {
  const router = useRouter();
  const activeSession = useActiveSessionStore((s) => s.activeSession);
  const showCardPref = useNotificationPrefsStore((s) => s.showActiveTaskCard);
  const [, setTick] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeSession?.isTimerRunning) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
      pulse.setValue(1);
    };
  }, [activeSession?.isTimerRunning, pulse]);

  if (!activeSession || !showCardPref) {
    return null;
  }

  const elapsedSec = Math.max(
    0,
    Math.floor((Date.now() - activeSession.startedAtMs) / 1000)
  );
  let subtitle: string;
  if (activeSession.isTimerRunning) {
    subtitle = formatSecondsToMMSS(elapsedSec);
  } else if (activeSession.targetSeconds != null && activeSession.targetSeconds > 0) {
    subtitle = formatSecondsToMMSS(Math.max(0, activeSession.targetSeconds - elapsedSec));
  } else {
    subtitle = "In progress";
  }

  const label = `Resume ${activeSession.taskName}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(ROUTES.CHALLENGE_ACTIVE(activeSession.activeChallengeId) as never)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          styles.dot,
          { opacity: activeSession.isTimerRunning ? pulse : 1 },
        ]}
      />
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={2}>
          {activeSession.taskName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={22} color={DS_COLORS.TEXT_MUTED} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: DS_SPACING.xl,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.LG,
    ...DS_SHADOWS.sm,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
  },
  center: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_MEDIUM,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_REGULAR,
    color: DS_COLORS.TEXT_MUTED,
  },
});
