import { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user1",
    username: "alex_martinez",
    avatar: "https://i.pravatar.cc/150?img=1",
    timezone: "America/New_York",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    streakCount: 14,
    joinedChallenges: ["challenge1"],
  },
  {
    id: "user2",
    username: "jordan_lee",
    avatar: "https://i.pravatar.cc/150?img=2",
    timezone: "America/Los_Angeles",
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    streakCount: 28,
    joinedChallenges: ["challenge1"],
  },
  {
    id: "user3",
    username: "sam_rivers",
    avatar: "https://i.pravatar.cc/150?img=3",
    timezone: "America/Chicago",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    streakCount: 42,
    joinedChallenges: ["challenge1", "challenge2"],
  },
  {
    id: "user4",
    username: "taylor_chen",
    avatar: "https://i.pravatar.cc/150?img=4",
    timezone: "America/Denver",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    streakCount: 7,
    joinedChallenges: ["challenge2"],
  },
  {
    id: "user5",
    username: "maya_patel",
    avatar: "https://i.pravatar.cc/150?img=5",
    timezone: "America/New_York",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    streakCount: 3,
    joinedChallenges: ["challenge1"],
  },
];

export const mockCurrentUser: User = mockUsers[0];

export const socialSnapshots = [
  { id: "user2", username: "jordan_lee", avatarUrl: "https://i.pravatar.cc/150?img=2", secured: true, day: 45 },
  { id: "user3", username: "sam_rivers", avatarUrl: "https://i.pravatar.cc/150?img=3", secured: true, day: 60 },
  { id: "user4", username: "taylor_chen", avatarUrl: "https://i.pravatar.cc/150?img=4", secured: false, day: 12 },
  { id: "user5", username: "maya_patel", avatarUrl: "https://i.pravatar.cc/150?img=5", secured: true, day: 3 },
];

export const purposeLines = [
  "Secure today. Then see how others did.",
  "One day at a time. Community keeps you steady.",
  "Finish your work. Stay for the people.",
  "Build momentum. One task at a time.",
];

export const encouragementMessages = {
  incomplete: [
    "Momentum starts after the first task.",
    "Small win first.",
    "One task closer.",
  ],
  secured: [
    "You did your part today.",
    "Showed up. That's the point.",
    "Day secured. Well done.",
  ],
  streakGrowing: [
    "Consistency compounds quietly.",
    "Keep it steady.",
    "Building something real.",
  ],
};
