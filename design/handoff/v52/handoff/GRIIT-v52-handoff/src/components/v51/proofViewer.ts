// v51 · stories-style proof viewer
export type Gesture = 'swipeLeft' | 'swipeRight' | 'tapLeft' | 'tapRight' | 'swipeUp' | 'swipeDown' | 'swipeDownHeader' | 'close';
export type Pos = { day: number; task: number; photo: number }; // day 0 = newest
export function step(p: Pos, g: Gesture, days: { tasks: { photos: number }[] }[]): Pos | 'close' {
  const tasks = days[p.day].tasks;
  switch (g) {
    case 'tapRight': return p.photo + 1 < tasks[p.task].photos ? { ...p, photo: p.photo + 1 } : step(p, 'swipeLeft', days);
    case 'tapLeft': return p.photo > 0 ? { ...p, photo: p.photo - 1 } : step(p, 'swipeRight', days);
    case 'swipeLeft': return p.task + 1 < tasks.length ? { ...p, task: p.task + 1, photo: 0 } : p;
    case 'swipeRight': return p.task > 0 ? { ...p, task: p.task - 1, photo: 0 } : p;
    case 'swipeDown': return p.day + 1 < days.length ? { day: p.day + 1, task: 0, photo: 0 } : p; // previous (older) day
    case 'swipeUp': return p.day > 0 ? { day: p.day - 1, task: 0, photo: 0 } : p;
    default: return 'close'; // X or drag down starting on the header row
  }
}
