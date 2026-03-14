/**
 * Onboarding question content, options, and metadata for the 9-screen flow.
 */

export const MOTIVATIONS = [
  {
    id: "build_discipline",
    icon: "🔥",
    label: "Build discipline I've never had",
    sub: "Start fresh, build the foundation",
    tags: ["beginner", "structure-seeker"],
  },
  {
    id: "finish_challenge",
    icon: "🏆",
    label: "I've tried before — I want to finally finish",
    sub: "Accountability is the missing piece",
    tags: ["returner", "accountability-driven"],
  },
  {
    id: "push_harder",
    icon: "⚡",
    label: "I need something that pushes me harder",
    sub: "Other apps are too easy",
    tags: ["advanced", "intensity-seeker"],
  },
] as const;

export const PERSONAS = [
  { id: "athlete", icon: "🏃", label: "Athlete", sub: "Physical focus" },
  { id: "student", icon: "📚", label: "Student", sub: "Mental sharpness" },
  { id: "professional", icon: "💼", label: "Professional", sub: "Career + discipline" },
  { id: "transformer", icon: "🧘", label: "Transformer", sub: "Full lifestyle change" },
] as const;

export const BARRIERS = [
  {
    id: "lose_motivation",
    icon: "📉",
    label: "I start strong but lose motivation after a week",
    sub: "The week-2 wall",
  },
  {
    id: "life_busy",
    icon: "🌀",
    label: "Life gets busy and I fall off",
    sub: "Consistency is the struggle",
  },
  {
    id: "no_accountability",
    icon: "😶",
    label: "I do it alone and have no one to hold me accountable",
    sub: "Solo grind gets lonely",
  },
  {
    id: "first_time",
    icon: "🆕",
    label: "Nothing — this is my first real attempt",
    sub: "Starting from zero",
  },
] as const;

export const BARRIER_EMPATHY: Record<string, string> = {
  lose_motivation: "GRIIT's 7-day milestone system was built for this.",
  life_busy: "Streak freeze and catch-up mode have you covered.",
  no_accountability: "Your accountability partner feature unlocks after this.",
  first_time: "Perfect. We'll start you with a challenge built for day one.",
};

export const INTENSITY_OPTIONS = [
  {
    id: "foundation",
    icon: "🌱",
    label: "Build the foundation",
    sub: "1–2 tasks/day · 15–30 min",
    isDefault: false,
  },
  {
    id: "push",
    icon: "🔥",
    label: "Push my limits",
    sub: "2–3 tasks · 30–60 min",
    isDefault: true,
  },
  {
    id: "maximum",
    icon: "💀",
    label: "No excuses. Maximum discipline.",
    sub: "Full challenge mode, 75 Hard-level",
    isDefault: false,
  },
] as const;

export const SOCIAL_OPTIONS = [
  { id: "solo", icon: "🔒", label: "Quietly", sub: "Private, no leaderboard" },
  { id: "visible", icon: "👀", label: "Visibly", sub: "Public profile, ranked" },
  { id: "partner", icon: "🤝", label: "With a crew", sub: "Invite someone" },
  { id: "squad", icon: "🏟️", label: "In a squad", sub: "Join or create group" },
] as const;

export const TRAINING_TIMES = [
  { id: "morning", icon: "🌅", label: "Morning", sub: "Before 10am" },
  { id: "midday", icon: "☀️", label: "Midday", sub: "Lunch window" },
  { id: "evening", icon: "🌆", label: "Evening", sub: "After 5pm" },
  { id: "whenever", icon: "🎲", label: "Whenever", sub: "No fixed time" },
] as const;

/** Map onboarding challenge id to DB challenge uuid (from starter seed). */
export const STARTER_CHALLENGE_IDS: Record<string, string> = {
  "75_hard": "a1000001-4000-4000-8000-000000000001",
  cold_shower_30: "a1000001-4000-4000-8000-000000000002",
  read_10_pages: "a1000001-4000-4000-8000-000000000005",
};

export const STARTER_CHALLENGES = [
  {
    id: "75_hard",
    icon: "💪",
    label: "75 Hard",
    sub: "75 days of no excuses",
    tasks: "2 workouts · No alcohol · Daily reading · Progress photo",
    duration: 75,
    difficulty: "maximum",
    day1Tasks: [
      { title: "Complete a workout", time: "45 min" },
      { title: "Read 10 pages", time: "15 min" },
      { title: "Drink a gallon of water", time: "—" },
      { title: "Follow your diet", time: "—" },
      { title: "Take a progress photo", time: "2 min" },
    ],
  },
  {
    id: "cold_shower_30",
    icon: "🚿",
    label: "30-Day Cold Shower Challenge",
    sub: "One daily cold shower, tracked + timed",
    tasks: "1 cold shower per day",
    duration: 30,
    difficulty: "push",
    day1Tasks: [{ title: "Take a cold shower (2+ min)", time: "5 min" }],
  },
  {
    id: "read_10_pages",
    icon: "📖",
    label: "Read 10 Pages Daily — 30 Days",
    sub: "Minimum 10 pages, daily journal entry",
    tasks: "10 pages + journal",
    duration: 30,
    difficulty: "foundation",
    day1Tasks: [
      { title: "Read 10 pages", time: "15 min" },
      { title: "Daily journal entry", time: "5 min" },
    ],
  },
] as const;

export const ONBOARDING_TOTAL_STEPS = 9;
