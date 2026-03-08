import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Crown, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";

interface PremiumPaywallModalProps {
  visible: boolean;
  onClose: () => void;
  /** Short title for the feature (e.g. "Unlimited challenges") */
  featureTitle?: string;
}

/**
 * Soft paywall modal: explains the feature and offers upgrade.
 * Purchase flow not implemented — shows "Coming Soon" / link to upgrade when ready.
 */
export function PremiumPaywallModal({
  visible,
  onClose,
  featureTitle = "This feature",
}: PremiumPaywallModalProps) {
  const { colors } = useTheme();

  const handleClose = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={22} color={colors.text.tertiary} />
          </TouchableOpacity>
          <View style={[styles.iconWrap, { backgroundColor: colors.accent + "18" }]}>
            <Crown size={32} color={colors.accent} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {featureTitle} is Premium
          </Text>
          <Text style={[styles.body, { color: colors.text.secondary }]}>
            Upgrade to unlock this and more. Coming soon.
          </Text>
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: colors.accent }]}
            onPress={handleClose}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  cta: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
