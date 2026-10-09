/**
 * Stories-style proof viewer. Port of the v51 step() rules.
 * Day 0 is the newest day.
 */
export type Gesture =
  | "swipeLeft"
  | "swipeRight"
  | "tapLeft"
  | "tapRight"
  | "swipeUp"
  | "swipeDown"
  | "swipeDownHeader"
  | "close";

export type Pos = { day: number; task: number; photo: number };

export function step(
  p: Pos,
  g: Gesture,
  days: { tasks: { photos: number }[] }[],
): Pos | "close" {
  const tasks = days[p.day]?.tasks ?? [];
  switch (g) {
    case "tapRight":
      return p.photo + 1 < (tasks[p.task]?.photos ?? 0) ? { ...p, photo: p.photo + 1 } : step(p, "swipeLeft", days);
    case "tapLeft":
      return p.photo > 0 ? { ...p, photo: p.photo - 1 } : step(p, "swipeRight", days);
    case "swipeLeft":
      return p.task + 1 < tasks.length ? { ...p, task: p.task + 1, photo: 0 } : p;
    case "swipeRight":
      return p.task > 0 ? { ...p, task: p.task - 1, photo: 0 } : p;
    case "swipeDown":
      return p.day + 1 < days.length ? { day: p.day + 1, task: 0, photo: 0 } : p;
    case "swipeUp":
      return p.day > 0 ? { day: p.day - 1, task: 0, photo: 0 } : p;
    default:
      return "close";
  }
}

export type ViewerPhoto = { uri: string | null };
export type ViewerTask = {
  id: string;
  name: string;
  challenge: string;
  dayLine: string;
  shared: boolean;
  respectCount: number;
  commentCount: number;
  capturedAt: string | null;
  photos: ViewerPhoto[];
};
export type ViewerDay = { dateKey: string; tasks: ViewerTask[] };

/** Newest date first. Photos of the same task on a day stay together. */
export function viewerDays(
  items: {
    id: string;
    dateKey: string;
    uri: string;
    taskName: string;
    challengeName: string;
    day: number;
    durationDays: number;
    shared: boolean;
    respectCount?: number;
    commentCount?: number;
    capturedAt: string | null;
  }[],
): ViewerDay[] {
  const dates = [...new Set(items.map((item) => item.dateKey))].sort((a, b) => b.localeCompare(a));
  return dates.map((dateKey) => {
    const rows = items.filter((item) => item.dateKey === dateKey);
    const tasks: ViewerTask[] = [];
    for (const row of rows) {
      const existing = tasks.find((task) => task.name === row.taskName && task.challenge === row.challengeName);
      const photo = { uri: row.uri || null };
      if (existing) {
        existing.photos.push(photo);
        continue;
      }
      tasks.push({
        id: row.id,
        name: row.taskName,
        challenge: row.challengeName,
        dayLine: `Day ${row.day} of ${row.durationDays}`,
        shared: row.shared,
        respectCount: row.respectCount ?? 0,
        commentCount: row.commentCount ?? 0,
        capturedAt: row.capturedAt,
        photos: [photo],
      });
    }
    return { dateKey, tasks };
  });
}

export function neighborUris(days: ViewerDay[], day: number): string[] {
  return [days[day - 1], days[day + 1]]
    .flatMap((entry) => entry?.tasks.flatMap((task) => task.photos.map((photo) => photo.uri)) ?? [])
    .filter((uri): uri is string => Boolean(uri));
}
