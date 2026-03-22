-- Sprint 5: RLS + storage hardening
-- 1) Allow users to delete their own profile row (required for profiles.deleteAccount with user JWT).
-- 2) Allow users to delete their own objects in task-proofs (defense-in-depth; INSERT/SELECT already exist).

-- -----------------------------------------------------------------------------
-- profiles: DELETE own row
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- storage.objects: DELETE own proofs (path prefix = auth.uid())
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can delete own proofs" ON storage.objects;
CREATE POLICY "Users can delete own proofs" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'task-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

NOTIFY pgrst, 'reload schema';
