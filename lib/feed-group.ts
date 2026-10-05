/** Consecutive started/finished events for one challenge merge. At most one activity group per `every` posts. */

export type FeedGroupItem = {
  kind: "post" | "activity";
  challengeId?: string;
  verb?: string;
};

export type FeedActivityGroup<T> = { kind: "group"; members: T[] };

export function groupActivity<T extends FeedGroupItem>(
  items: T[],
  every = 4,
): (T | FeedActivityGroup<T>)[] {
  const out: (T | FeedActivityGroup<T>)[] = [];
  let sinceGroup = every;
  for (const it of items) {
    if (it.kind !== "activity") {
      out.push(it);
      sinceGroup += 1;
      continue;
    }
    const last = out[out.length - 1];
    if (last && isGroup(last) && last.members[0]?.challengeId === it.challengeId && last.members[0]?.verb === it.verb) {
      last.members.push(it);
      continue;
    }
    if (sinceGroup < every) continue;
    out.push({ kind: "group", members: [it] });
    sinceGroup = 0;
  }
  return out;
}

function isGroup<T extends FeedGroupItem>(item: T | FeedActivityGroup<T>): item is FeedActivityGroup<T> {
  return item.kind === "group";
}

export function activityText(names: string[], verb: string, challenge: string): string {
  const head = names.slice(0, 3);
  const extra = names.length - head.length;
  const who =
    extra > 0
      ? `${head.join(", ")} and ${extra} ${extra === 1 ? "other" : "others"}`
      : head.length <= 1
        ? (head[0] ?? "")
        : `${head.slice(0, -1).join(", ")} and ${head[head.length - 1]}`;
  return `${who} ${verb} ${challenge}`;
}
