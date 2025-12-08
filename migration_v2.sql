-- Migration v2: Add uploader details
alter table public.documents
add column if not exists uploader_name text,
add column if not exists uploader_avatar text; -- Optional, for future use or if Clerk user image URL is stored
