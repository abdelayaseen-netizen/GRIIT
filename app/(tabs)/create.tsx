import React from "react";
import { ProposalScreen } from "@/components/create/proposal";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Create tab — renders the proposal-pattern, single-screen curated proposal.
 * The legacy 3-step wizard and the older 4-step wizard are kept in the repo
 * for one ship cycle as fallback and can be deleted once the proposal flow is
 * verified in production.
 */
function CreateTabScreenInner() {
  return <ProposalScreen />;
}

export default function CreateTabScreen() {
  return (
    <ErrorBoundary>
      <CreateTabScreenInner />
    </ErrorBoundary>
  );
}
