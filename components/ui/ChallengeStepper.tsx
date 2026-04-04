import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"

const STEPPER_CIRCLE = 28;
const CONNECTOR_HEIGHT = 2;
const BORDER_WIDTH = 2;

interface ChallengeStepperProps {
  currentStep: number;
  totalSteps?: number;
}

export function ChallengeStepper({
  currentStep,
  totalSteps = 3,
}: ChallengeStepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return (
    <View style={s.container}>
      {steps.map((step, index) => {
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        const isInactive = step > currentStep;
        const isLast = index === steps.length - 1;
        return (
          <React.Fragment key={step}>
            <View
              style={[
                s.circle,
                isCompleted && s.circleCompleted,
                isActive && s.circleActive,
                isInactive && s.circleInactive,
              ]}
            >
              {isCompleted ? (
                <Check size={14} color={DS_COLORS.white} strokeWidth={2.5} />
              ) : (
                <Text
                  style={[
                    s.circleText,
                    isActive && s.circleTextActive,
                    isInactive && s.circleTextInactive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
            {!isLast && (
              <View
                style={[
                  s.connector,
                  step < currentStep ? s.connectorCompleted : s.connectorIncomplete,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: STEPPER_CIRCLE,
    height: STEPPER_CIRCLE,
    borderRadius: STEPPER_CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleCompleted: {
    backgroundColor: DS_COLORS.accent,
    borderWidth: 0,
  },
  circleActive: {
    backgroundColor: DS_COLORS.surface,
    borderWidth: BORDER_WIDTH,
    borderColor: DS_COLORS.accent,
  },
  circleInactive: {
    backgroundColor: DS_COLORS.surface,
    borderWidth: BORDER_WIDTH,
    borderColor: DS_COLORS.border,
  },
  circleText: {
    fontSize: 13,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
  },
  circleTextActive: {
    color: DS_COLORS.accent,
  },
  circleTextInactive: {
    color: DS_COLORS.textMuted,
  },
  connector: {
    width: 32,
    height: CONNECTOR_HEIGHT,
    marginHorizontal: DS_SPACING.xs,
    borderRadius: CONNECTOR_HEIGHT / 2,
  },
  connectorCompleted: {
    backgroundColor: DS_COLORS.accent,
  },
  connectorIncomplete: {
    backgroundColor: DS_COLORS.border,
  },
});
