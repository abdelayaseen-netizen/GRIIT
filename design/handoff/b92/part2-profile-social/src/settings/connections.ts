export const CONNECTIONS = {
  strava: { connected: (name: string) => `Connected as ${name}`, disconnect: 'Disconnect', connect: 'Connect', note: 'Runs from Strava show “Verified by Strava” on the task and the post.',
    confirm: 'Disconnect Strava? Runs will need a photo or be self-reported.', ok: 'Strava connected.', fail: 'Strava didn’t connect. Try again from here.' },
  appleHealth: { label: 'Apple Health', sub: 'Steps and workouts', badge: 'Coming soon', enabled: false },
};
export const PRO_PERKS = ['Auto-verify runs', 'Extra freezes (hold up to 4 instead of 2)', 'Stats', 'Premium stickers']; // additive; never gate the free core
export const FREE_CORE = ['Challenges', 'Proofs', 'Streaks', 'Streak history', 'Per-challenge progress', 'Badges', 'Leaderboards', 'Invites'];
export const PRO_STATS = ['Charts', 'Best times', 'Verified %', 'Month over month'];
