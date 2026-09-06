import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TaskFlowV2 } from "@/components/task-v2/TaskFlowV2";

export default function TaskCompleteScreen() {
  return (
    <ErrorBoundary>
      <TaskFlowV2 />
    </ErrorBoundary>
  );
}
