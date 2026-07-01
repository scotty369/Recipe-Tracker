-- Recipe Tracker Schema
-- Run this in your Supabase SQL Editor

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  sub text not null,
  emoji text default '📄',
  servings text,
  time text,
  difficulty text,
  ingredients jsonb default '[]',
  instructions text,
  notes text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table recipes enable row level security;

-- Public read/write policies (no login required)
create policy "Public can read recipes"
  on recipes for select using (true);

create policy "Public can insert recipes"
  on recipes for insert with check (true);

create policy "Public can update recipes"
  on recipes for update using (true);

create policy "Public can delete recipes"
  on recipes for delete using (true);
