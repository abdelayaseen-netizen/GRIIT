# GRIIT App Store Optimization Strategy

## Positioning
- **One-line:** Duolingo for discipline meets Strava for self-improvement
- **Demographic:** Men 18-30 focused on physical/mental resilience and self-improvement
- **Differentiator:** Social proof + accountability layer over solo habit tracking
- **Category (App Store):** Health & Fitness (primary), Lifestyle (secondary)
  - Rationale: Health & Fitness has 68% annual plan adoption (RevenueCat 2026), highest LTV ceiling

## App Name
- **Current:** GRIIT — Challenge Tracker
- **Considered alternatives:**
  - GRIIT: Discipline Daily
  - GRIIT: Habits & Streaks
  - GRIIT — Build Discipline

## Subtitle (30 char limit on App Store)
Candidate options (test in App Store Connect):
- "Build discipline. Daily."
- "Daily challenges. Real proof."
- "Streaks for real men."
- "Discipline, not motivation."

## Keywords (100 char limit, comma-separated, no spaces)
Priority bucket - high volume, high relevance:
- discipline,habits,streak,challenge,accountability,routine,goals,fitness,motivation,self,improve,daily

Secondary bucket - competitor-overlap, lower volume:
- habit,tracker,75hard,morning,routine,journal,checkin,grit,build,strong,mental,toughness

Avoid: trademarked names, "Duolingo", "Strava" (will be rejected)

## Description Structure (4000 char limit)

### Hook (first 2 lines visible without "more")
"Most habit apps track. GRIIT proves.  
Build the kind of discipline that actually shows up - and post the proof."

### Body (after expand)
- 3 short feature paragraphs (Challenges, Streaks, Social proof)
- Social-proof cluster: "Join the men who stopped quitting"
- 3 bullet feature lists (max 5 bullets each)
- Pricing transparency: free trial -> $X/mo or $X/yr
- Closing: "GRIIT is built by one developer obsessed with making discipline stick."

## Screenshots (10-screenshot framework)

iPhone 6.7" (required) and iPhone 6.5" (compatibility):

1. **Hero - identity hook:** Streak hero showing "Day 12. You're becoming someone who shows up."
2. **Core loop:** Task completion screen with proof photo
3. **Social proof:** Live feed of users completing challenges (with consent)
4. **Streaks dashboard:** WeekStrip + freeze visible
5. **Hard mode:** Verified completion (heart rate, location, time gate)
6. **Accountability pairs:** Partner notification "David completed Day 47"
7. **Discover:** Challenge templates carousel
8. **Profile/calendar:** Visual streak history
9. **Paywall (optional):** Show what Pro unlocks (only if paywall design is final)
10. **Closing:** "Discipline isn't your goal. It's your default." - identity-tier line

## Localization (post-launch decision)
- Phase 1: en-US only
- Phase 2 candidates (high RevenueCat conversion regions): en-GB, en-CA, en-AU
- Phase 3: es-MX, pt-BR

## Review Strategy
- In-app review prompt: trigger on streak milestone (day 7 + day 30) ONLY for users who have not yet rated
- Use `expo-store-review` (already in package.json)
- Never block app function behind review request
- Track `app_review_prompted` event in PostHog

## ASO Tracking (post-launch)
- Tools to consider: AppFollow (free tier), Mobile Action, Sensor Tower
- Track weekly: keyword rank, conversion rate, impression-to-install rate
- Rotate screenshots every 4-6 weeks based on conversion data

## Known Risks
- Apple may reject "75hard" as keyword if it's trademarked - verify before submission
- Testimonials in screenshots must be real users with documented consent
- Hard paywall in screenshots requires reviewer can complete trial signup with sandbox account

## Research Anchors
- RevenueCat 2026: Health & Fitness 68% annual plan adoption
- ASO best practice: keyword changes take 7-14 days to settle in rankings
- Apple Search Ads vs organic: organic conversions 2-3x higher LTV
