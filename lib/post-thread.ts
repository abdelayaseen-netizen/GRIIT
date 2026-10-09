/** One reply level under a comment. Deeper replies stay on that line. */

export type ThreadNode = {
  id: string;
  parent_id: string | null;
};

export type ThreadRow<T extends ThreadNode> = {
  item: T;
  depth: 0 | 1;
};

export function replyComposerPlaceholder(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0];
  return `Reply to ${first || "them"}`;
}

export function threadRows<T extends ThreadNode>(items: T[]): ThreadRow<T>[] {
  const ids = new Set(items.map((item) => item.id));
  const children = new Map<string | null, T[]>();
  for (const item of items) {
    const parent = item.parent_id && ids.has(item.parent_id) ? item.parent_id : null;
    const list = children.get(parent) ?? [];
    list.push(item);
    children.set(parent, list);
  }
  const out: ThreadRow<T>[] = [];
  const walk = (parent: string | null, depth: 0 | 1) => {
    for (const item of children.get(parent) ?? []) {
      out.push({ item, depth });
      walk(item.id, 1);
    }
  };
  walk(null, 0);
  return out;
}
