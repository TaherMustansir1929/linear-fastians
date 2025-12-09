-- Migration v5: Social Features & Gamification Schema

-- 1. Create Users Table (Sync with Clerk via Webhooks or Manual Creation on First Action)
create table if not exists public.users (
  id text primary key, -- Matches Clerk user ID
  email text not null,
  full_name text,
  avatar_url text,
  reputation_score int default 0,
  total_views int default 0,
  total_upvotes int default 0,
  total_downvotes int default 0,
  created_at timestamptz default now()
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Users can read all other users (for leaderboard)
create policy "Users are viewable by everyone" on public.users
  for select using (true);

-- Users can update their own data (mostly handled by server actions for rep, but good for profile)
create policy "Users can update own data" on public.users
  for update using (auth.uid()::text = id);
  
-- 2. Alter Documents Table to add Counters
alter table public.documents 
add column if not exists view_count int default 0,
add column if not exists upvote_count int default 0,
add column if not exists downvote_count int default 0;

-- 3. Create Document Votes Table
create table if not exists public.document_votes (
  id uuid default gen_random_uuid() primary key,
  user_id text not null references public.users(id), -- If we enforce FK
  document_id uuid not null references public.documents(id) on delete cascade,
  vote_type int not null check (vote_type in (1, -1)), -- 1 for Up, -1 for Down
  created_at timestamptz default now(),
  unique(user_id, document_id) -- One vote per user per doc
);

-- Enable RLS on votes
alter table public.document_votes enable row level security;

-- Everyone can see votes
create policy "Votes are viewable by everyone" on public.document_votes
  for select using (true);

-- Authenticated users can vote
create policy "Authenticated users can vote" on public.document_votes
  for insert with check (auth.uid()::text = user_id);

create policy "Users can update own vote" on public.document_votes
  for update using (auth.uid()::text = user_id);

create policy "Users can delete own vote" on public.document_votes
  for delete using (auth.uid()::text = user_id);

-- 4. Create Comments Table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Intentionally loose FK to allow Clerk IDs
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS on comments
alter table public.comments enable row level security;

-- Everyone can view comments
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

-- Authenticated users can comment
create policy "Authenticated users can comment" on public.comments
  for insert with check (auth.uid()::text = user_id);

-- Users can delete their own comments
create policy "Users can delete own comments" on public.comments
  for delete using (auth.uid()::text = user_id);
