import React from "react";
import { CreateWizardV2 } from "@/components/create/CreateWizardV2";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";

function CreateTabScreenInner() {
  return <CreateWizardV2 />;
}

export default function CreateTabScreen() {
  return (
    <Screen>
      <ErrorBoundary>
        <CreateTabScreenInner />
      </ErrorBoundary>
    </Screen>
  );
}
