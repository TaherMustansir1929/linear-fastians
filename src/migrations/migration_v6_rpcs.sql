-- Migration v6: RPCs for atomic operations (Gamification)

-- 1. Increment View
create or replace function public.increment_view(doc_id uuid)
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
  -- Only if owner exists in users table (synced)
  if owner_id is not null then
    update public.users
    set 
      total_views = total_views + 1,
      reputation_score = reputation_score + 1
    where id = owner_id;
  end if;
end;
$$ language plpgsql security definer;

-- 2. Handle Vote
-- Function to handle atomic vote logic involves checking existing vote, removing it or changing it.
-- This is complex for a single SQL function if we want to toggle.
-- Let's do a simpler "upsert_vote" RPC.

create or replace function public.handle_vote(doc_id uuid, voter_id text, new_vote_type int)
returns void as $$
declare
  existing_vote int;
  owner_id text;
begin
  select vote_type into existing_vote from public.document_votes 
  where document_id = doc_id and user_id = voter_id;

  -- Get Document Owner
  select user_id into owner_id from public.documents where id = doc_id;

  if existing_vote = new_vote_type then
    -- Remove Vote (Toggle Off)
    delete from public.document_votes where document_id = doc_id and user_id = voter_id;
    
    -- Decrement Document Counter
    if new_vote_type = 1 then
      update public.documents set upvote_count = upvote_count - 1 where id = doc_id;
      -- Revert Owner Rep (+5 was given, so -5)
      update public.users set total_upvotes = total_upvotes - 1, reputation_score = reputation_score - 5 where id = owner_id;
    else
      update public.documents set downvote_count = downvote_count - 1 where id = doc_id;
      -- Revert Owner Rep (-2 was given, so +2)
      update public.users set total_downvotes = total_downvotes - 1, reputation_score = reputation_score + 2 where id = owner_id;
    end if;
  
  elsif existing_vote is not null then
    -- Change Vote (e.g. Up to Down)
    update public.document_votes set vote_type = new_vote_type where document_id = doc_id and user_id = voter_id;
    
    if new_vote_type = 1 then
      -- Was Down (-1), Now Up (1)
      update public.documents set downvote_count = downvote_count - 1, upvote_count = upvote_count + 1 where id = doc_id;
      -- Owner: Revert Down (- -2 = +2) AND Apply Up (+5) = +7 total
      update public.users 
      set total_downvotes = total_downvotes - 1, total_upvotes = total_upvotes + 1, reputation_score = reputation_score + 7 
      where id = owner_id;
    else
      -- Was Up (1), Now Down (-1)
      update public.documents set upvote_count = upvote_count - 1, downvote_count = downvote_count + 1 where id = doc_id;
      -- Owner: Revert Up (-5) AND Apply Down (-2) = -7 total
      update public.users 
      set total_upvotes = total_upvotes - 1, total_downvotes = total_downvotes + 1, reputation_score = reputation_score - 7 
      where id = owner_id;
    end if;

  else
    -- New Vote
    insert into public.document_votes (user_id, document_id, vote_type) values (voter_id, doc_id, new_vote_type);
    
    if new_vote_type = 1 then
      update public.documents set upvote_count = upvote_count + 1 where id = doc_id;
      -- Owner: +5 Rep
      update public.users set total_upvotes = total_upvotes + 1, reputation_score = reputation_score + 5 where id = owner_id;
    else
      update public.documents set downvote_count = downvote_count + 1 where id = doc_id;
      -- Owner: -2 Rep
      update public.users set total_downvotes = total_downvotes + 1, reputation_score = reputation_score - 2 where id = owner_id;
    end if;
  end if;
end;
$$ language plpgsql security definer;
