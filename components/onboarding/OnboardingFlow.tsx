import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_COLORS as C } from '@/constants/onboarding-theme';
import { useOnboardingStore } from '@/store/onboarding-store';

import ValueSplash from './screens/ValueSplash';
import GoalSelection from './screens/GoalSelection';
import SignUpScreen from './screens/SignUpScreen';
import AutoSuggestChallengeScreen from './screens/AutoSuggestChallengeScreen';
import ProgressDots from './ProgressDots';

export default function OnboardingFlow() {
  const { currentStep, nextStep, prevStep, completeOnboarding } = useOnboardingStore();
  const [authUserId, setAuthUserId] = useState<string>('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  // Compressed: 0=Splash, 1=Goals, 2=SignUp+Username, 3=AutoSuggestChallenge
  const showProgressDots = currentStep >= 1 && currentStep <= 3;
  const showBackButton = currentStep >= 1 && currentStep <= 3;

  const handleSignUpComplete = useCallback((userId: string, usernameValue: string) => {
    setAuthUserId(userId);
    setUsername(usernameValue);
    nextStep(); // Move from SignUp (2) → AutoSuggestChallenge (3)
  }, [nextStep]);

  const finishOnboardingAndGoTo = useCallback((path: string) => async () => {
    const { track } = await import('@/lib/analytics');
    track({ name: 'onboarding_completed' });
    completeOnboarding();
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
    } catch (e) {
      console.error('Failed to save onboarding state:', e);
    }
    router.replace(path as never);
  }, [completeOnboarding, router]);

  const handleStartApp = finishOnboardingAndGoTo('/(tabs)');
  const handleBrowseMore = finishOnboardingAndGoTo('/(tabs)/discover');

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return <ValueSplash onContinue={nextStep} />;
      case 1:
        return <GoalSelection onContinue={nextStep} />;
      case 2:
        return <SignUpScreen onAuthSuccess={handleSignUpComplete} />;
      case 3:
        return <AutoSuggestChallengeScreen onJoinComplete={handleStartApp} onBrowseMore={handleStartApp} />;
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
          {showProgressDots && <ProgressDots total={4} current={currentStep} />}
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
