# Monetization Infrastructure — Final Output

Implementation of RevenueCat-based monetization per `cursor-prompt-monetization.md`.

## Phase 1: RevenueCat SDK & Initialization

| Item | File | Status | Notes |
|------|------|--------|-------|
| .env.example updated | .env.example | Done | EXPO_PUBLIC_REVENUECAT_IOS_API_KEY, EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY |
| lib/subscription.ts rewritten | lib/subscription.ts | Done | initializeRevenueCat, checkPremiumStatus, getOfferings, purchasePackage, restorePurchases, getCustomerInfo; syncSubscriptionToSupabase; safe require() for Expo Go |
| AppContext updated | contexts/AppContext.tsx | Done | isPremium state, refreshPremiumStatus, addSubscriptionChangeListener; initSubscription calls initializeRevenueCat |
| Supabase sync function | lib/subscription.ts | Done | syncSubscriptionToSupabase(userId, customerInfo) updates profiles by user_id |

## Phase 2: Pricing Screen

| Item | File | Status | Notes |
|------|------|--------|-------|
| Pricing screen created | app/pricing.tsx | Done | Full-screen; header, features, package selector, CTA, restore, legal |
| Dynamic offerings loading | app/pricing.tsx | Done | getOfferings(), monthly/annual from RevenueCat, skeleton + retry |
| Purchase flow working | app/pricing.tsx | Done | purchasePackage(selectedPackage), refreshPremiumStatus, navigate back |
| Restore purchases working | app/pricing.tsx | Done | restorePurchases(), refreshPremiumStatus, message |
| Contextual messages by source | app/pricing.tsx | Done | SOURCE_MESSAGES for challenge_limit, streak_freeze, last_stand, create_challenge, settings, profile |

## Phase 3: Subscription Hook & Gate Utility

| Item | File | Status | Notes |
|------|------|--------|-------|
| useSubscription hook | hooks/useSubscription.ts | Done | isPremium, requirePremium(source), refreshPremiumStatus |
| PremiumBadge component | components/PremiumBadge.tsx | Done | Optional label "PRO" \| "PREMIUM" (pill), Crown icon |
| PremiumFeature wrapper | components/PremiumFeature.tsx | Done | Wraps children; lock overlay + navigate on press when !isPremium |

## Phase 4: Paywall Gates

| Gate | File Modified | Trigger Point | Free User Experience | Premium User Experience |
|------|---------------|---------------|----------------------|-------------------------|
| 3rd challenge | app/challenge/[id].tsx | handleJoin, handleCommitmentConfirm | canJoinChallenge(count).allowed false → requirePremium('challenge_limit'); limit text under CTA | Join as usual |
| Streak freeze | app/(tabs)/index.tsx | "Use streak freeze" CTA | requirePremium('streak_freeze') before modal; PRO badge on button | Use freeze modal, 1/month (backend) |
| Last Stand | backend profiles.getStats, app/(tabs)/index.tsx | getStats applies last_stand_uses | lastStandRequiresPremium; "Upgrade to use Last Stand" CTA; PRO next to "Last Stands remaining" | Last stand applied when eligible |
| Create challenge | app/(tabs)/create.tsx, app/(tabs)/_layout.tsx | Open Create tab | requirePremium('create_challenge'), return null; PRO badge on Create tab icon | Full create flow |

## Phase 5: Profile & Settings Integration

| Item | File | Status | Notes |
|------|------|--------|-------|
| Profile subscription section | app/(tabs)/profile.tsx | Done | GRIIT Free + "Upgrade to Premium →" or GRIIT Premium + renewal date + "Manage subscription" |
| Settings subscription row | app/settings.tsx | Done | Subscription row → pricing (free) or open subscription management (premium) |
| Settings restore purchases | app/settings.tsx | Done | Restore row; refreshPremiumStatus + refetchAll on success |
| Home upgrade prompt | app/(tabs)/index.tsx | Done | Dismissible card "Upgrade to Premium" after stats, before DailyStatus |

## Phase 6: Edge Cases

| Scenario | Handled? | How |
|----------|----------|-----|
| No internet | Yes | pricing.tsx: "Please check your connection and try again" for purchase error |
| RevenueCat not initialized | Yes | getPurchases() null on web/Expo Go; treat as free, no crash |
| Purchase pending | Yes | pricing.tsx: "Purchase pending — we'll update your status when confirmed" |
| Subscription expired | Yes | Profile shows GRIIT Free + Upgrade; isPremium false |
| Already premium | Yes | pricing.tsx: "You're already on Premium" screen, no purchase UI |
| Offerings fail to load | Yes | Retry button on pricing screen |
| Double-tap prevention | Yes | purchasing state disables CTA, loading indicator |

## Phase 7: Clean Up

| Item | Status | Notes |
|------|--------|-------|
| PremiumPaywallModal | Gutted | CTA navigates to /pricing with source; removed from settings |
| Old subscription placeholder | Replaced | lib/subscription.ts is full RevenueCat implementation |
| Imports | Updated | Settings no longer uses PremiumPaywallModal |

## Component Summary

| Component | File(s) | Status | Notes |
|-----------|---------|--------|-------|
| .env.example | .env.example | Done | iOS + Android RevenueCat keys |
| lib/subscription.ts | lib/subscription.ts | Done | RevenueCat init, purchase, restore, sync; Expo Go safe |
| AppContext | contexts/AppContext.tsx | Done | isPremium, refreshPremiumStatus, listener |
| Supabase sync | lib/subscription.ts | Done | syncSubscriptionToSupabase by user_id |
| Pricing screen | app/pricing.tsx | Done | Full flow, source param |
| useSubscription | hooks/useSubscription.ts | Done | |
| PremiumBadge | components/PremiumBadge.tsx | Done | PRO/PREMIUM pill + Crown |
| PremiumFeature | components/PremiumFeature.tsx | Done | |
| Gate: 3rd challenge | app/challenge/[id].tsx | Done | listMyActive count + canJoinChallenge |
| Gate: Streak freeze | app/(tabs)/index.tsx | Done | requirePremium before modal, PRO badge |
| Gate: Last Stand | backend profiles.ts, app/(tabs)/index.tsx | Done | lastStandRequiresPremium, upgrade CTA |
| Gate: Create challenge | app/(tabs)/create.tsx, _layout.tsx | Done | Redirect + PRO on tab |
| Profile subscription | app/(tabs)/profile.tsx | Done | |
| Settings subscription/restore | app/settings.tsx | Done | |
| Home upgrade prompt | app/(tabs)/index.tsx | Done | Dismissible card |
| Old code cleanup | PremiumPaywallModal, settings | Done | Modal gutted, redirects to pricing |
| Edge case handling | pricing, subscription, profile | Done | As in table above |

## Routes

- **ROUTES.PRICING** added in `lib/routes.ts` for `/pricing`.

## Discover

- Free users see "Free: 3 active challenges" (FREE_LIMITS.MAX_ACTIVE_CHALLENGES) on Discover screen (subtle).
