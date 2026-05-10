-- ─────────────────────────────────────────────────────────────────────────────
-- Henry — Supabase schema
--
-- Run this against your Supabase project (SQL Editor → New query → Run).
-- Tables map 1:1 to the TypeScript types in src/lib/types.ts.
-- Row Level Security is enabled and policies restrict access to a user's
-- own workspaces.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── workspaces ──────────────────────────────────────────────────────────────
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text,
  brand_voice text,
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

create policy "workspaces are visible to their owner"
  on public.workspaces for select using (auth.uid() = owner_id);
create policy "workspaces can be inserted by their owner"
  on public.workspaces for insert with check (auth.uid() = owner_id);
create policy "workspaces can be updated by their owner"
  on public.workspaces for update using (auth.uid() = owner_id);
create policy "workspaces can be deleted by their owner"
  on public.workspaces for delete using (auth.uid() = owner_id);

-- ── helper: workspace ownership ─────────────────────────────────────────────
create or replace function public.is_workspace_member(workspace_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = auth.uid()
  );
$$;

-- ── memory_items ────────────────────────────────────────────────────────────
create table if not exists public.memory_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null check (category in
    ('business','brand','services','pricing','client','links','other')),
  pinned boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.memory_items enable row level security;
create policy "memory_items workspace access" on public.memory_items
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- ── tasks ───────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending'
    check (status in ('pending','in_progress','completed')),
  priority text not null default 'medium'
    check (priority in ('low','medium','high')),
  due_date timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
create policy "tasks workspace access" on public.tasks
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- ── deliverables ────────────────────────────────────────────────────────────
create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  kind text not null check (kind in
    ('report','social_post','email','sop','client_note','marketing_plan',
     'financial_summary','other')),
  body text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.deliverables enable row level security;
create policy "deliverables workspace access" on public.deliverables
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- ── messages ────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  thread_id uuid not null,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_thread_idx
  on public.messages (thread_id, created_at);
alter table public.messages enable row level security;
create policy "messages workspace access" on public.messages
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- ── integrations ────────────────────────────────────────────────────────────
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null check (provider in
    ('gmail','google_drive','canva','quickbooks','xero')),
  status text not null default 'not_connected'
    check (status in ('not_connected','coming_soon','connected')),
  -- Encrypted at rest by Supabase. Replace with a vault in production.
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (workspace_id, provider)
);
alter table public.integrations enable row level security;
create policy "integrations workspace access" on public.integrations
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- ── usage_logs ──────────────────────────────────────────────────────────────
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null check (kind in ('chat','deliverable','task_suggestion')),
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.usage_logs enable row level security;
create policy "usage_logs workspace access" on public.usage_logs
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- ── auto-update timestamps on tasks ─────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

drop trigger if exists memory_touch on public.memory_items;
create trigger memory_touch before update on public.memory_items
  for each row execute function public.touch_updated_at();
