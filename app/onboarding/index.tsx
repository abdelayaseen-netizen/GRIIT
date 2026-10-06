import React from "react";
import OnboardingFlowV2 from "@/components/onboarding/v2/OnboardingFlowV2";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";

function OnboardingPageInner() {
  return <OnboardingFlowV2 />;
}

export default function OnboardingPage() {
  return (
    <Screen>
      <ErrorBoundary>
        <OnboardingPageInner />
      </ErrorBoundary>
    </Screen>
  );
}
