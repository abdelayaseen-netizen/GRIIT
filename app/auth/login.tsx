import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { mapAuthError } from "@/lib/auth-helpers";
import { GRIIT_COLORS, GRIIT_RADII } from "@/src/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;
  const inputBorder = (key: string) =>
    focusedField === key ? GRIIT_COLORS.primaryAccent : GRIIT_COLORS.borderLight;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setLoading(false);
        const msg = mapAuthError(error);
        Alert.alert("Login Failed", msg);
        return;
      }

      if (data.session) {
        return;
      }

      setLoading(false);
      Alert.alert("Login Failed", "Something went wrong. Please try again.");
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      Alert.alert("Login Failed", message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: GRIIT_COLORS.background }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.logoArea}>
            <Text style={styles.logo} allowFontScaling={false}>
              G R I I T
            </Text>
            <Text style={styles.tagline}>Build Discipline Daily</Text>
          </View>

          <Text style={styles.formTitle}>Welcome back</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, { borderColor: inputBorder("email"), backgroundColor: GRIIT_COLORS.cardBackground, color: GRIIT_COLORS.textPrimary }]}
              placeholder="you@example.com"
              placeholderTextColor={GRIIT_COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordRow, { borderColor: inputBorder("password"), backgroundColor: GRIIT_COLORS.cardBackground }]}>
              <TextInput
                ref={passwordRef}
                style={[styles.passwordInput, { color: GRIIT_COLORS.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={GRIIT_COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={() => canSubmit && handleLogin()}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                {showPassword ? (
                  <EyeOff size={22} color={GRIIT_COLORS.textSecondary} />
                ) : (
                  <Eye size={22} color={GRIIT_COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => router.push(ROUTES.AUTH_FORGOT_PASSWORD as never)}
              disabled={loading}
            >
              <Text style={styles.forgotLinkText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={!canSubmit || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push(ROUTES.AUTH_SIGNUP as never)}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  logoArea: { alignItems: "center", marginBottom: 32 },
  logo: {
    fontSize: 32,
    fontWeight: "700",
    color: GRIIT_COLORS.textPrimary,
    letterSpacing: 8,
    fontFamily: Platform.OS === "ios" ? "Georgia" : undefined,
  },
  tagline: {
    fontSize: 14,
    color: GRIIT_COLORS.textSecondary,
    marginTop: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: GRIIT_COLORS.textPrimary,
    marginTop: 32,
    marginBottom: 24,
  },
  form: { width: "100%" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: GRIIT_COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: GRIIT_RADII.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: GRIIT_RADII.card,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  forgotLink: { alignSelf: "flex-end", marginBottom: 16 },
  forgotLinkText: { fontSize: 14, fontWeight: "500", color: GRIIT_COLORS.primaryAccent },
  button: {
    backgroundColor: GRIIT_COLORS.primaryAccent,
    borderRadius: GRIIT_RADII.buttonPill,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: { fontSize: 14, color: GRIIT_COLORS.textSecondary },
  footerLink: { fontSize: 14, fontWeight: "600", color: GRIIT_COLORS.primaryAccent },
});
