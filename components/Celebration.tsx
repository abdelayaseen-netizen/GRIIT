import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  AccessibilityInfo,
} from "react-native";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CONFETTI_COUNT = 120;
const CONFETTI_DURATION = 1200;
const CONFETTI_COLORS = [
  "#FF6B35",
  "#4ECB71",
  "#FFD700",
  "#FF69B4",
  "#00CED1",
  "#9B59B6",
  "#3498DB",
];

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  shape: "square" | "rectangle" | "circle";
}

interface CelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

export default function Celebration({ visible, onComplete }: CelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        setReduceMotion(enabled);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS === "web") return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log("Haptic feedback not available:", error);
    }
  }, []);

  const createConfetti = useCallback((): ConfettiPiece[] => {
    const pieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const startX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100;
      const startY = -20;
      
      pieces.push({
        id: i,
        x: new Animated.Value(startX),
        y: new Animated.Value(startY),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 6,
        shape: ["square", "rectangle", "circle"][Math.floor(Math.random() * 3)] as "square" | "rectangle" | "circle",
      });
    }
    
    return pieces;
  }, []);

  const animateConfetti = useCallback((pieces: ConfettiPiece[]) => {
    const animations = pieces.map((piece, index) => {
      const startX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100;
      const targetX = startX + (Math.random() - 0.5) * SCREEN_WIDTH * 1.5;
      const targetY = SCREEN_HEIGHT + 50;
      const duration = CONFETTI_DURATION + Math.random() * 400;
      const delay = Math.random() * 200;

      return Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(piece.x, {
            toValue: targetX,
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(piece.y, {
            toValue: targetY,
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(piece.rotation, {
            toValue: Math.random() * 720 - 360,
            duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(piece.opacity, {
            toValue: 0,
            duration: duration * 0.8,
            delay: duration * 0.2,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      setConfetti([]);
      onComplete?.();
    });
  }, [onComplete]);

  useEffect(() => {
    if (visible && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      
      triggerHaptic();
      
      if (!reduceMotion) {
        const pieces = createConfetti();
        setConfetti(pieces);
        
        requestAnimationFrame(() => {
          animateConfetti(pieces);
        });
      } else {
        setTimeout(() => {
          onComplete?.();
        }, 100);
      }
    }
    
    if (!visible) {
      hasTriggeredRef.current = false;
    }
  }, [visible, reduceMotion, triggerHaptic, createConfetti, animateConfetti, onComplete]);

  if (!visible || confetti.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {confetti.map((piece) => {
        const rotateInterpolate = piece.rotation.interpolate({
          inputRange: [-360, 360],
          outputRange: ["-360deg", "360deg"],
        });

        const shapeStyle = 
          piece.shape === "circle"
            ? { borderRadius: piece.size / 2 }
            : piece.shape === "rectangle"
            ? { width: piece.size, height: piece.size * 2 }
            : {};

        return (
          <Animated.View
            key={piece.id}
            style={[
              styles.confettiPiece,
              {
                width: piece.size,
                height: piece.shape === "rectangle" ? piece.size * 2 : piece.size,
                backgroundColor: piece.color,
                transform: [
                  { translateX: piece.x },
                  { translateY: piece.y },
                  { rotate: rotateInterpolate },
                  { scale: piece.scale },
                ],
                opacity: piece.opacity,
              },
              shapeStyle,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  confettiPiece: {
    position: "absolute",
  },
});
