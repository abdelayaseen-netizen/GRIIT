# QA: P0 F1 onboarding back-button persistence

## scenario A — happy path (regression check)
1. Launch app fresh. Clear AsyncStorage if needed: `npx expo start --clear`.
2. Walk through onboarding: ValueSplash → Goals → SignUp → ProfileSetup → AutoSuggest.
3. Confirm: each step renders, back button works on steps 2+, profile saves.
- expected: completes onboarding, lands on `(tabs)` index.
- pass / fail: ___

## scenario B — force-quit on ProfileSetup (the bug)
1. Walk to ProfileSetup (step 3).
2. Force-quit the app from the iOS app switcher.
3. Relaunch.
- expected: app reopens at ProfileSetup with the same authenticated user; saving the profile works.
- (because the session is preserved by Supabase, this is the most common case.)
- pass / fail: ___

## scenario C — force-quit AND session lost
1. Walk to ProfileSetup (step 3).
2. In Settings → Apps → GRIIT, clear app data (or sign out via supabase debug menu, or delete app and reinstall preserving onboarding store — easier: temporarily call `supabase.auth.signOut()` from a debug button).
3. Relaunch.
- expected: app opens at SignUpScreen (step 2), not stuck on ProfileSetup.
- pass / fail: ___

## scenario D — back arrow from ProfileSetup
1. Walk to ProfileSetup.
2. Tap the back arrow.
- expected: returns to SignUpScreen. (Note: SignUpScreen will show its form to an authed user — this is a known follow-up, not in scope for this fix.)
- pass / fail: ___
