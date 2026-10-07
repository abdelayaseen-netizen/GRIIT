import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { color, type, space, radius, border, hit, displayFace, displayWeight } from '../../tokens';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming, withDelay, Easing, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Heart } from 'lucide-react-native';
import { AccessibilityInfo } from 'react-native';

// Frame 128. Double tap anywhere on a post respects it; single tap opens the post after 250 ms.
// Double tap never removes respect. Only the heart icon toggles.
export function DoubleTapRespect({ respected, onRespect, onOpen, burstSize = 104, children }: { respected: boolean; onRespect: () => void; onOpen: () => void; burstSize?: 64 | 104; children: React.ReactNode }) {
  const s = useSharedValue(0), o = useSharedValue(0), x = useSharedValue(0), y = useSharedValue(0);
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduce); }, []);
  const fire = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (!respected) onRespect(); };
  const burst = (px: number, py: number) => {
    'worklet';
    x.value = px - burstSize / 2; y.value = py - burstSize / 2;
    o.value = withSequence(withTiming(1, { duration: 0 }), withDelay(530, withTiming(0, { duration: 200 })));
    s.value = withSequence(withTiming(0, { duration: 0 }), withSpring(1.2, { damping: 12, stiffness: 220 }), withTiming(1, { duration: 100 }), withDelay(250, withTiming(0.9, { duration: 200, easing: Easing.in(Easing.quad) })));
  };
  const dbl = Gesture.Tap().numberOfTaps(2).maxDelay(250).onEnd((e) => { if (!reduce) burst(e.x, e.y); runOnJS(fire)(); });
  const one = Gesture.Tap().numberOfTaps(1).onEnd(() => runOnJS(onOpen)());
  const style = useAnimatedStyle(() => ({ position: 'absolute', left: x.value, top: y.value, opacity: o.value, transform: [{ scale: s.value }] }));
  return (
    <GestureDetector gesture={Gesture.Exclusive(dbl, one)}>
      <View>{children}<Animated.View pointerEvents="none" style={style}><Heart size={burstSize} color={color.textPrimary} fill={color.brand} /></Animated.View></View>
    </GestureDetector>
  );
}
