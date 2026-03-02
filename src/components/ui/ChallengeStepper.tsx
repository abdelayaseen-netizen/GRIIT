import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import * as t from "@/src/theme/tokens";

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
                <Check size={18} color={t.colors.white} strokeWidth={2.5} />
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
    width: t.measures.stepperCircle,
    height: t.measures.stepperCircle,
    borderRadius: t.measures.stepperCircle / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleCompleted: {
    backgroundColor: t.colors.accentGreen,
  },
  circleActive: {
    backgroundColor: t.colors.accentOrangeCreate,
  },
  circleInactive: {
    backgroundColor: t.colors.chipFill,
  },
  circleText: {
    fontSize: 14,
    fontWeight: "700",
    color: t.colors.textPrimary,
  },
  circleTextActive: {
    color: t.colors.white,
  },
  circleTextInactive: {
    color: t.colors.textSecondaryCreate,
  },
  connector: {
    width: 40,
    height: t.measures.stepperConnectorHeight,
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: t.colors.accentGreen,
  },
  connectorIncomplete: {
    backgroundColor: t.colors.borderLight,
  },
});
