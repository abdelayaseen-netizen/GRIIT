import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import {
  CREATE_CHOOSER_COPY,
  closeCreateChooser,
  createChooserRows,
  isCreateChooserOpen,
  openCreateChooser,
  setCreateChooserToday,
  subscribeCreateChooser,
} from "@/lib/create-chooser";

// Build 92 chunk 01.3 (P0-14): the Create tab and "+ Create" open a chooser with
// "Log today's task" and "Create a challenge". Never a post sheet.
describe("create chooser rows", () => {
  it("offers the next open task with its challenge and day", () => {
    const rows = createChooserRows({
      todaySecured: false,
      nextTask: {
        id: "t1",
        href: "/task/complete?taskId=t1",
        title: "Read 10 pages",
        challengeName: "Read 30",
        currentDay: 16,
        durationDays: 30,
      },
    });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: "log",
      title: "Log today's task",
      subtitle: "Read 10 pages · Read 30 · Day 16 of 30",
      disabled: false,
    });
    expect(rows[1]).toMatchObject({
      id: "create",
      title: "Create a challenge",
      subtitle: "Pick the tasks, the length and who can join.",
      disabled: false,
    });
  });

  it("disables the log row with the done line when today is secured", () => {
    const rows = createChooserRows({ todaySecured: true, nextTask: null });
    expect(rows[0]).toMatchObject({
      id: "log",
      subtitle: "Every task today is done.",
      disabled: true,
    });
    expect(rows[1]?.disabled).toBe(false);
  });

  it("disables the log row with no line when there is no open task", () => {
    const rows = createChooserRows({ todaySecured: false, nextTask: null });
    expect(rows[0]).toMatchObject({ id: "log", subtitle: "", disabled: true });
  });

  it("leaves the day off when the challenge has no day numbers", () => {
    const rows = createChooserRows({
      todaySecured: false,
      nextTask: { id: "t1", href: "/x", title: "Walk 7,000 steps", challengeName: "7K Steps" },
    });
    expect(rows[0]?.subtitle).toBe("Walk 7,000 steps · 7K Steps");
  });

  it("copy is word for word from the Part 0 table", () => {
    expect(CREATE_CHOOSER_COPY.title).toBe("Create");
    expect(CREATE_CHOOSER_COPY.log).toBe("Log today's task");
    expect(CREATE_CHOOSER_COPY.create).toBe("Create a challenge");
    expect(CREATE_CHOOSER_COPY.createSub).toBe("Pick the tasks, the length and who can join.");
    expect(CREATE_CHOOSER_COPY.secured).toBe("Every task today is done.");
    for (const s of Object.values(CREATE_CHOOSER_COPY)) expect(s).not.toContain("!");
  });
});

describe("create chooser store", () => {
  beforeEach(() => closeCreateChooser());

  it("opens, notifies, and closes", () => {
    const seen: boolean[] = [];
    const off = subscribeCreateChooser((open) => seen.push(open));
    openCreateChooser();
    expect(isCreateChooserOpen()).toBe(true);
    closeCreateChooser();
    expect(isCreateChooserOpen()).toBe(false);
    off();
    expect(seen).toEqual([false, true, false]);
  });

  it("keeps the latest Home snapshot for the rows", () => {
    setCreateChooserToday({ todaySecured: true, nextTask: null });
    expect(createChooserRows()[0]?.subtitle).toBe("Every task today is done.");
    setCreateChooserToday({ todaySecured: false, nextTask: null });
    expect(createChooserRows()[0]?.disabled).toBe(true);
  });
});

describe("create path never opens a post sheet", () => {
  it("the chooser component routes to the task or the Create wizard only", () => {
    const src = readFileSync(resolve(__dirname, "../components/create/CreateChooser.tsx"), "utf8");
    expect(src).toContain("ROUTES.CREATE_WIZARD");
    expect(src).not.toMatch(/PostChoice|ShareSystemSheet|post-choice|postSheet/i);
  });

  it("the Create tab opens the chooser instead of the wizard, and the tab stays put", () => {
    const layout = readFileSync(resolve(__dirname, "../app/(tabs)/_layout.tsx"), "utf8");
    expect(layout).toContain("openCreateChooser()");
    expect(layout).not.toContain("router.push(ROUTES.TABS_CREATE");
    const tab = readFileSync(resolve(__dirname, "../app/(tabs)/create.tsx"), "utf8");
    expect(tab).toContain("openCreateChooser");
    expect(tab).not.toContain("CreateWizardV2");
  });
});
