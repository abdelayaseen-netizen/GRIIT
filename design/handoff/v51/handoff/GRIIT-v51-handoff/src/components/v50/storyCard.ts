// v50 · "Day n of N" always comes from the enrollment, never the streak or proof count
export const dayIndex = (startedOn: string, today: string) => Math.round((Date.parse(today) - Date.parse(startedOn)) / 86400000) + 1;
export const dayLine = (dayIdx: number, durationDays: number) => `Day ${Math.min(dayIdx, durationDays)} of ${durationDays}`;
export const inviteUrl = (base: string, code: string) => `${base}/i/${code}`; // base = INVITE_BASE until the domain is decided
