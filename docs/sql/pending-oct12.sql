-- Pending production SQL for 12 Oct 2026. Do not run this from the app or from a script.
-- Each statement is commented with what it does and why. A person applies it by hand.

-- Prayer and masjid challenges are tagged Daily habits, so Start here says "Matches daily habits"
-- for a faith goal. Set the stored category to faith. Title matching already treats these as faith
-- until this is applied.
UPDATE challenges
SET category = 'faith'
WHERE title IN ('Prayer Group', 'Pray 5 times', 'Quran Daily', 'Pray in Masjid')
  AND category IS DISTINCT FROM 'faith';

-- 75 Day Hard is a fitness challenge. The anon-visible catalog had one published PUBLIC row
-- titled "75 day hard" on 11 Oct 2026. This updates every title variant the anon key cannot see.
UPDATE challenges
SET category = 'fitness'
WHERE (title ILIKE '75 day hard' OR title ILIKE '75 Day Hard')
  AND category IS DISTINCT FROM 'fitness';

-- Duplicate public titles measured with the anon key on 11 Oct 2026: "workout / cardio" x2
-- and "go to the gym" x2. Discover now hides the extra copy in the app. This keeps the row
-- with the higher participants_count and archives the other. Review the ids before applying.
-- Not executed here because it needs the service role and a human check of which row has real members.
-- WITH ranked AS (
--   SELECT id, title, participants_count,
--          row_number() OVER (
--            PARTITION BY lower(regexp_replace(title, '\s+', ' ', 'g'))
--            ORDER BY participants_count DESC NULLS LAST, id
--          ) AS n
--   FROM challenges
--   WHERE status = 'published' AND visibility = 'PUBLIC'
-- )
-- UPDATE challenges
-- SET status = 'archived'
-- WHERE id IN (SELECT id FROM ranked WHERE n > 1);
