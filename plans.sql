-- Create plans table if not exists
create table if not exists public.plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Safe column addition (in case table existed without description)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'plans' and column_name = 'description') then
    alter table public.plans add column description text;
  end if;
end $$;

-- Enable RLS
alter table public.plans enable row level security;

-- Re-create Policies (Drop first to avoid errors)
drop policy if exists "Users can view their own plans" on public.plans;
create policy "Users can view their own plans" on public.plans
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own plans" on public.plans;
create policy "Users can insert their own plans" on public.plans
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own plans" on public.plans;
create policy "Users can update their own plans" on public.plans
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own plans" on public.plans;
create policy "Users can delete their own plans" on public.plans
  for delete using (auth.uid() = user_id);
