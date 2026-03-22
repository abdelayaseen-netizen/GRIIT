import React from "react";
import CreateChallengeWizard from "@/components/create/CreateChallengeWizard";

/**
 * Create tab: render wizard in-tab so navigation always works (modal /redirect was unreliable).
 */
export default function CreateTabScreen() {
  return <CreateChallengeWizard />;
}
