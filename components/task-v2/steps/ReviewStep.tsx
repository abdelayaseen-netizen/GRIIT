import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import KeyboardDock from "@/components/ds/KeyboardDock";
import { Image } from "expo-image";
import Button from "@/components/ds/Button";
import { styles } from "../taskFlowStyles";

// Build 92 02.1: the review only shows the photo. Caption and audience live on the post sheet,
// which opens after Done (P1-01), so the audience is asked once.
const REVIEW_DONE = "Done";

type Props = {
  photoUri: string;
  challengeName: string;
  currentDay: number;
  taskName: string;
  gateLabel: string;
  onRetake: () => void;
  onPost: () => void;
  submitting?: boolean;
  /** One line when the post cannot go out. The button stays tappable. */
  note?: string | null;
};

export function ReviewStep({ photoUri, onRetake, onPost, submitting = false, note }: Props) {
  return (
    <KeyboardDock
      footer={
        <View style={styles.reviewDeck}>
          {note ? <Text style={styles.counter}>{note}</Text> : null}
          <Button label={REVIEW_DONE} submitting={submitting} disabled={submitting} onPress={onPost} testID="review-done" />
        </View>
      }
    >
    <View style={styles.reviewPhoto}>
      <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <Pressable onPress={onRetake} accessibilityRole="button" accessibilityLabel="Retake" style={styles.retake}>
        <Text style={styles.retakeText}>Retake</Text>
      </Pressable>
    </View>
    </KeyboardDock>
  );
}
