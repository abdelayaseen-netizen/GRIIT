import React from "react";
import { CreateWizardV2 } from "@/components/create/CreateWizardV2";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
