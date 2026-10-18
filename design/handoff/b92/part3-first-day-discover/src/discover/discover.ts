// 3.2 · cards say what you'll actually do; no stock photos.
export const doesLine = (t: { kind: string; label: string; proof: 'camera' | 'strava' | 'self' | 'timer' | 'counter'; window?: string }) => {
  const how = t.proof === 'strava' ? 'Strava' : t.proof === 'camera' ? (t.window ? `camera, ${t.window}` : 'photo') : t.proof === 'self' ? 'self-reported' : t.proof;
  return `${t.label} · ${how}`; // "Run 3 mi · Strava", "Gym photo · daily", "Pray Fajr · camera, 5:00–6:30 am"
};
export const peopleLabel = (n: number) => (n < 5 ? 'New' : `${n.toLocaleString('en-US')} people`);
export const CATEGORY_MOTIF = {
  Fitness: { icon: 'dumbbell', texture: 'hatch-135' },
  Faith: { icon: 'moon', texture: 'crescent-rings' },
  Mind: { icon: 'book', texture: 'ruled-lines' },
  Health: { icon: 'leaf', texture: 'dot-grid' },
  Discipline: { icon: 'target', texture: 'square-grid' },
} as const; // ink ground, textPrimary at 6–10% for texture, day count in Barlow Condensed 600. No orange, no photos.
export const FEATURED_RULE = 'Featured always includes at least one run and one gym challenge.';
