/** Motivational quotes for GRIIT (two I’s). */
export const GRIIT_QUOTES = [
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", author: "Aristotle" },
  { text: "It never gets easier. You just get better.", author: "Unknown" },
  { text: "Obsessed is just a word the lazy use to describe the dedicated.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Suffer the pain of discipline or suffer the pain of regret.", author: "Unknown" },
  { text: "Champions are made from something they have deep inside — a desire, a dream, a vision.", author: "Muhammad Ali" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
  { text: "It's going to be hard, but hard is not impossible.", author: "Unknown" },
  { text: "Don't watch the clock. Do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "You are stronger than you think.", author: "Unknown" },
  { text: "Every day is a chance to get better.", author: "Unknown" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "Your only limit is your mind.", author: "Unknown" },
  { text: "Small steps every day.", author: "Unknown" },
  { text: "Be stronger than your excuses.", author: "Unknown" },
  { text: "One more rep. One more day.", author: "Unknown" },
] as const;

/** Legacy one-line list (kept for any code still expecting plain strings). */
export const DISCIPLINE_QUOTES = GRIIT_QUOTES.map((q) => q.text);

export type QuoteWithAuthor = { text: string; author: string };

/**
 * Returns a different quote each day, deterministically.
 * Same quote all day — changes at midnight.
 */
export function getDailyQuoteObject(): QuoteWithAuthor {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return GRIIT_QUOTES[dayOfYear % GRIIT_QUOTES.length] ?? GRIIT_QUOTES[0]!;
}

/**
 * Returns a random quote — different every time called.
 */
export function getRandomQuote(): QuoteWithAuthor {
  return GRIIT_QUOTES[Math.floor(Math.random() * GRIIT_QUOTES.length)] ?? GRIIT_QUOTES[0]!;
}

/** @deprecated Prefer getDailyQuoteObject / getRandomQuote for author attribution */
export function getDailyQuote(): string {
  return getDailyQuoteObject().text;
}
