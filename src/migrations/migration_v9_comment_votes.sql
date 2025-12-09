-- Migration v9: Comment Votes

-- 1. Add Counters to Comments
alter table public.comments
add column if not exists upvote_count int default 0,
add column if not exists downvote_count int default 0;

-- 2. Create Comment Votes Table
create table if not exists public.comment_votes (
  id uuid default gen_random_uuid() primary key,
  user_id text not null references public.users(id),
  comment_id uuid not null references public.comments(id) on delete cascade,
  vote_type int not null check (vote_type in (1, -1)), -- 1 or -1
  created_at timestamptz default now(),
  unique(user_id, comment_id)
);

alter table public.comment_votes enable row level security;

create policy "Comment votes visible to everyone" on public.comment_votes
  for select using (true);

create policy "Authenticated users can vote on comments" on public.comment_votes
  for insert with check (auth.uid()::text = user_id);

create policy "Users can update own comment vote" on public.comment_votes
  for update using (auth.uid()::text = user_id);

create policy "Users can delete own comment vote" on public.comment_votes
  for delete using (auth.uid()::text = user_id);

-- 3. RPC for Comment Voting (No User Reputation Impact)
create or replace function public.handle_comment_vote(c_id uuid, voter_id text, new_vote_type int)
returns void as $$
declare
  existing_vote int;
begin
  select vote_type into existing_vote from public.comment_votes 
  where comment_id = c_id and user_id = voter_id;

  if existing_vote = new_vote_type then
    -- Toggle Off
    delete from public.comment_votes where comment_id = c_id and user_id = voter_id;
    
    if new_vote_type = 1 then
      update public.comments set upvote_count = greatest(0, upvote_count - 1) where id = c_id;
    else
      update public.comments set downvote_count = greatest(0, downvote_count - 1) where id = c_id;
    end if;

  elsif existing_vote is not null then
    -- Change Vote
    update public.comment_votes set vote_type = new_vote_type where comment_id = c_id and user_id = voter_id;

    if new_vote_type = 1 then
      update public.comments set downvote_count = greatest(0, downvote_count - 1), upvote_count = upvote_count + 1 where id = c_id;
    else
      update public.comments set upvote_count = greatest(0, upvote_count - 1), downvote_count = downvote_count + 1 where id = c_id;
    end if;

  else
    -- New Vote
    insert into public.comment_votes (user_id, comment_id, vote_type) values (voter_id, c_id, new_vote_type);

    if new_vote_type = 1 then
      update public.comments set upvote_count = upvote_count + 1 where id = c_id;
    else
      update public.comments set downvote_count = downvote_count + 1 where id = c_id;
    end if;
  end if;
end;
$$ language plpgsql security definer;
