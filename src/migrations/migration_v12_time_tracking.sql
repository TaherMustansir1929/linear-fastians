-- Migration v12: Time Tracking

-- 1. Add time_spent_seconds to document_access_logs
alter table public.document_access_logs
add column if not exists time_spent_seconds int default 0;

-- 2. RPC to log time
-- This allows incrementing time efficiently without overwriting other fields
create or replace function public.log_time_spent(doc_id uuid, viewer_id text, seconds int)
returns void as $$
begin
  insert into public.document_access_logs (user_id, document_id, accessed_at, time_spent_seconds)
  values (viewer_id, doc_id, now(), seconds)
  on conflict (user_id, document_id) 
  do update set 
    time_spent_seconds = document_access_logs.time_spent_seconds + EXCLUDED.time_spent_seconds,
    accessed_at = now(); -- Update access time too as they are actively viewing it
end;
$$ language plpgsql security definer;
