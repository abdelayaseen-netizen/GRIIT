import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { DS_COLORS_V2, DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import { styles } from "../taskFlowStyles";

type Props = {
  photoUri: string;
  challengeName: string;
  currentDay: number;
  taskName: string;
  gateLabel: string;
  caption: string;
  onCaption: (t: string) => void;
  onRetake: () => void;
  onPost: () => void;
};

export function ReviewStep({
  photoUri,
  challengeName,
  taskName,
  caption,
  onCaption,
  onRetake,
  onPost,
}: Props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.finder}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        <Pressable onPress={onRetake} accessibilityRole="button" accessibilityLabel="Retake" style={styles.retake}>
          <Text style={styles.retakeText}>Retake</Text>
        </Pressable>
        <LinearGradient colors={["transparent", "rgba(10,10,10,0.82)"]} style={styles.capOverlay}>
          <Text style={styles.cap70} numberOfLines={1}>
            {challengeName}
          </Text>
          <Text style={styles.cap92} numberOfLines={1}>
            {taskName}
          </Text>
          {caption ? (
            <Text style={styles.cap100} numberOfLines={1}>
              {caption}
            </Text>
          ) : null}
        </LinearGradient>
      </View>
      <View style={styles.reviewDeck}>
        <View style={styles.capRow}>
          <TextInput
            value={caption}
            onChangeText={(t) => onCaption(t.slice(0, 120))}
            placeholder="Add a caption"
            placeholderTextColor={DS_V3.color.textSecondary}
            selectionColor={DS_COLORS_V2.brand.primary}
            style={styles.capInput}
            maxLength={120}
          />
          <Text style={styles.counter}>{caption.length} / 120</Text>
        </View>
        <Button label="Post proof" onPress={onPost} />
      </View>
    </View>
  );
}
