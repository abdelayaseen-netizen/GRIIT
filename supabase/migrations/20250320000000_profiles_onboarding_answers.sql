-- onboarding_answers: store new-user questionnaire (main goal, focus, days per week, solo/group).
-- onboarding_completed: already exists; ensure default false for new rows.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_answers JSONB DEFAULT '{}';
COMMENT ON COLUMN profiles.onboarding_answers IS 'Onboarding questionnaire: main_goal, focus, days_per_week, challenge_preference';

NOTIFY pgrst, 'reload schema';
