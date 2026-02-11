export interface StarterTask {
  id: string;
  title: string;
  type: string;
  verification?: string;
  estimate?: string;
  journalPrompt?: string;
  journalTypes?: string[];
  captureMood?: boolean;
  captureEnergy?: boolean;
  captureBodyState?: boolean;
  wordLimitEnabled?: boolean;
  wordLimitWords?: number | null;
  timeEnforcementEnabled?: boolean;
  anchorTimeLocal?: string;
  windowStartOffsetMin?: number;
  windowEndOffsetMin?: number;
  hardWindowEnabled?: boolean;
  hardWindowStartOffsetMin?: number;
  hardWindowEndOffsetMin?: number;
}

export interface StarterChallenge {
  id: string;
  title: string;
  description: string;
  short_hook: string;
  about?: string;
  theme_color: string;
  difficulty: string;
  duration_type: string;
  duration_days: number;
  category: string;
  visibility: string;
  status: string;
  is_featured: boolean;
  is_daily: boolean;
  starts_at: string | null;
  ends_at: string | null;
  participants_count: number;
  active_today_count?: number;
  hard_pick_rate?: number;
  hard_finish_rate?: number;
  completion_rate?: number;
  rules?: string[];
  fail_condition?: string;
  challenge_tasks: StarterTask[];
  tasks: StarterTask[];
}

function getTodayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getTodayEnd(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export const STARTER_CHALLENGES: StarterChallenge[] = [
  {
    id: "starter-1",
    title: "75 Day Hard",
    description: "The ultimate discipline challenge. Complete daily tasks without exception for 75 days.",
    short_hook: "75 days. No excuses. Most people quit.",
    about: "75 Day Hard is the original no-compromise challenge. Every day you must complete all tasks with zero exceptions. Miss one day and you restart from day 1. This challenge has broken and rebuilt thousands of people.",
    theme_color: "#E87D4F",
    difficulty: "extreme",
    duration_type: "multi_day",
    duration_days: 75,
    category: "fitness",
    visibility: "public",
    status: "published",
    is_featured: true,
    is_daily: false,
    starts_at: null,
    ends_at: null,
    participants_count: 2847,
    active_today_count: 1243,
    hard_pick_rate: 38,
    hard_finish_rate: 14,
    completion_rate: 22,
    rules: [
      "Daily completion required",
      "All tasks must be verified",
      "No rest days allowed",
      "One miss resets the entire challenge",
    ],
    fail_condition: "One miss = challenge failed",
    challenge_tasks: [
      { id: "st1-t1", title: "Run 1 mile", type: "run", verification: "GPS Verified", estimate: "~15 min" },
      { id: "st1-t2", title: "Journal entry", type: "journal", verification: "In-App Entry", estimate: "~10 min", journalPrompt: "What did you learn about yourself today? How did this challenge push your limits?", journalTypes: ["self_reflection", "discipline_check"], captureMood: true, captureEnergy: true, captureBodyState: true },
    ],
    tasks: [
      { id: "st1-t1", title: "Run 1 mile", type: "run", verification: "GPS Verified", estimate: "~15 min" },
      { id: "st1-t2", title: "Journal entry", type: "journal", verification: "In-App Entry", estimate: "~10 min", journalPrompt: "What did you learn about yourself today? How did this challenge push your limits?", journalTypes: ["self_reflection", "discipline_check"], captureMood: true, captureEnergy: true, captureBodyState: true },
    ],
  },
  {
    id: "starter-2",
    title: "30 Day Mindful",
    description: "Build a meditation and journaling practice over 30 days.",
    short_hook: "30 days to build a calmer mind.",
    about: "A gentle but consistent challenge to establish a daily mindfulness practice. Meditation and journaling together create lasting mental clarity and emotional resilience.",
    theme_color: "#6B8E7B",
    difficulty: "medium",
    duration_type: "multi_day",
    duration_days: 30,
    category: "mind",
    visibility: "public",
    status: "published",
    is_featured: true,
    is_daily: false,
    starts_at: null,
    ends_at: null,
    participants_count: 1523,
    active_today_count: 687,
    completion_rate: 48,
    rules: [
      "Daily completion required",
      "Sessions must be at least 10 minutes",
      "Journal entries must be meaningful",
    ],
    challenge_tasks: [
      { id: "st2-t1", title: "10-minute meditation", type: "timer", verification: "Timer Verified", estimate: "10 min", timeEnforcementEnabled: true, anchorTimeLocal: "06:30", windowStartOffsetMin: -30, windowEndOffsetMin: 60 },
      { id: "st2-t2", title: "Evening reflection", type: "journal", verification: "In-App Entry", estimate: "~5 min", journalPrompt: "Describe your mental state before and after meditation. What thoughts came up?", journalTypes: ["emotions", "mental_clarity"], captureMood: true, captureEnergy: true, timeEnforcementEnabled: true, anchorTimeLocal: "21:00", windowStartOffsetMin: -60, windowEndOffsetMin: 120 },
    ],
    tasks: [
      { id: "st2-t1", title: "10-minute meditation", type: "timer", verification: "Timer Verified", estimate: "10 min", timeEnforcementEnabled: true, anchorTimeLocal: "06:30", windowStartOffsetMin: -30, windowEndOffsetMin: 60 },
      { id: "st2-t2", title: "Evening reflection", type: "journal", verification: "In-App Entry", estimate: "~5 min", journalPrompt: "Describe your mental state before and after meditation. What thoughts came up?", journalTypes: ["emotions", "mental_clarity"], captureMood: true, captureEnergy: true, timeEnforcementEnabled: true, anchorTimeLocal: "21:00", windowStartOffsetMin: -60, windowEndOffsetMin: 120 },
    ],
  },
  {
    id: "starter-3",
    title: "Morning Warrior",
    description: "Wake up at 5 AM and complete a morning routine for 21 days.",
    short_hook: "Win the morning. Win the day.",
    about: "Transform your mornings into a launchpad for the rest of your day. 21 days of early rising combined with physical activity builds discipline that compounds.",
    theme_color: "#FFB347",
    difficulty: "hard",
    duration_type: "multi_day",
    duration_days: 21,
    category: "discipline",
    visibility: "public",
    status: "published",
    is_featured: true,
    is_daily: false,
    starts_at: null,
    ends_at: null,
    participants_count: 892,
    active_today_count: 341,
    completion_rate: 35,
    rules: [
      "Wake up photo must be timestamped before 5:30 AM",
      "Workout must be at least 15 minutes",
      "Daily completion required",
    ],
    challenge_tasks: [
      { id: "st3-t1", title: "5 AM wake up photo", type: "photo", verification: "Photo + Timestamp", estimate: "~1 min" },
      { id: "st3-t2", title: "Morning workout", type: "timer", verification: "Timer Verified", estimate: "~20 min" },
    ],
    tasks: [
      { id: "st3-t1", title: "5 AM wake up photo", type: "photo", verification: "Photo + Timestamp", estimate: "~1 min" },
      { id: "st3-t2", title: "Morning workout", type: "timer", verification: "Timer Verified", estimate: "~20 min" },
    ],
  },
  {
    id: "starter-4",
    title: "Daily Gratitude",
    description: "Write three things you're grateful for every day for 14 days.",
    short_hook: "Gratitude changes everything.",
    about: "A simple but powerful practice. Writing down what you're grateful for rewires your brain to notice the good. 14 days is enough to feel the shift.",
    theme_color: "#9B8EC5",
    difficulty: "easy",
    duration_type: "multi_day",
    duration_days: 14,
    category: "mind",
    visibility: "public",
    status: "published",
    is_featured: false,
    is_daily: false,
    starts_at: null,
    ends_at: null,
    participants_count: 456,
    active_today_count: 189,
    completion_rate: 67,
    rules: [
      "Write at least 3 items per entry",
      "Daily completion required",
    ],
    challenge_tasks: [
      { id: "st4-t1", title: "Gratitude journal", type: "journal", verification: "In-App Entry", estimate: "~5 min", journalPrompt: "Write three things you are grateful for today. Why do they matter to you?", journalTypes: ["gratitude"], captureMood: true, captureEnergy: false },
    ],
    tasks: [
      { id: "st4-t1", title: "Gratitude journal", type: "journal", verification: "In-App Entry", estimate: "~5 min", journalPrompt: "Write three things you are grateful for today. Why do they matter to you?", journalTypes: ["gratitude"], captureMood: true, captureEnergy: false },
    ],
  },
  {
    id: "starter-5",
    title: "Cold Shower Challenge",
    description: "Take a cold shower every day for 30 days. Build mental toughness.",
    short_hook: "Embrace the cold. Build the mind.",
    about: "Cold exposure builds mental resilience and discipline. Each day you choose discomfort over comfort, you get stronger. 30 days to prove you can do hard things.",
    theme_color: "#4A90D9",
    difficulty: "hard",
    duration_type: "multi_day",
    duration_days: 30,
    category: "discipline",
    visibility: "public",
    status: "published",
    is_featured: false,
    is_daily: false,
    starts_at: null,
    ends_at: null,
    participants_count: 734,
    active_today_count: 298,
    completion_rate: 31,
    rules: [
      "Shower must be cold (no warm start)",
      "Photo proof required daily",
      "Daily completion required",
    ],
    challenge_tasks: [
      { id: "st5-t1", title: "Cold shower selfie", type: "photo", verification: "Photo Verified", estimate: "~3 min" },
      { id: "st5-t2", title: "Rate your experience", type: "checkin", verification: "Manual", estimate: "~1 min" },
    ],
    tasks: [
      { id: "st5-t1", title: "Cold shower selfie", type: "photo", verification: "Photo Verified", estimate: "~3 min" },
      { id: "st5-t2", title: "Rate your experience", type: "checkin", verification: "Manual", estimate: "~1 min" },
    ],
  },
  {
    id: "starter-6",
    title: "Read 30 Pages",
    description: "Read at least 30 pages of a book every day for 21 days.",
    short_hook: "Feed your mind daily.",
    about: "Reading is the simplest form of self-improvement. 30 pages a day adds up to roughly 2 books in 21 days. Pair it with a short note to lock in what you learn.",
    theme_color: "#D4956A",
    difficulty: "medium",
    duration_type: "multi_day",
    duration_days: 21,
    category: "mind",
    visibility: "public",
    status: "published",
    is_featured: true,
    is_daily: false,
    starts_at: null,
    ends_at: null,
    participants_count: 1102,
    active_today_count: 478,
    completion_rate: 52,
    rules: [
      "30 pages minimum per day",
      "Book note must reference what you read",
      "Daily completion required",
    ],
    challenge_tasks: [
      { id: "st6-t1", title: "Read 30 pages", type: "checkin", verification: "Manual", estimate: "~30 min" },
      { id: "st6-t2", title: "Book note", type: "journal", verification: "In-App Entry", estimate: "~5 min", journalPrompt: "What was the key idea from today's reading? How can you apply it?", journalTypes: ["self_reflection", "mental_clarity"], captureMood: false, captureEnergy: false },
    ],
    tasks: [
      { id: "st6-t1", title: "Read 30 pages", type: "checkin", verification: "Manual", estimate: "~30 min" },
      { id: "st6-t2", title: "Book note", type: "journal", verification: "In-App Entry", estimate: "~5 min", journalPrompt: "What was the key idea from today's reading? How can you apply it?", journalTypes: ["self_reflection", "mental_clarity"], captureMood: false, captureEnergy: false },
    ],
  },
  {
    id: "starter-7",
    title: "No Phone Before 9 AM",
    description: "Start your morning without screens for 14 days.",
    short_hook: "Reclaim your mornings.",
    about: "Most people check their phone within 3 minutes of waking. Break that cycle. 14 days of screen-free mornings changes how you start every day.",
    theme_color: "#2D9CDB",
    difficulty: "medium",
    duration_type: "multi_day",
    duration_days: 14,
    category: "discipline",
    visibility: "public",
    status: "published",
    is_featured: false,
    is_daily: false,
    starts_at: null,
    ends_at: null,
    participants_count: 389,
    active_today_count: 156,
    completion_rate: 55,
    rules: [
      "No phone usage before 9 AM",
      "Check-in must be after 9 AM",
      "Daily completion required",
    ],
    challenge_tasks: [
      { id: "st7-t1", title: "Morning check-in", type: "checkin", verification: "Manual", estimate: "~1 min" },
    ],
    tasks: [
      { id: "st7-t1", title: "Morning check-in", type: "checkin", verification: "Manual", estimate: "~1 min" },
    ],
  },
  {
    id: "starter-8",
    title: "5K Training",
    description: "Build up to running a 5K over 30 days with progressive training.",
    short_hook: "From zero to 5K in 30 days.",
    about: "A progressive running plan that takes you from wherever you are to comfortably running a 5K. Each week builds on the last with increasing distance and pace.",
    theme_color: "#27AE60",
    difficulty: "medium",
    duration_type: "multi_day",
    duration_days: 30,
    category: "fitness",
    visibility: "public",
    status: "published",
    is_featured: true,
    is_daily: false,
    starts_at: null,
    ends_at: null,
    participants_count: 1890,
    active_today_count: 812,
    completion_rate: 41,
    rules: [
      "Run must be tracked via GPS",
      "Post-run stretch is mandatory",
      "Daily completion required",
    ],
    challenge_tasks: [
      { id: "st8-t1", title: "Daily run", type: "run", verification: "GPS Verified", estimate: "~20 min" },
      { id: "st8-t2", title: "Post-run stretch", type: "timer", verification: "Timer Verified", estimate: "~10 min" },
    ],
    tasks: [
      { id: "st8-t1", title: "Daily run", type: "run", verification: "GPS Verified", estimate: "~20 min" },
      { id: "st8-t2", title: "Post-run stretch", type: "timer", verification: "Timer Verified", estimate: "~10 min" },
    ],
  },
  {
    id: "daily-1",
    title: "Sprint & Stretch",
    description: "Quick 20-minute HIIT session followed by a 10-minute stretch. Perfect for busy days.",
    short_hook: "30 minutes to feel unstoppable.",
    theme_color: "#FF6B6B",
    difficulty: "medium",
    duration_type: "24h",
    duration_days: 1,
    category: "fitness",
    visibility: "public",
    status: "published",
    is_featured: false,
    is_daily: true,
    starts_at: getTodayStart(),
    ends_at: getTodayEnd(),
    participants_count: 412,
    rules: ["Both sessions must be completed", "Timer must run fully"],
    challenge_tasks: [
      { id: "d1-t1", title: "20-min HIIT workout", type: "timer", verification: "Timer Verified", estimate: "20 min" },
      { id: "d1-t2", title: "10-min stretch", type: "timer", verification: "Timer Verified", estimate: "10 min" },
    ],
    tasks: [
      { id: "d1-t1", title: "20-min HIIT workout", type: "timer", verification: "Timer Verified", estimate: "20 min" },
      { id: "d1-t2", title: "10-min stretch", type: "timer", verification: "Timer Verified", estimate: "10 min" },
    ],
  },
  {
    id: "daily-2",
    title: "Mindful Minutes",
    description: "Take three mindful pauses throughout your day. Breathe deeply and reset.",
    short_hook: "Three pauses. Total clarity.",
    theme_color: "#7C5CBF",
    difficulty: "easy",
    duration_type: "24h",
    duration_days: 1,
    category: "mind",
    visibility: "public",
    status: "published",
    is_featured: false,
    is_daily: true,
    starts_at: getTodayStart(),
    ends_at: getTodayEnd(),
    participants_count: 287,
    rules: ["Breathwork must be at least 5 minutes"],
    challenge_tasks: [
      { id: "d2-t1", title: "Morning breathwork (5 min)", type: "timer", verification: "Timer Verified", estimate: "5 min" },
      { id: "d2-t2", title: "Midday gratitude note", type: "journal", verification: "In-App Entry", estimate: "~3 min", journalPrompt: "Pause and notice: what are you grateful for right now in this moment?", journalTypes: ["gratitude", "emotions"], captureMood: true, captureEnergy: false },
    ],
    tasks: [
      { id: "d2-t1", title: "Morning breathwork (5 min)", type: "timer", verification: "Timer Verified", estimate: "5 min" },
      { id: "d2-t2", title: "Midday gratitude note", type: "journal", verification: "In-App Entry", estimate: "~3 min", journalPrompt: "Pause and notice: what are you grateful for right now in this moment?", journalTypes: ["gratitude", "emotions"], captureMood: true, captureEnergy: false },
    ],
  },
  {
    id: "daily-3",
    title: "Zero Excuses Run",
    description: "Run at least 1 mile today. No excuses, no shortcuts. Just lace up and go.",
    short_hook: "1 mile. Zero excuses.",
    theme_color: "#FF9F43",
    difficulty: "easy",
    duration_type: "24h",
    duration_days: 1,
    category: "fitness",
    visibility: "public",
    status: "published",
    is_featured: false,
    is_daily: true,
    starts_at: getTodayStart(),
    ends_at: getTodayEnd(),
    participants_count: 634,
    rules: ["Must run at least 1 mile", "GPS tracking required"],
    challenge_tasks: [
      { id: "d3-t1", title: "Run 1 mile", type: "run", verification: "GPS Verified", estimate: "~12 min" },
      { id: "d3-t2", title: "Post-run check-in", type: "checkin", verification: "Manual", estimate: "~1 min" },
    ],
    tasks: [
      { id: "d3-t1", title: "Run 1 mile", type: "run", verification: "GPS Verified", estimate: "~12 min" },
      { id: "d3-t2", title: "Post-run check-in", type: "checkin", verification: "Manual", estimate: "~1 min" },
    ],
  },
  {
    id: "daily-4",
    title: "Digital Detox Hour",
    description: "Put your phone down for one full hour. Read, walk, or just sit in silence.",
    short_hook: "One hour. No screens. Pure presence.",
    theme_color: "#1ABC9C",
    difficulty: "medium",
    duration_type: "24h",
    duration_days: 1,
    category: "discipline",
    visibility: "public",
    status: "published",
    is_featured: false,
    is_daily: true,
    starts_at: getTodayStart(),
    ends_at: getTodayEnd(),
    participants_count: 198,
    rules: ["Full 60 minutes with no screen usage"],
    challenge_tasks: [
      { id: "d4-t1", title: "1 hour screen-free", type: "timer", verification: "Timer Verified", estimate: "60 min" },
      { id: "d4-t2", title: "Reflection journal", type: "journal", verification: "In-App Entry", estimate: "~5 min", journalPrompt: "How did one hour without a screen make you feel? What did you notice about your attention?", journalTypes: ["self_reflection", "mental_clarity"], captureMood: true, captureEnergy: true },
    ],
    tasks: [
      { id: "d4-t1", title: "1 hour screen-free", type: "timer", verification: "Timer Verified", estimate: "60 min" },
      { id: "d4-t2", title: "Reflection journal", type: "journal", verification: "In-App Entry", estimate: "~5 min", journalPrompt: "How did one hour without a screen make you feel? What did you notice about your attention?", journalTypes: ["self_reflection", "mental_clarity"], captureMood: true, captureEnergy: true },
    ],
  },
  {
    id: "daily-5",
    title: "100 Pushups",
    description: "Complete 100 pushups throughout the day. Break it up however you like.",
    short_hook: "100 reps. Any split. Get it done.",
    theme_color: "#E74C3C",
    difficulty: "hard",
    duration_type: "24h",
    duration_days: 1,
    category: "fitness",
    visibility: "public",
    status: "published",
    is_featured: false,
    is_daily: true,
    starts_at: getTodayStart(),
    ends_at: getTodayEnd(),
    participants_count: 321,
    rules: ["All 100 reps must be completed", "Photo proof required"],
    challenge_tasks: [
      { id: "d5-t1", title: "Complete 100 pushups", type: "checkin", verification: "Manual", estimate: "~15 min" },
      { id: "d5-t2", title: "Proof photo", type: "photo", verification: "Photo Verified", estimate: "~1 min" },
    ],
    tasks: [
      { id: "d5-t1", title: "Complete 100 pushups", type: "checkin", verification: "Manual", estimate: "~15 min" },
      { id: "d5-t2", title: "Proof photo", type: "photo", verification: "Photo Verified", estimate: "~1 min" },
    ],
  },
  {
    id: "daily-6",
    title: "Deep Focus Block",
    description: "Complete a 90-minute deep work session with no distractions. Ship something meaningful.",
    short_hook: "90 minutes of pure, undistracted work.",
    theme_color: "#3498DB",
    difficulty: "medium",
    duration_type: "24h",
    duration_days: 1,
    category: "discipline",
    visibility: "public",
    status: "published",
    is_featured: false,
    is_daily: true,
    starts_at: getTodayStart(),
    ends_at: getTodayEnd(),
    participants_count: 156,
    rules: ["90 minutes uninterrupted", "Must ship something tangible"],
    challenge_tasks: [
      { id: "d6-t1", title: "90-min deep work", type: "timer", verification: "Timer Verified", estimate: "90 min" },
      { id: "d6-t2", title: "What did you ship?", type: "journal", verification: "In-App Entry", estimate: "~3 min", journalPrompt: "What tangible output did you produce in your deep work session? What was your biggest blocker?", journalTypes: ["wins_losses", "discipline_check"], captureMood: false, captureEnergy: true },
    ],
    tasks: [
      { id: "d6-t1", title: "90-min deep work", type: "timer", verification: "Timer Verified", estimate: "90 min" },
      { id: "d6-t2", title: "What did you ship?", type: "journal", verification: "In-App Entry", estimate: "~3 min", journalPrompt: "What tangible output did you produce in your deep work session? What was your biggest blocker?", journalTypes: ["wins_losses", "discipline_check"], captureMood: false, captureEnergy: true },
    ],
  },
];
