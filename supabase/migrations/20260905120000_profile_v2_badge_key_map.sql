-- Profile v2 badge key mapping. NOT APPLIED.
-- Stop: tell the operator to apply this after review.
--
-- There is no `badges` table. Unlocks live in public.user_achievements
-- (achievement_key, unlocked_at). Current keys/labels are defined in
-- backend/lib/achievement-definitions.ts.
--
-- Spec mark          | canonical key    | aliases copied from
-- 3 days             | 3day             | 3day (3-Day Fire)
-- 7 days             | 7day             | 7day, streak_7
-- 14 days            | 14day            | 14day, streak_14, consistency
-- 30 days            | 30day            | 30day, streak_30
-- 100 verified       | total_days_100   | total_days_100 (Century Grinder)
--
-- Unmapped (stay as-is, not shown on profile v2):
-- 60day, streak_75, streak_100, and all social/creation/mastery keys
-- except total_days_100.
--
-- This copies alias rows onto the canonical key (earliest unlocked_at wins).
-- It does not delete old keys. No earn notifications.

INSERT INTO public.user_achievements (user_id, achievement_key, unlocked_at)
SELECT user_id, '7day', MIN(unlocked_at)
FROM public.user_achievements
WHERE achievement_key = 'streak_7'
GROUP BY user_id
ON CONFLICT (user_id, achievement_key) DO NOTHING;

INSERT INTO public.user_achievements (user_id, achievement_key, unlocked_at)
SELECT user_id, '14day', MIN(unlocked_at)
FROM public.user_achievements
WHERE achievement_key IN ('streak_14', 'consistency')
GROUP BY user_id
ON CONFLICT (user_id, achievement_key) DO NOTHING;

INSERT INTO public.user_achievements (user_id, achievement_key, unlocked_at)
SELECT user_id, '30day', MIN(unlocked_at)
FROM public.user_achievements
WHERE achievement_key = 'streak_30'
GROUP BY user_id
ON CONFLICT (user_id, achievement_key) DO NOTHING;
