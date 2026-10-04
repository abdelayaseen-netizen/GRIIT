import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";
import { TaskFlowV2 } from "@/components/task-v2/TaskFlowV2";

export default function TaskCompleteScreen() {
  return (
    <Screen>
      <ErrorBoundary>
        <TaskFlowV2 />
      </ErrorBoundary>
    </Screen>
  );
}
