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
    getPublicByUsername: 'profiles.getPublicByUsername',
    create: 'profiles.create',
    update: 'profiles.update',
    validateSubscription: 'profiles.validateSubscription',
    getStats: 'profiles.getStats',
    getCompletedChallenges: 'profiles.getCompletedChallenges',
    getSecuredDateKeys: 'profiles.getSecuredDateKeys',
    setWeeklyGoal: 'profiles.setWeeklyGoal',
    getWeeklyProgress: 'profiles.getWeeklyProgress',
    getWeeklyTrend: 'profiles.getWeeklyTrend',
    search: 'profiles.search',
    deleteAccount: 'profiles.deleteAccount',
  },
  challenges: {
    list: 'challenges.list',
    getFeatured: 'challenges.getFeatured',
    getStarterPack: 'challenges.getStarterPack',
    getById: 'challenges.getById',
    join: 'challenges.join',
    leave: 'challenges.leave',
    getActive: 'challenges.getActive',
    listMyActive: 'challenges.listMyActive',
    create: 'challenges.create',
    startTeamChallenge: 'challenges.startTeamChallenge',
    getTeamMembers: 'challenges.getTeamMembers',
  },
  sharedGoal: {
    logProgress: 'sharedGoal.logProgress',
    getRecentLogs: 'sharedGoal.getRecentLogs',
    getContributions: 'sharedGoal.getContributions',
  },
  checkins: {
    getTodayCheckins: 'checkins.getTodayCheckins',
    getTodayCheckinsForUser: 'checkins.getTodayCheckinsForUser',
    complete: 'checkins.complete',
    secureDay: 'checkins.secureDay',
    markAsShared: 'checkins.markAsShared',
    getShareStats: 'checkins.getShareStats',
    setMilestoneShared: 'checkins.setMilestoneShared',
    getMilestoneShared: 'checkins.getMilestoneShared',
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
  user: {
    completeOnboarding: 'user.completeOnboarding',
  },
  meta: {
    version: 'meta.version',
  },
  referrals: {
    recordOpen: 'referrals.recordOpen',
    markJoinedChallenge: 'referrals.markJoinedChallenge',
  },
  feed: {
    list: 'feed.list',
    listMine: 'feed.listMine',
    getMySummary: 'feed.getMySummary',
    react: 'feed.react',
    comment: 'feed.comment',
    getComments: 'feed.getComments',
  },
  teams: {
    createTeam: 'teams.createTeam',
    joinTeam: 'teams.joinTeam',
    getMyTeam: 'teams.getMyTeam',
    leaveTeam: 'teams.leaveTeam',
    getTeamFeed: 'teams.getTeamFeed',
  },
  team: {
    create: 'team.create',
    joinByCode: 'team.joinByCode',
    joinByLink: 'team.joinByLink',
    leave: 'team.leave',
    kick: 'team.kick',
    getMembers: 'team.getMembers',
    getLeaderboard: 'team.getLeaderboard',
    generateInviteLink: 'team.generateInviteLink',
    getMyTeams: 'team.getMyTeams',
    getForChallenge: 'team.getForChallenge',
  },
  achievements: {
    getForUser: 'achievements.getForUser',
  },
  integrations: {
    getStravaAuthUrl: 'integrations.getStravaAuthUrl',
    isStravaEnabled: 'integrations.isStravaEnabled',
    getStravaConnection: 'integrations.getStravaConnection',
    getStravaActivities: 'integrations.getStravaActivities',
    getStravaAthlete: 'integrations.getStravaAthlete',
    disconnectStrava: 'integrations.disconnectStrava',
    verifyStravaTask: 'integrations.verifyStravaTask',
  },
} as const;
