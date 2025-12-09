-- Migration v11: Document Access Logs & RPC Update

-- 1. Create Access Logs Table
create table if not exists public.document_access_logs (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Intentionally loose FK to allow Clerk IDs or anon tracking if we wanted (but we stick to auth for now)
  document_id uuid not null references public.documents(id) on delete cascade,
  accessed_at timestamptz default now(),
  unique(user_id, document_id) -- One entry per user-doc pair, we update timestamp
);

-- Enable RLS
alter table public.document_access_logs enable row level security;

-- Users can view their own logs
create policy "Users can view own access logs" on public.document_access_logs
  for select using (user_id = auth.uid()::text);

-- Server (or user via RPC) can insert/update
-- We'll handle insertions via the RPC primarily, but basic policy:
create policy "Users can insert own access logs" on public.document_access_logs
  for insert with check (user_id = auth.uid()::text);

create policy "Users can update own access logs" on public.document_access_logs
  for update using (user_id = auth.uid()::text);


-- 2. Update increment_view RPC
-- Dropping old one first to change signature safely if needed, though 'create or replace' handles same-name-diff-args usually, 
-- but we want to REPLACE the logic for the existing one or overload it. 
-- Let's overload it? Or just replace. 
-- The previous signature was increment_view(doc_id uuid).
-- We will change it to increment_view(doc_id uuid, viewer_id text default null).

drop function if exists public.increment_view(uuid);

create or replace function public.increment_view(doc_id uuid, viewer_id text default null)
returns void as $$
declare
  owner_id text;
begin
  -- Update document view count
  update public.documents
  set view_count = view_count + 1
  where id = doc_id
  returning user_id into owner_id;

  -- Update owner reputation (User view: +1 Rep)
  if owner_id is not null then
    update public.users
    set 
      total_views = total_views + 1,
      reputation_score = reputation_score + 1
    where id = owner_id;
  end if;

  -- Log Access if viewer is provided
  if viewer_id is not null then
    insert into public.document_access_logs (user_id, document_id, accessed_at)
    values (viewer_id, doc_id, now())
    on conflict (user_id, document_id) 
    do update set accessed_at = now();
  end if;
end;
$$ language plpgsql security definer;
