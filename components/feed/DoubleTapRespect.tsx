import React, { useEffect, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
  burstSize = 96,
  accessibilityLabel,
  children,
}: {
  respected: boolean;
  onRespect: () => void;
  onOpen: () => void;
  ownPost?: boolean;
  burstSize?: number;
  accessibilityLabel?: string;
  children: React.ReactNode;
}) {
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

  const onDouble = (px: number, py: number) => {
    const action = doubleTapAction(ownPost, respected);
    if (action === "noop") return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action === "respect") onRespect();
    if (reduce) return;
    x.value = px - burstSize / 2;
    y.value = py - burstSize / 2;
    opacity.value = 1;
    opacity.value = withTiming(0, { duration: 600 });
    scale.value = 0;
    scale.value = withSequence(withTiming(1.15, { duration: 120 }), withTiming(1, { duration: 300 }));
  };

  const gesture = Gesture.Exclusive(
    Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(WINDOW_MS)
      .onEnd((e) => {
        runOnJS(onDouble)(e.x, e.y);
      }),
    Gesture.Tap()
      .numberOfTaps(1)
      .onEnd(() => {
        runOnJS(onOpen)();
      }),
  );

  return (
    <GestureDetector gesture={gesture}>
      <View accessible accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
        {children}
        <Animated.View pointerEvents="none" style={burstStyle}>
          <View style={{ width: burstSize, height: burstSize, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                position: "absolute",
                width: burstSize,
                height: burstSize,
                borderRadius: burstSize / 2,
                borderWidth: 2,
                borderColor: DS_V3.color.textPrimary,
                opacity: 0.5,
              }}
            />
            <Heart size={Math.round(burstSize * 0.75)} color={DS_V3.color.textPrimary} fill={DS_V3.color.textPrimary} />
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
