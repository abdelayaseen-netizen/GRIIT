import React from "react";
import type { SubmitResult } from "@/lib/task-completion-result";
import { TaskConfirmation } from "../TaskConfirmation";

type Props = {
  result: SubmitResult;
  taskName: string;
  honest: boolean;
  optional: boolean;
  proofUri?: string;
  verifyLine: string;
  onDone: () => void;
  onShare: (uri: string) => void;
};

export function ConfirmationStep({
  result,
  taskName,
  honest,
  optional,
  proofUri,
  verifyLine,
  onDone,
  onShare,
}: Props) {
  return (
    <TaskConfirmation
      result={result}
      taskName={taskName}
      honest={honest}
      optional={optional}
      proofUri={proofUri}
      verifyLine={verifyLine}
      onDone={onDone}
      onNext={onDone}
      onShare={onShare}
    />
  );
}
