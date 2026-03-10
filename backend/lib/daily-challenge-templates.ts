/**
 * Templates for auto-generated 24-hour daily challenges.
 * Used by the daily challenge generator (cron or manual).
 */

export interface DailyChallengeTaskTemplate {
  title: string;
  type: "simple" | "journal" | "timer" | "photo";
  required?: boolean;
  minWords?: number;
  durationMinutes?: number;
}

export interface DailyChallengeTemplate {
  title: string;
  description: string;
  category: string;
  tasks: DailyChallengeTaskTemplate[];
}

export const DAILY_CHALLENGE_TEMPLATES: DailyChallengeTemplate[] = [
  {
    title: "10K Steps Today",
    description: "Hit 10,000 steps in 24 hours. Track with your phone or watch.",
    category: "fitness",
    tasks: [
      { title: "Log 10,000 steps", type: "simple", required: true },
      { title: "Reflect on your walk", type: "journal", required: false, minWords: 10 },
    ],
  },
  {
    title: "No Social Scroll",
    description: "One day without scrolling social feeds. Use app limits or willpower.",
    category: "discipline",
    tasks: [
      { title: "No social media scrolling", type: "simple", required: true },
      { title: "What did you do instead?", type: "journal", required: false, minWords: 15 },
    ],
  },
  {
    title: "20-Minute Move",
    description: "At least 20 minutes of intentional movement: run, walk, yoga, or gym.",
    category: "fitness",
    tasks: [
      { title: "20+ minutes of movement", type: "timer", required: true, durationMinutes: 20 },
      { title: "How did it feel?", type: "journal", required: false, minWords: 10 },
    ],
  },
  {
    title: "Read 30 Minutes",
    description: "Read a book for at least 30 minutes. No phones, no TV.",
    category: "mind",
    tasks: [
      { title: "Read for 30 minutes", type: "timer", required: true, durationMinutes: 30 },
      { title: "One takeaway from your reading", type: "journal", required: false, minWords: 20 },
    ],
  },
  {
    title: "Cold Shower",
    description: "End your shower with 60 seconds of cold water. Build mental toughness.",
    category: "discipline",
    tasks: [
      { title: "60 seconds of cold water", type: "timer", required: true, durationMinutes: 1 },
      { title: "Photo proof (optional)", type: "photo", required: false },
    ],
  },
  {
    title: "Gratitude Three",
    description: "Write down three things you're grateful for today.",
    category: "mind",
    tasks: [
      { title: "List 3 things you're grateful for", type: "journal", required: true, minWords: 30 },
    ],
  },
  {
    title: "No Sugar Day",
    description: "24 hours without added sugar. Check labels and skip desserts.",
    category: "discipline",
    tasks: [
      { title: "No added sugar", type: "simple", required: true },
      { title: "What was hardest?", type: "journal", required: false, minWords: 15 },
    ],
  },
  {
    title: "Morning Pages",
    description: "Write three pages (longhand or digital) first thing. Stream of consciousness.",
    category: "mind",
    tasks: [
      { title: "Complete morning pages", type: "journal", required: true, minWords: 150 },
    ],
  },
  {
    title: "5-Minute Plank",
    description: "Hold a plank for 5 minutes total today. You can split into sets.",
    category: "fitness",
    tasks: [
      { title: "5 minutes total plank time", type: "timer", required: true, durationMinutes: 5 },
    ],
  },
  {
    title: "Phone-Free Meal",
    description: "One meal today with zero phone. Eat mindfully.",
    category: "discipline",
    tasks: [
      { title: "One meal without phone", type: "simple", required: true },
      { title: "How was the meal?", type: "journal", required: false, minWords: 10 },
    ],
  },
  {
    title: "10-Minute Stretch",
    description: "Dedicate 10 minutes to stretching. Focus on what feels tight.",
    category: "fitness",
    tasks: [
      { title: "10 minutes stretching", type: "timer", required: true, durationMinutes: 10 },
    ],
  },
  {
    title: "One Act of Kindness",
    description: "Do one deliberate act of kindness and note it.",
    category: "mind",
    tasks: [
      { title: "One act of kindness", type: "simple", required: true },
      { title: "What did you do?", type: "journal", required: false, minWords: 20 },
    ],
  },
  {
    title: "Early Wake",
    description: "Wake up 30 minutes earlier than usual. Use the time intentionally.",
    category: "discipline",
    tasks: [
      { title: "Wake 30 min early", type: "simple", required: true },
      { title: "How did you use the time?", type: "journal", required: false, minWords: 15 },
    ],
  },
  {
    title: "Hydration Check",
    description: "Drink at least 8 glasses of water today. Track if it helps.",
    category: "fitness",
    tasks: [
      { title: "8 glasses of water", type: "simple", required: true },
      { title: "Energy level note", type: "journal", required: false, minWords: 10 },
    ],
  },
  {
    title: "No Complaining",
    description: "Go 24 hours without complaining. Reframe or stay silent.",
    category: "discipline",
    tasks: [
      { title: "No complaining", type: "simple", required: true },
      { title: "What did you notice?", type: "journal", required: false, minWords: 20 },
    ],
  },
  {
    title: "Meditate 10",
    description: "Meditate for 10 minutes. Use an app or sit in silence.",
    category: "mind",
    tasks: [
      { title: "10 minutes meditation", type: "timer", required: true, durationMinutes: 10 },
    ],
  },
  {
    title: "Photo a Win",
    description: "Capture one small win today with a photo and a short note.",
    category: "mind",
    tasks: [
      { title: "Photo of your win", type: "photo", required: true },
      { title: "Short caption", type: "journal", required: false, minWords: 10 },
    ],
  },
  {
    title: "No Caffeine",
    description: "One day without caffeine. See how you feel.",
    category: "discipline",
    tasks: [
      { title: "No caffeine", type: "simple", required: true },
      { title: "How was your energy?", type: "journal", required: false, minWords: 15 },
    ],
  },
  {
    title: "Learn One Thing",
    description: "Spend 15 minutes learning something new: article, video, or podcast.",
    category: "mind",
    tasks: [
      { title: "15 min learning", type: "timer", required: true, durationMinutes: 15 },
      { title: "What did you learn?", type: "journal", required: false, minWords: 25 },
    ],
  },
  {
    title: "Bed by 10",
    description: "Lights out by 10 PM. Protect your sleep.",
    category: "discipline",
    tasks: [
      { title: "In bed by 10 PM", type: "simple", required: true },
      { title: "Sleep quality note", type: "journal", required: false, minWords: 10 },
    ],
  },
];
