-- =============================================
-- My Daily Dashboard — Full Database Setup
-- Run this in Supabase SQL Editor (supabase.com/dashboard → SQL Editor)
-- =============================================

-- 1. NOTES
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.notes enable row level security;
drop policy if exists "Users can view their own notes" on public.notes;
create policy "Users can view their own notes" on public.notes for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own notes" on public.notes;
create policy "Users can insert their own notes" on public.notes for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own notes" on public.notes;
create policy "Users can update their own notes" on public.notes for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own notes" on public.notes;
create policy "Users can delete their own notes" on public.notes for delete using (auth.uid() = user_id);

-- 2. DAILY STATS
create table if not exists public.daily_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  calories_intake numeric,
  calories_burned numeric,
  protein numeric,
  carbs numeric,
  fibre numeric,
  water_litres numeric,
  sleep_hours numeric,
  energy_level integer,
  focus_level integer,
  consistency boolean default true,
  dsa_hours numeric default 0,
  lld_hours numeric default 0,
  problems_solved integer default 0,
  gym_hours numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);
alter table public.daily_stats enable row level security;
drop policy if exists "Users can view their own daily_stats" on public.daily_stats;
create policy "Users can view their own daily_stats" on public.daily_stats for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own daily_stats" on public.daily_stats;
create policy "Users can insert their own daily_stats" on public.daily_stats for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own daily_stats" on public.daily_stats;
create policy "Users can update their own daily_stats" on public.daily_stats for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own daily_stats" on public.daily_stats;
create policy "Users can delete their own daily_stats" on public.daily_stats for delete using (auth.uid() = user_id);

-- 3. CHECKLIST ITEMS (definitions of checklist items)
create table if not exists public.checklist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  category text not null default 'ROUTINE', -- 'ROUTINE', 'SUPPLEMENT', 'DIET'
  name text not null,
  is_persistent boolean default true,
  order_index integer default 0,
  metadata jsonb,
  created_at timestamptz default now()
);
alter table public.checklist_items enable row level security;
drop policy if exists "Users can view their own checklist_items" on public.checklist_items;
create policy "Users can view their own checklist_items" on public.checklist_items for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own checklist_items" on public.checklist_items;
create policy "Users can insert their own checklist_items" on public.checklist_items for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own checklist_items" on public.checklist_items;
create policy "Users can update their own checklist_items" on public.checklist_items for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own checklist_items" on public.checklist_items;
create policy "Users can delete their own checklist_items" on public.checklist_items for delete using (auth.uid() = user_id);

-- 4. DAILY CHECKLISTS (daily log entries for checked items)
create table if not exists public.daily_checklists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  checklist_item_id uuid references public.checklist_items(id) on delete cascade not null,
  is_done boolean default false,
  value text,
  created_at timestamptz default now(),
  unique(user_id, date, checklist_item_id)
);
alter table public.daily_checklists enable row level security;
drop policy if exists "Users can view their own daily_checklists" on public.daily_checklists;
create policy "Users can view their own daily_checklists" on public.daily_checklists for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own daily_checklists" on public.daily_checklists;
create policy "Users can insert their own daily_checklists" on public.daily_checklists for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own daily_checklists" on public.daily_checklists;
create policy "Users can update their own daily_checklists" on public.daily_checklists for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own daily_checklists" on public.daily_checklists;
create policy "Users can delete their own daily_checklists" on public.daily_checklists for delete using (auth.uid() = user_id);

-- 5. STREAKS
create table if not exists public.streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  is_success boolean default false,
  created_at timestamptz default now(),
  unique(user_id, date)
);
alter table public.streaks enable row level security;
drop policy if exists "Users can view their own streaks" on public.streaks;
create policy "Users can view their own streaks" on public.streaks for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own streaks" on public.streaks;
create policy "Users can insert their own streaks" on public.streaks for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own streaks" on public.streaks;
create policy "Users can update their own streaks" on public.streaks for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own streaks" on public.streaks;
create policy "Users can delete their own streaks" on public.streaks for delete using (auth.uid() = user_id);

