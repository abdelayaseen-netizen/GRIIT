import React from "react";
import OnboardingFlowV2 from "@/components/onboarding/v2/OnboardingFlowV2";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function OnboardingPageInner() {
  return <OnboardingFlowV2 />;
}

export default function OnboardingPage() {
  return (
    <ErrorBoundary>
      <OnboardingPageInner />
    </ErrorBoundary>
  );
}
