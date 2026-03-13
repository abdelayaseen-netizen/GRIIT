import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";

const STEPPER_CIRCLE = 28;
const CONNECTOR_HEIGHT = 4;
const GREEN = "#2F7A52";
const ORANGE = "#E07B4A";
const GRAY = "#D0CEC8";

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
                <Check size={16} color="#fff" strokeWidth={2.5} />
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
    backgroundColor: GREEN,
  },
  circleActive: {
    backgroundColor: ORANGE,
  },
  circleInactive: {
    backgroundColor: GRAY,
  },
  circleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  circleTextActive: {
    color: "#fff",
  },
  circleTextInactive: {
    color: "#888884",
  },
  connector: {
    width: 32,
    height: CONNECTOR_HEIGHT,
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: GREEN,
  },
  connectorIncomplete: {
    backgroundColor: GRAY,
  },
});
