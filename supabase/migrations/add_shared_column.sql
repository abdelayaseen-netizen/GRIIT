-- Track when a user shares a task completion (for gamification / getShareStats).
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS shared BOOLEAN DEFAULT false;
