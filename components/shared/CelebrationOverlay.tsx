import React, { useEffect, useMemo, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { CheckCircle2, Flame, Trophy, Share2 } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, GRIIT_COLORS, DS_RADIUS } from "@/lib/design-system"
import { useCelebrationStore, type CelebrationType } from "@/store/celebrationStore";
import { captureError } from "@/lib/sentry";
import { sharePlainMessage } from "@/lib/share";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const PARTICLE_COUNT = 36;

const CONFETTI_COLORS = [
  DS_COLORS.ACCENT,
  DS_COLORS.GREEN,
  DS_COLORS.WARNING,
  DS_COLORS.CATEGORY_MIND,
  DS_COLORS.confettiCyan,
  DS_COLORS.confettiPurple,
] as const;

function iconForType(type: CelebrationType, color: string) {
  const size = 56;
  if (type === "streak") return <Flame size={size} color={color} />;
  if (type === "badge") return <Trophy size={size} color={color} />;
  return <CheckCircle2 size={size} color={color} />;
}

function iconColor(type: CelebrationType): string {
  if (type === "streak") return GRIIT_COLORS.primary;
  if (type === "badge") return DS_COLORS.milestoneGold;
  return DS_COLORS.GREEN;
}

type ParticleConfig = {
  x: number;
  rotate: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
  duration: number;
  delay: number;
  color: string;
  size: number;
};

export default function CelebrationOverlay() {
  const visible = useCelebrationStore((s) => s.visible);
  const title = useCelebrationStore((s) => s.title);
  const subtitle = useCelebrationStore((s) => s.subtitle);
  const type = useCelebrationStore((s) => s.type);
  const shareMessage = useCelebrationStore((s) => s.shareMessage);
  const dismiss = useCelebrationStore((s) => s.dismiss);

  const handleShareChallenge = async () => {
    const msg = shareMessage?.trim();
    if (!msg) return;
    try {
      await sharePlainMessage(msg, "Join my GRIIT challenge");
    } catch (error) {
      captureError(error, "CelebrationOverlayShare");
      if (__DEV__) console.error("[Share] Error:", error);
    }
  };

  const backdropOp = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(50)).current;
  const cardSpring = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  const particles = useMemo(() => {
    const list: ParticleConfig[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      list.push({
        x: Math.random() * SCREEN_W,
        rotate: new Animated.Value(0),
        translateY: new Animated.Value(-20),
        opacity: new Animated.Value(1),
        duration: 1000 + Math.random() * 1500,
        delay: 0,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? DS_COLORS.ACCENT,
        size: 6 + Math.random() * 6,
      });
    }
    return list;
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    backdropOp.setValue(0);
    cardTranslate.setValue(50);
    cardSpring.setValue(0);
    iconScale.setValue(0);

    Animated.timing(backdropOp, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.spring(cardSpring, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslate, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.spring(iconScale, {
        toValue: 1.2,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const anims = particles.map((p) =>
      Animated.parallel([
        Animated.timing(p.translateY, {
          toValue: SCREEN_H * 0.85,
          duration: p.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: 1,
          duration: p.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(p.duration * 0.65),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: Math.max(200, p.duration * 0.35),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    Animated.parallel(anims).start();

    return () => {
      anims.forEach((a) => a.stop?.());
    };
  }, [visible, backdropOp, cardTranslate, cardSpring, iconScale, particles]);

  const cardAnimatedStyle = {
    opacity: cardSpring,
    transform: [{ translateY: cardTranslate }],
  };

  const icColor = iconColor(type);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, { opacity: backdropOp }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss celebration"
          />
        </Animated.View>

        {particles.map((p, i) => {
          const spin = p.rotate.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", `${360 + Math.random() * 180}deg`],
          });
          const left = p.x;
          return (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={[
                styles.particle,
                {
                  left,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  opacity: p.opacity,
                  transform: [{ translateY: p.translateY }, { rotate: spin }],
                },
              ]}
            />
          );
        })}

        <View style={styles.center} pointerEvents="box-none">
          <Animated.View style={[styles.card, cardAnimatedStyle]}>
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              {iconForType(type, icColor)}
            </Animated.View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {shareMessage ? (
              <>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => void handleShareChallenge()}
                  accessibilityLabel="Share your new challenge with others"
                  accessibilityRole="button"
                >
                  <Share2 size={16} color={DS_COLORS.white} />
                  <Text style={styles.shareButtonText}>Share your challenge</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.keepGoingButton}
                  onPress={dismiss}
                  accessibilityLabel="Continue to your challenge"
                  accessibilityRole="button"
                >
                  <Text style={styles.keepGoingText}>Keep going</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Pressable
                style={styles.btn}
                onPress={dismiss}
                accessibilityRole="button"
                accessibilityLabel="Continue to your challenge"
              >
                <Text style={styles.btnText}>Keep going</Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_COLORS.overlayDarker,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.lg,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.modal,
    padding: 32,
    alignItems: "center",
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
  },
  btn: {
    marginTop: 24,
    alignSelf: "stretch",
    backgroundColor: GRIIT_COLORS.primary,
    height: 48,
    borderRadius: DS_RADIUS.joinCta,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_ON_DARK,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GRIIT_COLORS.primary,
    borderRadius: DS_RADIUS.joinCta,
    paddingVertical: 14,
    marginTop: 16,
    width: "100%",
  },
  shareButtonText: {
    color: DS_COLORS.white,
    fontSize: 15,
    fontWeight: "500",
  },
  keepGoingButton: {
    borderWidth: 0.5,
    borderColor: DS_COLORS.border,
    borderRadius: DS_RADIUS.joinCta,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  keepGoingText: {
    color: DS_COLORS.textSecondary,
    fontSize: 15,
  },
  particle: {
    position: "absolute",
    top: 0,
    borderRadius: DS_RADIUS.SM,
  },
});
