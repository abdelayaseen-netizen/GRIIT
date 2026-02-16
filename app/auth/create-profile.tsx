import React, { useState } from 'react';
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
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';

export default function CreateProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const createProfileMutation = useMutation({
    mutationFn: async (data: { username: string; display_name: string; bio: string }) => {
      console.log('Creating profile with data:', data);
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('Failed to get session:', sessionError);
        throw new Error('SESSION_MISSING');
      }
      
      const userId = sessionData.session.user.id;
      console.log('Got user from session:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username: data.username,
          display_name: data.display_name,
          bio: data.bio,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase profile upsert error:', error);
        const code = (error as any).code;
        if (code === '23505') {
          throw new Error('Username is already taken. Please choose another.');
        }
        throw new Error(error.message || 'Failed to create profile');
      }
      
      console.log('Profile created successfully:', profile);
      return profile;
    },
    onSuccess: () => {
      router.replace('/(tabs)');
    },
    onError: (error: Error) => {
      if (error.message === 'SESSION_MISSING') {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => router.replace('/auth/login' as any) }]
        );
        return;
      }
      Alert.alert('Error', error.message);
    },
  });

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
      return;
    }

    createProfileMutation.mutate({
      username: username.trim().toLowerCase(),
      display_name: displayName.trim() || username.trim(),
      bio: bio.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Your Profile</Text>
            <Text style={styles.subtitle}>Choose a unique username and tell us about yourself</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={styles.input}
                placeholder="johndoe"
                placeholderTextColor={Colors.text.tertiary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!createProfileMutation.isLoading}
              />
              <Text style={styles.hint}>Letters, numbers, and underscores only</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={Colors.text.tertiary}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                editable={!createProfileMutation.isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about yourself..."
                placeholderTextColor={Colors.text.tertiary}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!createProfileMutation.isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, createProfileMutation.isLoading && styles.buttonDisabled]}
              onPress={handleCreateProfile}
              disabled={createProfileMutation.isLoading}
              activeOpacity={0.8}
            >
              {createProfileMutation.isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Continue to GRIT</Text>
              )}
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
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
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  hint: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 6,
  },
  button: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
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
});