-- 6. DAILY TODOS
create table if not exists public.daily_todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  category text not null default 'COMMON', -- 'COMMON', 'DSA'
  task text not null,
  priority text not null default 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
  is_done boolean default false,
  created_at timestamptz default now()
);
alter table public.daily_todos enable row level security;
drop policy if exists "Users can view their own daily_todos" on public.daily_todos;
create policy "Users can view their own daily_todos" on public.daily_todos for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own daily_todos" on public.daily_todos;
create policy "Users can insert their own daily_todos" on public.daily_todos for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own daily_todos" on public.daily_todos;
create policy "Users can update their own daily_todos" on public.daily_todos for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own daily_todos" on public.daily_todos;
create policy "Users can delete their own daily_todos" on public.daily_todos for delete using (auth.uid() = user_id);

-- 7. TODO TAGS
create table if not exists public.todo_tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  color text not null default '#f97316',
  created_at timestamptz default now()
);
alter table public.todo_tags enable row level security;
drop policy if exists "Users can view their own todo_tags" on public.todo_tags;
create policy "Users can view their own todo_tags" on public.todo_tags for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own todo_tags" on public.todo_tags;
create policy "Users can insert their own todo_tags" on public.todo_tags for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own todo_tags" on public.todo_tags;
create policy "Users can update their own todo_tags" on public.todo_tags for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own todo_tags" on public.todo_tags;
create policy "Users can delete their own todo_tags" on public.todo_tags for delete using (auth.uid() = user_id);

-- 8. CHECKLIST TODOS (tag-based todos)
create table if not exists public.checklist_todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  tag_id uuid references public.todo_tags(id) on delete cascade not null,
  date date not null,
  task text not null,
  is_done boolean default false,
  original_date date not null,
  created_at timestamptz default now()
);
alter table public.checklist_todos enable row level security;
drop policy if exists "Users can view their own checklist_todos" on public.checklist_todos;
create policy "Users can view their own checklist_todos" on public.checklist_todos for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own checklist_todos" on public.checklist_todos;
create policy "Users can insert their own checklist_todos" on public.checklist_todos for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own checklist_todos" on public.checklist_todos;
create policy "Users can update their own checklist_todos" on public.checklist_todos for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own checklist_todos" on public.checklist_todos;
create policy "Users can delete their own checklist_todos" on public.checklist_todos for delete using (auth.uid() = user_id);

-- 9. STAT DEFINITIONS (custom stats)
create table if not exists public.stat_definitions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  label text not null,
  type text not null default 'number', -- 'number', 'range', 'boolean'
  emoji text,
  color text,
  created_at timestamptz default now()
);
alter table public.stat_definitions enable row level security;
drop policy if exists "Users can view their own stat definitions" on public.stat_definitions;
create policy "Users can view their own stat definitions" on public.stat_definitions for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own stat definitions" on public.stat_definitions;
create policy "Users can insert their own stat definitions" on public.stat_definitions for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own stat definitions" on public.stat_definitions;
create policy "Users can update their own stat definitions" on public.stat_definitions for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own stat definitions" on public.stat_definitions;
create policy "Users can delete their own stat definitions" on public.stat_definitions for delete using (auth.uid() = user_id);

-- 10. DAILY STAT VALUES
create table if not exists public.daily_stat_values (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  stat_def_id uuid references public.stat_definitions(id) on delete cascade not null,
  value numeric,
  created_at timestamptz default now(),
  unique(user_id, date, stat_def_id)
);
alter table public.daily_stat_values enable row level security;
drop policy if exists "Users can view their own stat values" on public.daily_stat_values;
create policy "Users can view their own stat values" on public.daily_stat_values for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own stat values" on public.daily_stat_values;
create policy "Users can insert their own stat values" on public.daily_stat_values for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own stat values" on public.daily_stat_values;
create policy "Users can update their own stat values" on public.daily_stat_values for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own stat values" on public.daily_stat_values;
create policy "Users can delete their own stat values" on public.daily_stat_values for delete using (auth.uid() = user_id);

-- 11. PLANS
create table if not exists public.plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Safe column addition
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'plans' and column_name = 'description') then
    alter table public.plans add column description text;
  end if;
end $$;

alter table public.plans enable row level security;
drop policy if exists "Users can view their own plans" on public.plans;
create policy "Users can view their own plans" on public.plans for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own plans" on public.plans;
create policy "Users can insert their own plans" on public.plans for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own plans" on public.plans;
create policy "Users can update their own plans" on public.plans for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own plans" on public.plans;
create policy "Users can delete their own plans" on public.plans for delete using (auth.uid() = user_id);
