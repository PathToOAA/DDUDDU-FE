-- Run only if saved_courses has no owner UPDATE policy.
-- Existing SELECT / INSERT policies remain unchanged.
begin;
drop policy if exists "Update own saved course details" on public.saved_courses;
create policy "Update own saved course details" on public.saved_courses
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
commit;
