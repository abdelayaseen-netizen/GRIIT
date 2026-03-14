import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

const STEPPER_CIRCLE = 28;
const CONNECTOR_HEIGHT = 4;

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
                <Check size={16} color={DS_COLORS.white} strokeWidth={2.5} />
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
                  isCompleted && s.connectorCompleted,
                  !isCompleted && s.connectorIncomplete,
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
    backgroundColor: DS_COLORS.success,
  },
  circleActive: {
    backgroundColor: DS_COLORS.accent,
  },
  circleInactive: {
    backgroundColor: DS_COLORS.stepperGray,
  },
  circleText: {
    fontSize: 14,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  circleTextActive: {
    color: DS_COLORS.white,
  },
  circleTextInactive: {
    color: DS_COLORS.inputPlaceholder,
  },
  connector: {
    width: 32,
    height: CONNECTOR_HEIGHT,
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: DS_COLORS.success,
  },
  connectorIncomplete: {
    backgroundColor: DS_COLORS.stepperGray,
  },
});
