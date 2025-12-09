-- Migration v10: Bookmarks

create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id text not null references public.users(id),
  document_id uuid not null references public.documents(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, document_id)
);

alter table public.bookmarks enable row level security;

-- Users can see their own bookmarks
create policy "Users can view own bookmarks" on public.bookmarks
  for select using (auth.uid()::text = user_id);

-- Users can create/delete their own bookmarks
create policy "Users can manage own bookmarks" on public.bookmarks
  for all using (auth.uid()::text = user_id);

-- Add bookmark count to documents?
-- Optional, but useful for "Most Bookmarked" later.
alter table public.documents 
add column if not exists bookmark_count int default 0;
