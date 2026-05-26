import React from "react";
import { CreateWizardV2 } from "@/components/create/CreateWizardV2";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Create tab — renders CreateWizardV2 (3-step). The legacy 4-step wizard
 * (`CreateChallengeWizard.tsx`) is kept in the repo with a deprecation
 * comment for one ship cycle and can be deleted once v2 is verified in prod.
 */
function CreateTabScreenInner() {
  return <CreateWizardV2 />;
}

export default function CreateTabScreen() {
  return (
    <ErrorBoundary>
      <CreateTabScreenInner />
    </ErrorBoundary>
  );
}
