// Frames 135-136. Twelve badges, each earned only from server facts.
// Badges record what has happened. They are never held out as a goal and never granted by hand.
export type BadgeDef = { id: string; name: string; mark: string; rule: string; target: number; source: string; progressCopy: (n: number) => string };
const of = (t: number) => (n: number) => Math.min(n, t) + ' of ' + t;
export const BADGES: BadgeDef[] = [
  ...[3, 7, 14, 30, 75].map(t => ({ id: 'streak_' + t, name: t + '-day streak', mark: String(t), rule: 'Secure ' + t + ' days in a row.', target: t,
    source: 'max run of consecutive day_secures dates (profile timezone); freeze and Last Stand days hold the run but do not add to it', progressCopy: of(t) })),
  { id: 'secured_100', name: '100 days secured', mark: '100', rule: 'Secure 100 days in total.', target: 100, source: 'count(day_secures) for user_id', progressCopy: of(100) },
  { id: 'finish_1', name: 'First finish', mark: 'flag', rule: 'Finish a challenge.', target: 1, source: "count(active_challenges where status = 'completed')", progressCopy: of(1) },
  { id: 'finish_3', name: 'Three finishes', mark: 'flag-triangle-right', rule: 'Finish three challenges.', target: 3, source: "count(active_challenges where status = 'completed')", progressCopy: of(3) },
  { id: 'comeback', name: 'Comeback', mark: 'rotate-ccw', rule: "Secure a day right after a day that wasn't secured.", target: 1,
    source: 'exists day_secures(d) where d-1 is a due day with no day_secures row and no freeze or Last Stand record', progressCopy: () => 'Not yet' },
  { id: 'full_house', name: 'Full house', mark: 'users', rule: 'Finish a group challenge where every member finished.', target: 1,
    source: "group challenge with every roster member's active_challenges.status = 'completed'", progressCopy: () => 'Not yet' },
  { id: 'early_10', name: 'Early', mark: 'sunrise', rule: 'Secure 10 days that included a task with a Time gate.', target: 10,
    source: 'count(distinct day_secures dates having a check-in on a task with gate_time_start or gate_time_end)', progressCopy: of(10) },
  { id: 'camera_30', name: 'Camera 30', mark: 'camera', rule: 'Post 30 proofs taken with the camera.', target: 30,
    source: 'count(check_ins where proof_photo_url is not null and capture_source = camera)', progressCopy: of(30) },
];
