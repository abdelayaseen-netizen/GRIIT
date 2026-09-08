import React, { useEffect } from "react";
import { Pressable } from "react-native";
import { Heart } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export type LikeHeartProps = {
  liked: boolean;
  color: string;
  mutedColor: string;
  size: number;
  onPress: () => void;
  pulseToken?: number;
  accessibilityLabel?: string;
};

function pulseScale(scale: { value: number }) {
  scale.value = withSequence(
    withTiming(1.25, { duration: 80 }),
    withTiming(1, { duration: 70 }),
  );
}

export default function LikeHeart({
  liked,
  color,
  mutedColor,
  size,
  onPress,
  pulseToken = 0,
  accessibilityLabel,
}: LikeHeartProps) {
  const scale = useSharedValue(1);
  const stroke = liked ? color : mutedColor;

  useEffect(() => {
    if (pulseToken > 0) pulseScale(scale);
  }, [pulseToken, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        if (!liked) pulseScale(scale);
        onPress();
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (liked ? "Unlike" : "Like")}
      accessibilityState={{ selected: liked }}
    >
      <Animated.View style={animStyle}>
        <Heart size={size} color={stroke} fill={liked ? color : "none"} />
      </Animated.View>
    </Pressable>
  );
}
