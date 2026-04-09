import React from "react";
import CreateChallengeWizard from "@/components/create/CreateChallengeWizard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Create tab: render wizard in-tab so navigation always works (modal /redirect was unreliable).
 */
function CreateTabScreenInner() {
  return <CreateChallengeWizard />;
}

export default function CreateTabScreen() {
  return (
    <ErrorBoundary>
      <CreateTabScreenInner />
    </ErrorBoundary>
  );
}
