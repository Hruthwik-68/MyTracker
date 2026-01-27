-- Custom Stats Tables

-- Definitions
create table if not exists public.stat_definitions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  label text not null,
  type text not null default 'number', -- 'number', 'range', 'boolean'
  emoji text,
  color text, -- hex code
  created_at timestamptz default now()
);

-- Values
create table if not exists public.daily_stat_values (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  stat_def_id uuid references public.stat_definitions(id) on delete cascade not null,
  value numeric,
  created_at timestamptz default now(),
  unique(user_id, date, stat_def_id)
);

-- Enable RLS
alter table public.stat_definitions enable row level security;
alter table public.daily_stat_values enable row level security;

-- Policies for Definitions
drop policy if exists "Users can view their own stat definitions" on public.stat_definitions;
create policy "Users can view their own stat definitions" on public.stat_definitions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own stat definitions" on public.stat_definitions;
create policy "Users can insert their own stat definitions" on public.stat_definitions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own stat definitions" on public.stat_definitions;
create policy "Users can update their own stat definitions" on public.stat_definitions for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own stat definitions" on public.stat_definitions;
create policy "Users can delete their own stat definitions" on public.stat_definitions for delete using (auth.uid() = user_id);

-- Policies for Values
drop policy if exists "Users can view their own stat values" on public.daily_stat_values;
create policy "Users can view their own stat values" on public.daily_stat_values for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own stat values" on public.daily_stat_values;
create policy "Users can insert their own stat values" on public.daily_stat_values for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own stat values" on public.daily_stat_values;
create policy "Users can update their own stat values" on public.daily_stat_values for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own stat values" on public.daily_stat_values;
create policy "Users can delete their own stat values" on public.daily_stat_values for delete using (auth.uid() = user_id);
