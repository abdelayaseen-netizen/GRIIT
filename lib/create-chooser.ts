/**
 * Build 92 chunk 01.3 · Create chooser (P0-14).
 * The Create tab and "+ Create" open a chooser: "Log today's task" / "Create a challenge".
 * Home publishes today's snapshot (next open task, secured) so the chooser can open from
 * any tab. The chooser never opens a post sheet; posts only come from finishing a task.
 */

export const CREATE_CHOOSER_COPY = {
  title: "Create",
  log: "Log today's task",
  create: "Create a challenge",
  createSub: "Pick the tasks, the length and who can join.",
  secured: "Every task today is done.",
} as const;

export type CreateChooserTask = {
  id: string;
  /** Full href of the task screen, built by Home with taskCompleteHref(). */
  href: string;
  title: string;
  challengeName?: string;
  currentDay?: number;
  durationDays?: number;
};

export type CreateChooserToday = {
  todaySecured: boolean;
  nextTask: CreateChooserTask | null;
};

export type CreateChooserRow = {
  id: "log" | "create";
  title: string;
  subtitle: string;
  disabled: boolean;
  href: string | null;
};

function taskLine(task: CreateChooserTask): string {
  const parts = [task.title.trim()];
  const challenge = task.challengeName?.trim();
  if (challenge) parts.push(challenge);
  if (
    typeof task.currentDay === "number" &&
    typeof task.durationDays === "number" &&
    task.currentDay >= 1 &&
    task.durationDays >= 1
  ) {
    parts.push(`Day ${Math.floor(task.currentDay)} of ${Math.floor(task.durationDays)}`);
  }
  return parts.join(" · ");
}

let today: CreateChooserToday = { todaySecured: false, nextTask: null };

/**
 * Rows for the sheet. Secured: the log row is disabled with the done line. No open task
 * and not secured (no challenge yet, or every window closed): the log row is disabled with
 * no line, because the copy table has no string for it and "Create a challenge" is the
 * one thing a first-day user can do here.
 */
export function createChooserRows(snapshot: CreateChooserToday = today): CreateChooserRow[] {
  const log: CreateChooserRow = snapshot.todaySecured
    ? { id: "log", title: CREATE_CHOOSER_COPY.log, subtitle: CREATE_CHOOSER_COPY.secured, disabled: true, href: null }
    : snapshot.nextTask
      ? {
          id: "log",
          title: CREATE_CHOOSER_COPY.log,
          subtitle: taskLine(snapshot.nextTask),
          disabled: false,
          href: snapshot.nextTask.href,
        }
      : { id: "log", title: CREATE_CHOOSER_COPY.log, subtitle: "", disabled: true, href: null };
  const create: CreateChooserRow = {
    id: "create",
    title: CREATE_CHOOSER_COPY.create,
    subtitle: CREATE_CHOOSER_COPY.createSub,
    disabled: false,
    href: null,
  };
  return [log, create];
}

type Listener = (open: boolean) => void;
const listeners = new Set<Listener>();
let open = false;

export function setCreateChooserToday(next: CreateChooserToday): void {
  today = next;
  if (open) for (const l of listeners) l(open);
}

export function createChooserToday(): CreateChooserToday {
  return today;
}

export function isCreateChooserOpen(): boolean {
  return open;
}

export function openCreateChooser(): void {
  if (open) return;
  open = true;
  for (const l of listeners) l(open);
}

export function closeCreateChooser(): void {
  if (!open) return;
  open = false;
  for (const l of listeners) l(open);
}

export function subscribeCreateChooser(listener: Listener): () => void {
  listeners.add(listener);
  listener(open);
  return () => {
    listeners.delete(listener);
  };
}
