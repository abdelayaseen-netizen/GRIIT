export const DISCIPLINE_QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "We don't rise to the level of our goals. We fall to the level of our systems.",
  "The pain of discipline is nothing like the pain of disappointment.",
  "Small disciplines repeated with consistency every day lead to great achievements.",
  "Motivation gets you started. Discipline keeps you going.",
  "You will never always be motivated. You have to learn to be disciplined.",
  "Freedom is on the other side of discipline.",
  "Do what is hard and your life will be easy.",
  "The successful person has the habit of doing things failures don't like to do.",
  "Discipline is the bridge between goals and accomplishment.",
  "Mental toughness is doing the right thing when nobody's watching.",
  "Champions don't show up to get everything they want. They show up to give everything they have.",
  "Be stronger than your excuses.",
  "The only person you are destined to become is the person you decide to be.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "The hard days are what make you stronger.",
  "If it doesn't challenge you, it doesn't change you.",
  "Suffer the pain of discipline or suffer the pain of regret.",
  "Don't count the days. Make the days count.",
  "Fall seven times, stand up eight.",
  "Consistency is more important than perfection.",
  "The grind includes days you don't feel like grinding.",
  "Prove them wrong in silence.",
  "Weak minds create hard lives. Strong minds create easy lives.",
  "Obsessed is just a word the lazy use to describe the dedicated.",
  "No alarm clock needed. My passion wakes me.",
  "Trust the process. Your time is coming.",
  "Pain is temporary. Quitting lasts forever.",
  "Every champion was once a contender that refused to give up.",
  "Results happen over time, not overnight. Stay patient and stay disciplined.",
];

export const getDailyQuote = (): string => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DISCIPLINE_QUOTES[dayOfYear % DISCIPLINE_QUOTES.length] ?? DISCIPLINE_QUOTES[0] ?? "";
};
