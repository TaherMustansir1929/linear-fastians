-- Migration v8: Fix Comments Foreign Key

-- We missed the Foreign Key on comments.user_id in v5.
-- This is required for Supabase to perform the join "user:users(*)".

alter table public.comments
add constraint comments_user_id_fkey
foreign key (user_id)
references public.users(id)
on delete cascade;
