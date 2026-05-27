/**
 * Returns true when the "caption" is actually the task description leaking through
 * (matches the task name verbatim, or a small set of generic backend strings).
 * Suppress these — only show real user captions.
 */
export function isFakeCaption(
  caption: string | null | undefined,
  taskName: string | null | undefined,
): boolean {
  if (!caption) return true;
  const c = caption.trim().toLowerCase();
  if (c.length === 0) return true;
  // Backend has historically emitted task names directly as captions.
  if (taskName && c === taskName.trim().toLowerCase()) return true;
  // Known generic strings that have leaked from the task config.
  const generics = [
    "drink water and post a photo",
    "post a photo",
    "complete this task",
    "log today",
    "check in",
  ];
  return generics.includes(c);
}
