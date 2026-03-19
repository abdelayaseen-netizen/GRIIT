import React, { useEffect, useRef, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Pressable,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Shield } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

const { width: SCREEN_W } = Dimensions.get("window");

export type JoinCelebrationModalProps = {
  visible: boolean;
  onDismiss: () => void;
  challengeName: string;
  durationDays: number;
};

export default function JoinCelebrationModal({
  visible,
  onDismiss,
  challengeName,
  durationDays,
}: JoinCelebrationModalProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissed = useRef(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const runDismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.94, duration: 240, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onDismissRef.current();
    });
  }, [opacity, scale]);

  useEffect(() => {
    if (!visible) {
      dismissed.current = false;
      opacity.setValue(0);
      scale.setValue(0.88);
      return;
    }

    dismissed.current = false;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    opacity.setValue(0);
    scale.setValue(0.88);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
        tension: 70,
      }),
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();

    autoDismissTimer.current = setTimeout(() => {
      runDismiss();
    }, 6000);

    return () => {
      if (autoDismissTimer.current) {
        clearTimeout(autoDismissTimer.current);
        autoDismissTimer.current = null;
      }
    };
  }, [visible, opacity, scale, runDismiss]);

  const handleLetsGo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    runDismiss();
  };

  const handleBackdropDismiss = () => {
    runDismiss();
  };

  if (!visible) return null;

  const subline = `${challengeName.trim() || "Challenge"} · ${durationDays} day${durationDays === 1 ? "" : "s"}`;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={handleBackdropDismiss}>
      <Pressable style={styles.backdrop} onPress={handleBackdropDismiss} accessibilityLabel="Dismiss celebration">
        <View style={styles.confettiLayer} pointerEvents="none">
          <ConfettiCannon
            count={180}
            origin={{ x: SCREEN_W / 2, y: 0 }}
            fadeOut
            fallSpeed={3200}
          />
        </View>
        <Animated.View
          style={[
            styles.cardWrap,
            {
              opacity,
              transform: [{ scale }],
              zIndex: 1,
            },
          ]}
          pointerEvents="box-none"
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.inner} accessibilityRole="summary">
              <Shield size={64} color={DS_COLORS.accent} strokeWidth={2} />
              <Text style={styles.headline}>You&apos;re built different.</Text>
              <Text style={styles.subline}>{subline}</Text>
              <Text style={styles.secondary}>Day 1 starts now. Don&apos;t break the chain.</Text>
              <TouchableOpacity
                style={styles.cta}
                onPress={handleLetsGo}
                activeOpacity={0.9}
                accessibilityLabel="Let's Go"
                accessibilityRole="button"
              >
                <Text style={styles.ctaText}>Let&apos;s Go</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  confettiLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    zIndex: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.xl,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  inner: {
    alignItems: "center",
    paddingVertical: DS_SPACING.xxl,
    paddingHorizontal: DS_SPACING.lg,
  },
  headline: {
    ...DS_TYPOGRAPHY.pageTitle,
    fontSize: 26,
    color: DS_COLORS.WHITE,
    textAlign: "center",
    marginTop: DS_SPACING.xl,
  },
  subline: {
    ...DS_TYPOGRAPHY.body,
    color: DS_COLORS.TEXT_MUTED,
    textAlign: "center",
    marginTop: DS_SPACING.md,
  },
  secondary: {
    ...DS_TYPOGRAPHY.secondary,
    color: DS_COLORS.TEXT_MUTED,
    textAlign: "center",
    marginTop: DS_SPACING.lg,
    lineHeight: 22,
  },
  cta: {
    marginTop: DS_SPACING.xxl,
    alignSelf: "stretch",
    backgroundColor: DS_COLORS.accent,
    borderRadius: 28,
    paddingVertical: DS_SPACING.lg,
    alignItems: "center",
    minHeight: 56,
    justifyContent: "center",
  },
  ctaText: {
    ...DS_TYPOGRAPHY.button,
    color: DS_COLORS.WHITE,
  },
});
