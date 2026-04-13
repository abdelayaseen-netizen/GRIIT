-- Prevent duplicate "unlocked_achievement" activity_events from concurrent secureDay retries.
-- Partial unique index keyed on (user_id, achievement_key) for unlocked_achievement events only.

CREATE UNIQUE INDEX IF NOT EXISTS activity_events_unique_unlocked_achievement
ON activity_events (user_id, (metadata->>'achievement_key'))
WHERE event_type = 'unlocked_achievement';

NOTIFY pgrst, 'reload schema';
