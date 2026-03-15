/**
 * TODO: Replace with real API data.
 * Mock LIVE feed for Home screen until feed.list is wired.
 */
export type MockFeedItem =
  | {
      type: "secured";
      user: string;
      avatar: string | null;
      day: number;
      challenge: string;
      streak: number;
      timeAgo: string;
      respect: number;
      challengeId?: string;
    }
  | {
      type: "milestone";
      user: string;
      avatar: string | null;
      days: number;
      topPercent: number;
      respect: number;
    }
  | {
      type: "challenge_cta";
      percent: number;
      challenge: string;
      challengeId: string;
    }
  | {
      type: "rank_up";
      user: string;
      avatar: string | null;
      newRank: string;
      discipline: number;
    };

export const MOCK_FEED: MockFeedItem[] = [
  {
    type: "secured",
    user: "hasan_k",
    avatar: null,
    day: 14,
    challenge: "75 Day Hard",
    streak: 14,
    timeAgo: "8m ago",
    respect: 7,
    challengeId: "1",
  },
  {
    type: "milestone",
    user: "sarah_m",
    avatar: null,
    days: 30,
    topPercent: 12,
    respect: 24,
  },
  {
    type: "challenge_cta",
    percent: 62,
    challenge: "75 Day Hard",
    challengeId: "1",
  },
  {
    type: "rank_up",
    user: "omar_z",
    avatar: null,
    newRank: "Relentless",
    discipline: 84,
  },
  {
    type: "secured",
    user: "jordan_l",
    avatar: null,
    day: 7,
    challenge: "30 Day Warrior",
    streak: 7,
    timeAgo: "7h ago",
    respect: 5,
    challengeId: "2",
  },
  {
    type: "secured",
    user: "alex_fit",
    avatar: null,
    day: 22,
    challenge: "Morning Discipline",
    streak: 22,
    timeAgo: "3h ago",
    respect: 3,
    challengeId: "3",
  },
];

/** Mock suggested challenges when API returns none. */
export const MOCK_SUGGESTED = [
  { id: "cold-shower", title: "Cold Shower Challenge" },
  { id: "no-phone", title: "No Phone Before 9 AM" },
  { id: "gratitude", title: "Daily Gratitude" },
];
