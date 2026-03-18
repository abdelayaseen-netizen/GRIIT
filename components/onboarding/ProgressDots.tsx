import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_SPACING as S } from '@/constants/onboarding-theme';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.dotActive,
            i < current && styles.dotCompleted,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: S.progressDotGap,
    paddingVertical: 12,
  },
  dot: {
    width: S.progressDotSize,
    height: S.progressDotSize,
    borderRadius: S.progressDotSize / 2,
    backgroundColor: C.DISABLED_BG,
    borderWidth: 1,
    borderColor: C.DISABLED_BG,
  },
  dotActive: {
    backgroundColor: C.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 0,
  },
  dotCompleted: {
    backgroundColor: C.success,
    borderColor: C.success,
  },
});
