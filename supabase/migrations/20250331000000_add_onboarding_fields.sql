-- Onboarding flow: store answers and initial challenge for user.completeOnboarding.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_motivation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_persona TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_barrier TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_intensity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_social_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_training_time TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_time_preference TEXT DEFAULT '20:00';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS initial_challenge_id UUID REFERENCES challenges(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.onboarding_motivation IS 'Q1: build_discipline | finish_challenge | push_harder';
COMMENT ON COLUMN profiles.onboarding_persona IS 'Q2: athlete | student | professional | transformer';
COMMENT ON COLUMN profiles.onboarding_barrier IS 'Q3: lose_motivation | life_busy | no_accountability | first_time';
COMMENT ON COLUMN profiles.onboarding_intensity IS 'Q4: foundation | push | maximum';
COMMENT ON COLUMN profiles.onboarding_social_style IS 'Q5: solo | visible | partner | squad';
COMMENT ON COLUMN profiles.onboarding_training_time IS 'Q6: morning | midday | evening | whenever';
COMMENT ON COLUMN profiles.notification_time_preference IS 'Derived from onboarding_training_time (HH:mm)';
COMMENT ON COLUMN profiles.initial_challenge_id IS 'First challenge selected during onboarding (FK to challenges)';

NOTIFY pgrst, 'reload schema';
