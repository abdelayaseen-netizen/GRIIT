export type BoardRow = { userId: string; name: string; securedThisWeek: number; verifiedThisWeek: number; lastSecuredAt: string };
// 2–10 people. Sort: secured desc, verified desc, earlier lastSecuredAt first. Own row highlighted and labelled "You".
export const sortBoard = (rows: BoardRow[]) => [...rows].sort((a, b) => b.securedThisWeek - a.securedThisWeek || b.verifiedThisWeek - a.verifiedThisWeek || a.lastSecuredAt.localeCompare(b.lastSecuredAt));
export const EMPTY_BOARD = { title: 'A board needs two.', body: 'Invite someone to see how you compare this week.', action: 'Invite' };
