import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS_COLORS } from "@/lib/design-system";

interface CommitModalProps {
  visible: boolean;
  challengeName: string;
  taskCount: number;
  durationDays: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CommitModal({
  visible,
  challengeName,
  taskCount,
  durationDays,
  onConfirm,
  onCancel,
}: CommitModalProps) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!visible) setAgreed(false);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: DS_COLORS.MODAL_BACKDROP,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: DS_COLORS.CARD_BG,
            borderRadius: 24,
            paddingVertical: 32,
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>🤝</Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: DS_COLORS.TEXT_PRIMARY,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Commit to the grind
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: DS_COLORS.TEXT_SECONDARY,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 24,
            }}
          >
            You&apos;re about to start{" "}
            <Text style={{ fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY }}>{challengeName}</Text>. Show up every day
            — no excuses, no shortcuts.
          </Text>

          <View
            style={{
              backgroundColor: DS_COLORS.WARM_CREAM,
              borderRadius: 14,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 10 }}>
              Your commitment:
            </Text>
            {[
              `Complete all ${taskCount} daily tasks`,
              `Show up for ${durationDays} consecutive days`,
              "Post proof when required",
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: DS_COLORS.PRIMARY,
                    marginTop: 7,
                  }}
                />
                <Text style={{ fontSize: 14, color: DS_COLORS.TEXT_SECONDARY, lineHeight: 22, flex: 1 }}>{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            accessibilityLabel="Agree to commitment"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 20, paddingVertical: 8 }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: agreed ? DS_COLORS.PRIMARY : DS_COLORS.BORDER,
                backgroundColor: agreed ? DS_COLORS.PRIMARY : DS_COLORS.TRANSPARENT,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {agreed ? <Ionicons name="checkmark" size={14} color={DS_COLORS.TEXT_ON_DARK} /> : null}
            </View>
            <Text style={{ fontSize: 14, color: DS_COLORS.TEXT_PRIMARY, flex: 1 }}>
              I understand this is a commitment and I&apos;m ready to show up.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={agreed ? onConfirm : undefined}
            disabled={!agreed}
            accessibilityLabel="Confirm launch"
            accessibilityRole="button"
            accessibilityState={{ disabled: !agreed }}
            style={{
              width: "100%",
              height: 54,
              borderRadius: 28,
              backgroundColor: agreed ? DS_COLORS.TEXT_PRIMARY : DS_COLORS.DISABLED_BG,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Ionicons name="send" size={16} color={DS_COLORS.TEXT_ON_DARK} />
            <Text style={{ fontSize: 17, fontWeight: "600", color: DS_COLORS.TEXT_ON_DARK }}>I&apos;m in. Launch it.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancel}
            accessibilityLabel="Go back without launching"
            accessibilityRole="button"
            style={{ marginTop: 14, alignItems: "center" }}
          >
            <Text style={{ fontSize: 14, color: DS_COLORS.TEXT_SECONDARY }}>Not yet, go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
