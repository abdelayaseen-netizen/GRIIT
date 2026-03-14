import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_COLORS as C } from '@/constants/onboarding-theme';
import { useOnboardingStore } from '@/store/onboarding-store';

import ValueSplash from './screens/ValueSplash';
import GoalSelection from './screens/GoalSelection';
import IntensitySelection from './screens/IntensitySelection';
import ChallengePreview from './screens/ChallengePreview';
import SignUpScreen from './screens/SignUpScreen';
import UsernameScreen from './screens/UsernameScreen';
import ReadyScreen from './screens/ReadyScreen';
import ProgressDots from './ProgressDots';

export default function OnboardingFlow() {
  const { currentStep, nextStep, prevStep, completeOnboarding } = useOnboardingStore();
  const [authUserId, setAuthUserId] = useState<string>('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  // Steps: 0=Splash, 1=Goals, 2=Intensity, 3=ChallengePreview, 4=SignUp, 5=Username, 6=Ready
  const showProgressDots = currentStep >= 1 && currentStep <= 5;
  const showBackButton = currentStep >= 1 && currentStep <= 4;

  const handleAuthSuccess = useCallback((userId: string) => {
    setAuthUserId(userId);
    nextStep(); // Move from SignUp (4) → Username (5)
  }, [nextStep]);

  const handleProfileComplete = useCallback((usernameValue: string) => {
    setUsername(usernameValue);
    nextStep(); // Move from Username (5) → Ready (6)
  }, [nextStep]);

  const handleStartApp = useCallback(async () => {
    completeOnboarding();
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
    } catch (e) {
      console.error('Failed to save onboarding state:', e);
    }
    router.replace('/(tabs)');
  }, [completeOnboarding, router]);

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return <ValueSplash onContinue={nextStep} />;
      case 1:
        return <GoalSelection onContinue={nextStep} />;
      case 2:
        return <IntensitySelection onContinue={nextStep} />;
      case 3:
        return <ChallengePreview onContinue={nextStep} />;
      case 4:
        return <SignUpScreen onAuthSuccess={handleAuthSuccess} />;
      case 5:
        return <UsernameScreen authUserId={authUserId} onComplete={handleProfileComplete} />;
      case 6:
        return <ReadyScreen username={username} onStart={handleStartApp} />;
      default:
        return <ValueSplash onContinue={nextStep} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {(showProgressDots || showBackButton) && (
        <View style={styles.topBar}>
          {showBackButton ? (
            <Pressable style={styles.backButton} onPress={prevStep}>
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}
          {showProgressDots && <ProgressDots total={5} current={currentStep - 1} />}
          <View style={styles.backButtonPlaceholder} />
        </View>
      )}
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 4 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backButtonText: { fontSize: 22, color: C.textSecondary },
  backButtonPlaceholder: { width: 40 },
});
