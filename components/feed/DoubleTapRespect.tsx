import React, { useEffect, useState } from "react";
import { AccessibilityInfo, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { Heart } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { doubleTapAction } from "@/lib/feed-join";

/** Build 92 04.4: a single tap opens after this window; two taps inside it like. */
export const WINDOW_MS = 250;
/** The white heart over the photo, never orange. */
export const BURST_MS = 600;

/**
 * One gesture owns both taps on a post's photo. The double tap likes (never unlikes, nothing on your
 * own post) and bursts a white heart; the single tap resolves only after the double-tap window has
 * failed, then opens. Children must not be Pressables, or the first tap would open before the second lands.
 */
export default function DoubleTapRespect({
  respected,
  onRespect,
  onOpen,
  ownPost = false,
  burstSize = 96,
  accessibilityLabel,
  testID = "feed-photo",
  style,
  children,
}: {
  respected: boolean;
  onRespect: () => void;
  onOpen: () => void;
  ownPost?: boolean;
  burstSize?: number;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
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
    opacity.value = withTiming(0, { duration: BURST_MS });
    scale.value = 0;
    scale.value = withSequence(withTiming(1.15, { duration: 120 }), withTiming(1, { duration: BURST_MS - 120 }));
  };

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(WINDOW_MS)
    .onEnd((e, success) => {
      if (success) runOnJS(onDouble)(e.x, e.y);
    });
  // Exclusive: the single tap waits for the double tap to fail (the WINDOW_MS passes), then fires once.
  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDelay(WINDOW_MS)
    .onEnd((_e, success) => {
      if (success) runOnJS(onOpen)();
    });
  const gesture = Gesture.Exclusive(doubleTap, singleTap);

  return (
    <GestureDetector gesture={gesture}>
      <View testID={testID} style={style} accessible accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
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
