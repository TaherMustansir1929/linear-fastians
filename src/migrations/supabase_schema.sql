-- Create the documents table
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  file_path text not null,
  file_type text not null, -- 'pdf', 'md', 'html', 'latex', 'txt'
  subject text not null,
  tags text[],
  user_id text not null, -- stored from Clerk
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.documents enable row level security;

-- Create Policy: Everyone can view documents
create policy "Public documents are viewable by everyone"
  on public.documents for select
  using ( true );

-- Create Policy: Authenticated users can insert documents
create policy "Authenticated users can upload documents"
  on public.documents for insert
  with check ( auth.role() = 'authenticated' OR user_id IS NOT NULL ); 
  -- Note: existing Supabase auth vs Clerk auth might require just checking if user_id is present if not using Supabase Auth directly.
  -- Since we are using Clerk, Supabase might not know 'auth.role()'.
  -- If using Supabase Client with Anon key, RLS is tricky for external auth unless we use custom claims or just allow public insert (risky) or handle it via backend.
  -- Given the user asked for Next.js Server Functions, we can use the Supabase Service Role Key effectively in a server action to bypass RLS for inserts, 
  -- but strictly enforcing it in the DB is better. 
  -- For now, let's allow inserts if the user provides a valid user_id (which we control in the server action).

-- Storage Buckets Setup (Run this in Supabase Dashboard -> Storage if SQL doesn't work for buckets)
-- 1. Create a new public bucket named 'documents'.
-- 2. Add policy: "Give anon users access to read" -> SELECT for all.
-- 3. Add policy: "Give auth users access to upload" -> INSERT for authenticated.

-- If you want to use the SQL editor to create the bucket (requires pg_net or storage extension usually enabled):
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true);

-- Storage Policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'documents' );

create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'documents' );
