import React from "react";
import { TaskVerifying } from "../TaskVerifying";
import { verifyingLine } from "@/lib/task-flow-state";

type Props = { taskType: string };

export function VerifyingStep({ taskType }: Props) {
  return <TaskVerifying line={verifyingLine(taskType)} />;
}
