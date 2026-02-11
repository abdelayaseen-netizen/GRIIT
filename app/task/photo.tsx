import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Camera, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from 'expo-image-picker';
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";

export default function PhotoTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { activeChallenge, completeTask } = useApp();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSubmit = async () => {
    if (!photoUri) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }

    if (!activeChallenge) {
      Alert.alert('Error', 'No active challenge found');
      return;
    }

    if (!taskId) {
      Alert.alert('Error', 'Task not found');
      return;
    }

    setLoading(true);
    try {
      completeTask({
        activeChallengeId: activeChallenge.id,
        taskId,
        proofUrl: photoUri,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success!', 'Photo proof submitted', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Camera size={64} color={Colors.text.tertiary} />
            <Text style={styles.placeholderText}>No photo taken yet</Text>
          </View>
        )}

        {!photoUri && (
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePhoto}
            activeOpacity={0.8}
          >
            <Camera size={24} color="#fff" />
            <Text style={styles.captureButtonText}>Take Photo</Text>
          </TouchableOpacity>
        )}

        {photoUri && (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Check size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 15,
    color: Colors.text.tertiary,
    marginTop: 12,
  },
  previewContainer: {
    flex: 1,
    marginBottom: 16,
  },
  preview: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#000',
  },
  retakeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  retakeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
  },
  captureButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
