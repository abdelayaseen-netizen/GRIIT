import React from "react";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import OnboardingFlowV2 from "@/components/onboarding/v2/OnboardingFlowV2";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FLAGS } from "@/lib/feature-flags";

function OnboardingPageInner() {
  return FLAGS.ONBOARDING_V2 ? <OnboardingFlowV2 /> : <OnboardingFlow />;
}

export default function OnboardingPage() {
  return (
    <ErrorBoundary>
      <OnboardingPageInner />
    </ErrorBoundary>
  );
}
