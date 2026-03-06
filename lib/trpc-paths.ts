/**
 * tRPC procedure paths as constants to avoid typos and enable find-usages.
 * Add new paths here as you add or use procedures.
 */
export const TRPC = {
  auth: {
    signUp: 'auth.signUp',
    signIn: 'auth.signIn',
    signOut: 'auth.signOut',
    getSession: 'auth.getSession',
  },
  profiles: {
    get: 'profiles.get',
    create: 'profiles.create',
    update: 'profiles.update',
    getStats: 'profiles.getStats',
    search: 'profiles.search',
  },
  challenges: {
    list: 'challenges.list',
    getFeatured: 'challenges.getFeatured',
    getStarterPack: 'challenges.getStarterPack',
    getById: 'challenges.getById',
    join: 'challenges.join',
    getActive: 'challenges.getActive',
    create: 'challenges.create',
  },
  checkins: {
    getTodayCheckins: 'checkins.getTodayCheckins',
    complete: 'checkins.complete',
    secureDay: 'checkins.secureDay',
  },
  stories: {
    list: 'stories.list',
    create: 'stories.create',
    markViewed: 'stories.markViewed',
  },
  starters: {
    getChallengeIdByStarterId: 'starters.getChallengeIdByStarterId',
    join: 'starters.join',
  },
  streaks: {
    useFreeze: 'streaks.useFreeze',
  },
  leaderboard: {
    getWeekly: 'leaderboard.getWeekly',
  },
  respects: {
    give: 'respects.give',
    getForUser: 'respects.getForUser',
  },
  nudges: {
    send: 'nudges.send',
    getForUser: 'nudges.getForUser',
  },
  notifications: {
    registerToken: 'notifications.registerToken',
    getReminderSettings: 'notifications.getReminderSettings',
    updateReminderSettings: 'notifications.updateReminderSettings',
  },
  accountability: {
    listMine: 'accountability.listMine',
    invite: 'accountability.invite',
    respond: 'accountability.respond',
    remove: 'accountability.remove',
  },
  meta: {
    version: 'meta.version',
  },
  feed: {
    list: 'feed.list',
  },
} as const;
