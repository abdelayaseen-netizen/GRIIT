/**
 * Notification task counts at schedule time.
 * Reduce over every active enrollment's tasks due today — not the single
 * "current" challenge.
 */

export type DueTodayEnrollment = {
  tasks: readonly {
    id?: string;
    required?: boolean;
  }[];
};

export type DueTodayCount = {
  due: number;
  done: number;
  remaining: number;
};

export function tasksDueTodayAcrossEnrollments(args: {
  enrollments: readonly DueTodayEnrollment[];
  completedTaskIds: readonly string[];
}): DueTodayCount {
  const doneSet = new Set(args.completedTaskIds.filter(Boolean));
  let due = 0;
  let done = 0;
  for (const enrollment of args.enrollments) {
    for (const task of enrollment.tasks) {
      if ((task.required ?? true) === false) continue;
      if (!task.id) continue;
      due += 1;
      if (doneSet.has(task.id)) done += 1;
    }
  }
  return { due, done, remaining: Math.max(0, due - done) };
}
