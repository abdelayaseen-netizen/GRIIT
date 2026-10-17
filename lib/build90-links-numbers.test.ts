import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ROUTES, userProfile } from "@/lib/routes";
import { feedAuthorHref } from "@/lib/feed-tap-targets";
import { enrollmentStarted, requiredTasks, todayTaskCounts } from "@/lib/today-counts";
import { selectHomeProofCard, type HomeProofTask } from "@/lib/home-proof-card";
import { completedTaskIds } from "@/lib/today-completion";
import { rowsFromProfileRecord } from "@/lib/profile-challenges";
import { recordLine, recordOfDue } from "@/lib/v44-detail";
import { enrollmentDayStats } from "@/backend/lib/enrollment-day-stats";
import { weekSecuredOfDue } from "@/lib/g2a-challenge";
import { securedSinceLine } from "@/lib/secured-since";
import { WEEK } from "@/lib/copy";
import { formatDays } from "@/lib/format-days";
import { todayFirstDayLine } from "@/lib/g2a-home";
import { buildSharePaint, paintStrings } from "@/lib/share-image";

const root = resolve(__dirname, "..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

describe("05.1 tap any person and open their profile", () => {
  it("userProfile is the one way to build a profile path", () => {
    expect(userProfile("omar")).toBe("/profile/omar");
    expect(userProfile(" omar ")).toBe("/profile/omar");
    expect(userProfile("o m/ar")).toBe("/profile/o%20m%2Far");
    expect(userProfile("11111111-1111-4111-8111-111111111111")).toBe(
      "/profile/11111111-1111-4111-8111-111111111111",
    );
    expect(ROUTES.PROFILE_USERNAME("omar")).toBe(userProfile("omar"));
  });

  it("feedAuthorHref goes through userProfile, with the user id as the fallback", () => {
    expect(feedAuthorHref({ viewerUserId: "me", authorUserId: "them", username: "omar" })).toBe(userProfile("omar"));
    expect(feedAuthorHref({ viewerUserId: "me", authorUserId: "them", username: "?" })).toBe(userProfile("them"));
    expect(feedAuthorHref({ viewerUserId: "me", authorUserId: "me", username: "me" })).toBe(ROUTES.TABS_PROFILE);
    expect(read("lib/feed-tap-targets.ts")).toContain("userProfile(");
  });

  it("every listed surface opens a profile through the helper", () => {
    const commentRow = read("components/ds/CommentRow.tsx");
    expect(commentRow).toContain("onPressAuthor");
    expect(commentRow).toContain("<Pressable");
    expect(read("components/feed/CommentsSheet.tsx")).toContain("onPressAuthor=");
    const post = read("app/post/[id]/index.tsx");
    expect(post).toContain("onPressAuthor=");
    expect(post).toContain("feedAuthorHref(");
    expect(post).toMatch(/testID="post-author"/);
    const notifs = read("components/activity/NotificationsTab.tsx");
    expect(notifs).toContain("userProfile(");
    expect(notifs).toContain("onPressActor");
    expect(notifs).not.toContain("ROUTES.PROFILE_USERNAME(");
    const board = read("components/activity/LeaderboardTab.tsx");
    expect(board).toContain("userProfile(");
    expect(board).not.toContain("ROUTES.PROFILE_USERNAME(");
    expect(board).not.toMatch(/if \(!u \|\| u === "\?"\) return;/);
    const members = read("app/challenge/[id]/members.tsx");
    expect(members).toContain("userProfile(");
    expect(members).toContain("onPress={() => openMember(m)}");
    expect(read("backend/trpc/routes/groups.ts")).toContain("username: p?.username ?? null,");
    const discover = read("app/(tabs)/discover.tsx");
    expect(discover).toContain("userProfile(");
    expect(discover).not.toContain("ROUTES.PROFILE_USERNAME(");
    const follow = read("app/follow-list.tsx");
    expect(follow).toContain("userProfile(");
    expect(follow).not.toContain("ROUTES.PROFILE_USERNAME(");
  });
});

describe("05.2 tap any challenge name and open the challenge page", () => {
  it("Home has a one-line tappable header per challenge above its tasks", () => {
    const home = read("components/home/HomeV3.tsx");
    expect(home).toContain('testID="home-challenge-header"');
    expect(home).toContain("homeChallengeHeaderLine(");
    // Open rows render per section, under that section's header, not as one interleaved list.
    expect(home).not.toContain("proof.sections.flatMap((section) =>\n                section.rows.filter((row) => !row.done).map((row) => renderRow(section, row)),");
    expect(home).toContain("onPressChallenge?.(section.challengeId!)");
  });

  it("the feed subject line opens the challenge, the name opens the profile", () => {
    const feed = read("components/feed/FeedPostV3.tsx");
    const header = feed.slice(feed.indexOf("function PostHeader("), feed.indexOf("const styles"));
    expect(header).toContain("onChallengePress");
    expect(header).toContain('accessibilityLabel={`Open ${challenge} challenge`}');
    expect(feed).toContain("onChallengePress={onChallengePress}");
    // The optimistic row shown right after posting carries the challenge id, so its subject
    // line opens the challenge like a server row's does.
    const flow = read("components/task-v2/useTaskFlowV2.ts");
    expect(flow.split("challengeId: enrollmentQ.data?.challenge_id ?? null,").length).toBe(4);
  });
});

describe("05.4 numbers agree everywhere", () => {
  const tz = "America/New_York";
  const todayKey = "2026-10-16";
  const activeChallenges = [
    {
      id: "enr-1",
      challenge_id: "ch-1",
      start_at: "2026-10-15T12:00:00.000Z",
      challenges: {
        title: "Workout everyday",
        duration_days: 7,
        challenge_tasks: [
          { id: "t1", title: "Push-ups", type: "check_off", config: {} },
          { id: "t2", title: "Run", type: "check_off", config: { required: true } },
          { id: "t3", title: "Stretch", type: "check_off", config: { required: false } },
        ],
      },
    },
    {
      id: "enr-2",
      challenge_id: "ch-2",
      start_at: "2026-10-10T12:00:00.000Z",
      challenges: {
        title: "Read",
        duration_days: 14,
        challenge_tasks: [
          { id: "t4", title: "Read 10 pages", type: "counter", config: {} },
          { id: "t5", title: "Notes", type: "text", config: {} },
        ],
      },
    },
    {
      id: "enr-3",
      challenge_id: "ch-3",
      start_at: "2026-10-17T12:00:00.000Z",
      challenges: {
        title: "Starts tomorrow",
        duration_days: 7,
        challenge_tasks: [{ id: "t6", title: "Later", type: "check_off", config: {} }],
      },
    },
  ];
  const todayCheckins = [
    { active_challenge_id: "enr-1", task_id: "t1", status: "completed" },
    { active_challenge_id: "enr-2", task_id: "t4", status: "completed" },
    { active_challenge_id: "enr-2", task_id: "t5", status: "pending" },
    { active_challenge_id: "enr-3", task_id: "t6", status: "completed" },
  ];

  it("one state, one count: 4 required tasks today, 2 done, 2 left; tomorrow's challenge does not count", () => {
    const counts = todayTaskCounts({ activeChallenges, todayCheckins, todayKey, timeZone: tz });
    expect(counts).toMatchObject({ total: 4, done: 2, left: 2 });
    expect(counts.byEnrollment["enr-1"]).toEqual({ total: 2, done: 1, left: 1 });
    expect(counts.byEnrollment["enr-2"]).toEqual({ total: 2, done: 1, left: 1 });
    expect(counts.byEnrollment["enr-3"]).toBeUndefined();
    expect(enrollmentStarted(activeChallenges[2]!, todayKey, tz)).toBe(false);
    expect(requiredTasks(activeChallenges[0]!.challenges.challenge_tasks).map((t) => t.id)).toEqual(["t1", "t2"]);
  });

  it("Home's card, Profile's Today tile and the per-challenge rows read the same numbers", () => {
    const counts = todayTaskCounts({ activeChallenges, todayCheckins, todayKey, timeZone: tz });
    // Home: tasks the way index.tsx builds them (started enrollments, required tasks, completed check-ins).
    const tasks: HomeProofTask[] = activeChallenges
      .filter((ac) => enrollmentStarted(ac, todayKey, tz))
      .flatMap((ac) => {
        const done = completedTaskIds(todayCheckins, ac.id);
        return requiredTasks(ac.challenges.challenge_tasks).map((t) => ({
          id: t.id,
          name: t.title,
          description: ac.challenges.title,
          proofType: "text" as const,
          done: done.has(t.id),
          activeChallengeId: ac.id,
          challengeId: ac.challenge_id,
          challengeName: ac.challenges.title,
          currentDay: 1,
          challengeSecuredToday: false,
          durationDays: ac.challenges.duration_days,
          hasCameraProof: false,
        }));
      });
    const card = selectHomeProofCard({
      tasks,
      tasksDoneToday: counts.done,
      totalTasksToday: counts.total,
      firstProofEver: false,
      securedToday: false,
      todayKey,
    });
    expect(card.doneCount).toBe(counts.done);
    expect(card.totalCount).toBe(counts.total);
    // Profile: rows take the left count per enrollment from the same helper.
    const rows = rowsFromProfileRecord(
      {
        runs: [
          { id: "enr-1", challengeId: "ch-1", name: "Workout everyday", day: 2, dayTotal: 7, verified: 0, tasksPerDay: 2, startDateKey: "2026-10-15", dayLabel: "", days: [] },
          { id: "enr-2", challengeId: "ch-2", name: "Read", day: 7, dayTotal: 14, verified: 5, tasksPerDay: 2, startDateKey: "2026-10-10", dayLabel: "", days: [] },
        ],
        completed: [],
      } as never,
      { todaySecured: false, leftByEnrollment: counts.byEnrollment },
    );
    const profileLeft = rows.filter((r) => r.status === "active").reduce((n, r) => n + (r.tasksLeft ?? 0), 0);
    expect(profileLeft).toBe(counts.left);
    expect(rows[0]?.tasksLeft).toBe(1);
    // Without the shared counts the old formula says 4 left; the screen must pass them.
    const profile = read("app/(tabs)/profile.tsx");
    expect(profile).toContain("todayTaskCounts(");
    expect(profile).toContain("leftByEnrollment:");
    const home = read("app/(tabs)/index.tsx");
    expect(home).toContain("enrollmentStarted(");
    expect(home).toContain("requiredTasks(");
  });

  it("the challenge page meta line is the record line: Day 2 of 7 with day 1 missed reads 0 of 1 day secured", () => {
    const stats = enrollmentDayStats({
      startAt: "2026-10-15T12:00:00.000Z",
      timeZone: tz,
      todayKey,
      durationDays: 7,
      securedDateKeys: [],
    });
    expect(stats.day).toBe(2);
    expect(stats.due).toBe(1);
    expect(stats.secured).toBe(0);
    expect(recordOfDue(stats.secured, stats.due)).toBe("0 of 1 day secured");
    expect(recordOfDue(1, 1)).toBe("1 of 1 day secured");
    expect(recordOfDue(3, 5)).toBe("3 of 5 days secured");
    // Day 1 still open: nothing is due yet, so the page says what Home's hero says.
    expect(recordLine(0, 0)).toBe("First day is today.");
    expect(recordLine(0, 1)).toBe("0 of 1 day secured");
    expect(recordLine(1, 1)).toBe("1 of 1 day secured");
    // The page reads the same secured-day list Home and Profile read (the bootstrap), so a
    // finish moves all three at once.
    const page = read("app/challenge/active/[activeChallengeId].tsx");
    expect(page).toContain("bootstrap.data?.securedDateKeys");
    expect(read("app/(tabs)/profile.tsx")).toContain("bootstrap.data?.securedDateKeys");
    const detail = read("components/challenge/ActiveChallengeV3.tsx");
    expect(detail).not.toContain("days done");
    expect(detail).toContain("recordLine(p.securedCount ?? 0, p.dueCount ?? p.durationDays)");
    expect(detail.split("recordLine(p.securedCount ?? 0, p.dueCount ?? p.durationDays)").length).toBe(3);
  });

  it("pluralises day counts everywhere they are printed", () => {
    expect(formatDays(1)).toBe("1 day");
    expect(formatDays(2)).toBe("2 days");
    expect(todayFirstDayLine(1)).toBe("Day 1 is today. Finish the task to secure it.");
    expect(todayFirstDayLine(2)).toBe("Day 1 is today. Finish both tasks to secure it.");
    const week = weekSecuredOfDue({
      weekKeys: ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18"],
      securedDateKeys: [],
      todayKey,
      startDateKey: "2026-10-16",
      durationDays: 7,
      todaySecured: true,
    });
    expect(week.line).toBe("1 of 1 day");
    expect(
      securedSinceLine({ secured: 1, days: 1, dueToday: false, firstDueDate: "2026-10-15" } as never),
    ).toBe("1 of 1 day secured since Oct 15");
    expect(WEEK.line(1, 1)).toBe("This week: 1 of 1 day secured");
    const finish = paintStrings(
      buildSharePaint({
        style: "F",
        colour: "ink",
        challenge: "7K Steps",
        day: 1,
        durationDays: 1,
        secured: 1,
        due: 1,
        longestStreak: 1,
        username: "omar",
      }),
    ).join(" | ");
    expect(finish).toContain("of 1 day secured");
    expect(finish).toContain("Longest streak 1 day");
    expect(finish).not.toContain("1 days");
    const progress = paintStrings(
      buildSharePaint({
        style: "D",
        colour: "ink",
        challenge: "7K Steps",
        day: 1,
        durationDays: 7,
        secured: 1,
        due: 1,
        username: "omar",
      }),
    ).join(" | ");
    expect(progress).toContain("of 1 day");
    expect(progress).not.toContain("1 days");
  });
});

describe("01b follow-up: leaderboard wait after Day 1", () => {
  it("waits for the board heading or the empty state, the same wait friend-loop B uses", () => {
    const yaml = read(".maestro/build90-links.yaml");
    expect(yaml).toContain('visible: "A board needs two.|Top of the challenge"');
    expect(yaml).not.toContain('visible: "A board needs two.|Rank 1"');
    // The row label is the name only; the rank and "1 secured" are inside the Pressable.
    const listRow = read("components/ds/ListRow.tsx");
    expect(listRow).toContain("accessibilityLabel={title}");
    expect(read("lib/challenge-board.ts")).toContain("Top of the challenge");
  });
});
