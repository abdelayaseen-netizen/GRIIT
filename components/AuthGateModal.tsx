import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system"
import { colors, spacing, radius } from "@/lib/theme/tokens";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export type GateContext =
  | "join"
  | "secure"
  | "respect"
  | "nudge"
  | "create"
  | "team"
  | "other";

type AuthGateModalProps = {
  visible: boolean;
  onClose: () => void;
  context: GateContext;
};

const BENEFITS = [
  "Join challenges",
  "Protect your streak",
  "Earn ranks",
];

export function AuthGateModal({ visible, onClose, context: _context }: AuthGateModalProps) {
  const router = useRouter();

  const openSignup = () => {
    onClose();
    router.push(ROUTES.AUTH_SIGNUP as never);
  };

  const openLogin = () => {
    onClose();
    router.push(ROUTES.AUTH_LOGIN as never);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.centered}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign up to commit.</Text>
          <Text style={styles.subtitle}>
            Create an account to join challenges, secure your streak, and compete.
          </Text>
          <View style={styles.bullets}>
            {BENEFITS.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
          <PrimaryButton
            title="Continue with email"
            onPress={openLogin}
            variant="black"
            style={styles.primaryBtn}
            accessibilityLabel="Sign in with email"
          />
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={openSignup}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sign up with email"
          >
            <Text style={styles.secondaryBtnText}>Sign up with email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tertiaryBtn}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Continue as guest"
          >
            <Text style={styles.tertiaryBtnText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_COLORS.MODAL_BACKDROP,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.cardLarge,
    padding: spacing.xxl,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  title: {
    fontSize: 24,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  bullets: {
    marginBottom: 24,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  bullet: {
    fontSize: 16,
    color: colors.accentOrange,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  primaryBtn: {
    marginBottom: 12,
  },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.primaryButton,
    marginBottom: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: colors.textPrimary,
  },
  tertiaryBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  tertiaryBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textSecondary,
  },
});
