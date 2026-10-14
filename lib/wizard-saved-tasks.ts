/** Pack tasks and custom tasks are both saved. A repeated name is kept once. */
export function savedWizardTasks<T extends { name: string }>(
  packTasks: readonly T[] | null | undefined,
  customTasks: readonly T[],
): T[] {
  const pack = [...(packTasks ?? [])];
  const seen = new Set(pack.map((task) => task.name.trim().toLowerCase()).filter(Boolean));
  const extra = customTasks.filter((task) => {
    const name = task.name.trim().toLowerCase();
    if (!name || seen.has(name)) return false;
    seen.add(name);
    return true;
  });
  return [...pack, ...extra];
}

export function canSaveWizardTasks(tasks: readonly { name: string }[]): boolean {
  return tasks.length > 0 && tasks.every((task) => task.name.trim().length > 0);
}
