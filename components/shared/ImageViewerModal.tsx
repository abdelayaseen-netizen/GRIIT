import React from "react";
import { Image } from "expo-image";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Pressable,
  Platform,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_COLORS } from "@/lib/design-system";

const { width: VIEWPORT_W, height: VIEWPORT_H } = Dimensions.get("window");

export interface ImageViewerModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export function ImageViewerModal({ visible, imageUri, onClose }: ImageViewerModalProps) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startTX = useSharedValue(0);
  const startTY = useSharedValue(0);

  React.useEffect(() => {
    if (!visible) {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    }
    // Reanimated shared values are mutable refs; listing them would not change effect semantics.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedImageContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      scale.value = Math.min(4, Math.max(1, next));
    })
    .onEnd(() => {
      if (scale.value < 1.2) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      startTX.value = translateX.value;
      startTY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = startTX.value + e.translationX;
        translateY.value = startTY.value + e.translationY;
      }
    })
    .onEnd((e) => {
      if (scale.value <= 1.01 && e.translationY >= 80) {
        runOnJS(onClose)();
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const topPad = Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : insets.top + 8;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {visible ? <StatusBar hidden /> : null}
      <GestureHandlerRootView style={styles.backdrop}>
        <View style={styles.backdropInner}>
          <GestureDetector gesture={composed}>
            <Animated.View
              style={[styles.imageWrap, { width: VIEWPORT_W, height: VIEWPORT_H }, animatedImageContainerStyle]}
            >
              <Image
                source={{ uri: imageUri }}
                style={{ width: VIEWPORT_W, height: VIEWPORT_H }}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={150}
                accessibilityLabel="Full size proof photo"
                accessibilityRole="image"
              />
            </Animated.View>
          </GestureDetector>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close image viewer"
            accessibilityRole="button"
            hitSlop={8}
            style={[
              styles.closeBtn,
              {
                top: topPad,
                right: Math.max(16, insets.right),
              },
            ]}
          >
            <X size={24} color={DS_COLORS.WHITE} />
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: DS_COLORS.BG_DARK,
  },
  backdropInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: DS_COLORS.OVERLAY_WHITE_15,
    zIndex: 10,
  },
});
