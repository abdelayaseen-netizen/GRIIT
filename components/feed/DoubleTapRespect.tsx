import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Heart } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { doubleTapAction } from "@/lib/feed-join";

const WINDOW_MS = 250;

export default function DoubleTapRespect({
  respected,
  onRespect,
  onOpen,
  ownPost = false,
  burstSize = 104,
  children,
}: {
  respected: boolean;
  onRespect: () => void;
  onOpen: () => void;
  ownPost?: boolean;
  burstSize?: 64 | 104;
  children: React.ReactNode;
}) {
  const last = useRef(0);
  const single = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reduce, setReduce] = useState(false);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
  }, []);

  const burstStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: x.value,
    top: y.value,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const onPress = (e: { nativeEvent: { locationX: number; locationY: number } }) => {
    const now = Date.now();
    if (now - last.current < WINDOW_MS) {
      if (single.current) clearTimeout(single.current);
      single.current = null;
      last.current = 0;
      const action = doubleTapAction(ownPost, respected);
      if (action === "noop") return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (action === "respect") onRespect();
      if (!reduce) {
        x.value = e.nativeEvent.locationX - burstSize / 2;
        y.value = e.nativeEvent.locationY - burstSize / 2;
        opacity.value = withSequence(withTiming(1, { duration: 0 }), withTiming(0, { duration: 200 }));
        scale.value = withSequence(withTiming(1.2, { duration: 180 }), withTiming(0.9, { duration: 200 }));
      }
      return;
    }
    last.current = now;
    if (single.current) clearTimeout(single.current);
    single.current = setTimeout(() => {
      single.current = null;
      onOpen();
    }, WINDOW_MS);
  };

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <View>
        {children}
        <Animated.View pointerEvents="none" style={burstStyle}>
          <Heart size={burstSize} color={DS_V3.color.textPrimary} fill={DS_V3.color.brand} />
        </Animated.View>
      </View>
    </Pressable>
  );
}