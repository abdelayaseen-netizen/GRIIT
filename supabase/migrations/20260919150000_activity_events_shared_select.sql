-- Chunk Q A2b. Current SELECT "Anyone can read activity" lets any non-anonymous
-- authenticated user read every activity_events row (including unshared proofs).
-- Same policy name, idempotent DROP / CREATE. Shared rows stay public; a user
-- can always read their own unshared rows. Service role bypasses RLS.
-- Writer for the flip remains service-role after ownership check (A2).

DROP POLICY IF EXISTS "Anyone can read activity" ON public.activity_events;
CREATE POLICY "Anyone can read activity" ON public.activity_events
  FOR SELECT
  TO authenticated
  USING (
    (shared = true OR user_id = auth.uid())
    AND (
      auth.uid() = user_id
      OR coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
  );

NOTIFY pgrst, 'reload schema';
