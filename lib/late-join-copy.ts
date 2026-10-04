/** 116 Late join copy. Do not paraphrase. */

export const LAUNCHED_TOMORROW_TITLE = "You're in. Day 1 is tomorrow.";
export const LAUNCHED_TODAY_TITLE = "You're in. Day 1 is today.";
export const LAUNCHED_BACK_TODAY = "Back to today";
export const LAUNCHED_BACK_HOME = "Back to Home";
export const LAUNCHED_REMINDER_CAPTION = "15 minutes before the window opens.";

export function launchedTomorrowBody(task: string, a: string, b: string): string {
  return `Tomorrow's first task is ${task}, between ${a} and ${b}. Today still counts for your other challenges.`;
}

export function launchedReminderLabel(time: string): string {
  return `Remind me at ${time}`;
}

export function launchedTodayLine(title: string, days: number): string {
  return `${title}. Day 1 of ${days} is today.`;
}

export function opensAtLine(time: string): string {
  return `Opens at ${time}.`;
}

export function nextTaskLabel(name: string): string {
  return `Next: ${name}`;
}

export function reviewLateJoinLine(window: string): string {
  return `Today's ${window} window has passed. Day 1 is tomorrow.`;
}

export function reviewStartsTomorrow(weekdayDMonth: string): string {
  return `Tomorrow, ${weekdayDMonth}`;
}

export function lateJoinDetailCard(weekdayDMonth: string): string {
  return `Day 1 is tomorrow · ${weekdayDMonth}. Today's window had passed when you started.`;
}

export function homePrestartLine(challenge: string): string {
  return `${challenge} · Starts tomorrow. Nothing to do today.`;
}
