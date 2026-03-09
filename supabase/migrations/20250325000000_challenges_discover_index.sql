-- Index for Discover query: visibility, status, is_featured DESC, participants_count DESC
-- Speeds up getFeatured / discover listing.
CREATE INDEX IF NOT EXISTS idx_challenges_discover
  ON challenges (visibility, status, is_featured DESC, participants_count DESC);

NOTIFY pgrst, 'reload schema';
