-- Create mosques table (Verified Data)
create table if not exists public.mosques (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  city text,
  state text,
  zip_code text,
  country text,
  place_id text unique,
  last_verified timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) on mosques
alter table public.mosques enable row level security;

-- Policies for mosques
create policy "Allow public read access"
  on public.mosques
  for select
  to public
  using (true);

-- Create mosque_submissions table (Staging Data)
create table if not exists public.mosque_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  city text,
  state text,
  zip_code text,
  country text,
  place_id text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_by uuid references auth.users(id),
  submitted_at timestamptz default now()
);

-- Enable RLS on submissions
alter table public.mosque_submissions enable row level security;

-- Policies for submissions
create policy "Allow authenticated insert"
  on public.mosque_submissions
  for insert
  to authenticated
  with check (true);

create policy "Allow users to view own submissions"
  on public.mosque_submissions
  for select
  to authenticated
  using (auth.uid() = submitted_by);
