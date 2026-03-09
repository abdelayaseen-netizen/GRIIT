import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleLogin = async () => {
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      isSubmittingRef.current = false;
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log('SIGNIN: attempting with', trimmedEmail);

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('SIGNIN: error:', error.message, error.status);
        Alert.alert('Login Failed', error.message);
        return;
      }

      if (data?.session) {
        console.log('SIGNIN: success, session:', data.session.user?.id);
        // Auth state will update; redirector will send user to create-profile or (tabs)
      } else {
        console.error('SIGNIN: no session after signInWithPassword');
        Alert.alert('Login Failed', 'No session returned. If you just signed up, check your email to confirm, or disable "Confirm email" in Supabase Auth settings.');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An unexpected error occurred';
      console.error('SIGNIN: exception:', message, e);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.logo, { color: themeColors.text.primary }]}>GRIIT</Text>
            <Text style={[styles.tagline, { color: themeColors.text.secondary }]}>Find your next commitment.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text.primary }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text.primary }]}
                placeholder="your@email.com"
                placeholderTextColor={themeColors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text.primary }]}>Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text.primary }]}
                placeholder="••••••••"
                placeholderTextColor={themeColors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.accent }, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
              <Text style={[styles.dividerText, { color: themeColors.text.tertiary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={() => router.push('/auth/signup' as any)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: themeColors.text.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text.primary,
  },
  button: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.tertiary,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
});
