import React from "react";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function OnboardingPageInner() {
  return <OnboardingFlow />;
}

export default function OnboardingPage() {
  return (
    <ErrorBoundary>
      <OnboardingPageInner />
    </ErrorBoundary>
  );
}
