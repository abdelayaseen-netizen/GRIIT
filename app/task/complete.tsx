/**
 * Unified task completion screen — one primary interaction per task type,
 * verification add-ons, and a clear success state.
 */

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TaskCompleteScreenInner } from "@/hooks/useTaskCompleteScreen";

export type { TaskCompleteConfig } from "@/lib/task-helpers";

export default function TaskCompleteScreen() {
  return (
    <ErrorBoundary>
      <TaskCompleteScreenInner />
    </ErrorBoundary>
  );
}
